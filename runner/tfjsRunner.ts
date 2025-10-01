import * as tf from '@tensorflow/tfjs';

import EventEmitter from 'events';

export type RunnerMode = 'train' | 'inference';
export type DatasetType = 'mnist' | 'cifar10' | 'iris' | 'csv';

export interface RunnerOptions {
  mode: RunnerMode;
  networkJson: any; // exported from FlowCanvas
  dataset: DatasetType | File;
  epochs?: number;
  batchSize?: number;
  onEpochEnd?: (epoch: number, logs: tf.Logs) => void;
  onNodeExecute?: (nodeId: string, info: any) => void;
  onProgress?: (progress: number) => void;
  onError?: (err: Error) => void;
  onComplete?: (result: any) => void;
  onWarning?: (msg: string) => void;
}

export class TfjsRunner extends EventEmitter {
  private model: tf.LayersModel | null = null;
  private stopRequested = false;
  private paused = false;
  private pausePromise: Promise<void> | null = null;
  private pauseResolve: (() => void) | null = null;

  constructor() {
    super();
  }

  async run(options: RunnerOptions) {
    this.stopRequested = false;
    this.paused = false;
    this.model = null;
    try {
      // 1. Build model from JSON
      this.model = this.buildModel(options.networkJson);
      // 2. Load dataset
      const dataset = await this.loadDataset(options.dataset);
      // 3. Run mode
      if (options.mode === 'train') {
        await this.trainModel(dataset, options);
      } else {
        await this.runInference(dataset, options);
      }
      this.emit('complete');
      options.onComplete?.(null);
    } catch (err: any) {
      this.emit('error', err);
      options.onError?.(err);
    }
  }

  pause() {
    this.paused = true;
    this.pausePromise = new Promise(resolve => {
      this.pauseResolve = resolve;
    });
    this.emit('paused');
  }

  resume() {
    if (this.paused && this.pauseResolve) {
      this.paused = false;
      this.pauseResolve();
      this.emit('resumed');
    }
  }

  stop() {
    this.stopRequested = true;
    this.emit('stopped');
  }

  getModel(): tf.LayersModel | null {
    return this.model;
  }

  private async checkPaused() {
    if (this.paused && this.pausePromise) {
      await this.pausePromise;
    }
  }

  private buildModel(networkJson: any): tf.LayersModel {
    // Convert FlowCanvas JSON to tf.Model (Sequential or Functional)
    // Only basic Sequential support for now
    const { nodes, edges } = networkJson;
    // Sort nodes by edges (simple topological sort for sequential)
    const sortedNodes = this.topologicalSort(nodes, edges);
    const layers: tf.layers.Layer[] = [];
    let inputShape: number[] | undefined = undefined;
    for (const node of sortedNodes) {
      let layer: tf.layers.Layer | null = null;
      const params = node.data?.params || {};
      switch (node.type) {
        case 'inputLayer':
          inputShape = params.shape || [100];
          break;
        case 'dense':
          layer = tf.layers.dense({
            units: params.units || 32,
            activation: params.activation || 'relu',
            inputShape: inputShape,
          });
          inputShape = undefined;
          break;
        case 'outputLayer':
          layer = tf.layers.dense({
            units: params.units || 1,
            activation: params.activation || 'sigmoid',
          });
          break;
        // Add more layer types as needed
        default:
          break;
      }
      if (layer) {
        layers.push(layer);
        this.emit('nodeExecute', node.id, { type: node.type, params });
      }
    }
    if (layers.length === 0) throw new Error('No layers defined');
    const model = tf.sequential({ layers });
    return model;
  }

  private topologicalSort(nodes: any[], edges: any[]): any[] {
    // For simple sequential, sort by left-to-right edge order
    // For now, just return nodes in order of appearance
    return nodes;
  }

  private async loadDataset(dataset: DatasetType | File): Promise<any> {
    // Limit size for safety
    if (typeof dataset === 'string') {
      switch (dataset) {
        case 'mnist':
          // @ts-ignore
          const mnist = await import('mnist');
          const set = mnist.set(1000, 200); // limit for browser
          return {
            xTrain: tf.tensor2d(set.training.map((d: any) => d.input)),
            yTrain: tf.tensor2d(set.training.map((d: any) => d.output)),
            xTest: tf.tensor2d(set.test.map((d: any) => d.input)),
            yTest: tf.tensor2d(set.test.map((d: any) => d.output)),
          };
        case 'iris':
          // @ts-ignore
          const iris = await import('ml-dataset-iris');
          const irisData = iris.getNumbers();
          const irisLabels = iris.getClasses().map((c: string) => {
            if (c === 'setosa') return [1, 0, 0];
            if (c === 'versicolor') return [0, 1, 0];
            return [0, 0, 1];
          });
          const idxArr = Array.from(tf.util.createShuffledIndices(irisData.length));
          const x = idxArr.map(i => irisData[i]);
          const y = idxArr.map(i => irisLabels[i]);
          const split = Math.floor(x.length * 0.8);
          return {
            xTrain: tf.tensor2d(x.slice(0, split)),
            yTrain: tf.tensor2d(y.slice(0, split)),
            xTest: tf.tensor2d(x.slice(split)),
            yTest: tf.tensor2d(y.slice(split)),
          };
        // Add CIFAR-10 or other datasets as needed
        default:
          throw new Error('Unsupported built-in dataset');
      }
    } else if (dataset instanceof File) {
      // Parse CSV file
      const text = await dataset.text();
      const rows = text.split(/\r?\n/).filter(Boolean).map(r => r.split(','));
      if (rows.length < 2) throw new Error('CSV too small');
      const x: number[][] = [];
      const y: number[][] = [];
      for (const row of rows) {
        const nums = row.map(Number);
        x.push(nums.slice(0, -1));
        y.push([nums[nums.length - 1]]);
      }
      // Limit to 2000 samples for safety
      if (x.length > 2000) throw new Error('CSV too large');
      const split = Math.floor(x.length * 0.8);
      return {
        xTrain: tf.tensor2d(x.slice(0, split)),
        yTrain: tf.tensor2d(y.slice(0, split)),
        xTest: tf.tensor2d(x.slice(split)),
        yTest: tf.tensor2d(y.slice(split)),
      };
    }
    throw new Error('Invalid dataset');
  }

  private async trainModel(dataset: any, options: RunnerOptions) {
    if (!this.model) throw new Error('Model not built');
    // Safety: warn if model is too large
    const paramCount = this.model.countParams();
    if (paramCount > 2e6) {
      this.emit('warning', 'Model has >2M parameters. Training may be slow or crash the browser.');
      options.onWarning?.('Model has >2M parameters. Training may be slow or crash the browser.');
    }
    // Compile model
    this.model.compile({
      optimizer: tf.train.adam(),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
    const epochs = Math.min(options.epochs || 5, 20);
    const batchSize = Math.min(options.batchSize || 32, 128);
    await this.model.fit(dataset.xTrain, dataset.yTrain, {
      epochs,
      batchSize,
      validationData: [dataset.xTest, dataset.yTest],
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          const safeLogs = logs || {};
          this.emit('epochEnd', epoch, safeLogs);
          options.onEpochEnd?.(epoch, safeLogs);
          if (this.stopRequested) throw new Error('Training stopped');
          await this.checkPaused();
        },
        onBatchEnd: async (batch, logs) => {
          const safeLogs = logs || {};
          this.emit('batchEnd', batch, safeLogs);
          options.onProgress?.(batch / (dataset.xTrain.shape[0] / batchSize));
          await this.checkPaused();
        },
      },
    });
  }

  private async runInference(dataset: any, options: RunnerOptions) {
    if (!this.model) throw new Error('Model not built');
    this.emit('inferenceStart');
    // Limit to 10 samples for preview
    const x = dataset.xTest.slice([0, 0], [10, dataset.xTest.shape[1]]);
    // Step through each layer for animation
    let input = x;
    for (let i = 0; i < (this.model as any).layers.length; ++i) {
      const layer = (this.model as any).layers[i];
      input = await layer.apply(input) as tf.Tensor;
      // Emit node execution event with tensor preview
      this.emit('nodeExecute', layer.name, {
        type: layer.getClassName(),
        output: input.arraySync(),
      });
      options.onNodeExecute?.(layer.name, {
        type: layer.getClassName(),
        output: input.arraySync(),
      });
      await this.checkPaused();
      if (this.stopRequested) break;
    }
    this.emit('inferenceEnd');
  }
}

export default TfjsRunner;
