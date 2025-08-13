import { Node, Edge } from 'reactflow';

// We'll dynamically import TensorFlow.js to avoid SSR issues
let tf: typeof import('@tensorflow/tfjs');
let tfvis: typeof import('@tensorflow/tfjs-vis');

interface TFTensor {
  shape: number[];
  dtype: string;
  size: number;
  strides: number[];
  dataId: {};
  id: number;
  rankType: string;
}

async function initTF() {
  if (typeof window === 'undefined') return null;
  
  if (!tf) {
    tf = await import('@tensorflow/tfjs');
  }
  if (!tfvis) {
    tfvis = await import('@tensorflow/tfjs-vis');
  }
  return { tf, tfvis };
}

function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  const nodeMap = new Map<string, Node>();
  nodes.forEach(node => nodeMap.set(node.id, node));

  const graph = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  // Initialize graph and in-degree
  nodes.forEach(node => {
    graph.set(node.id, new Set());
    inDegree.set(node.id, 0);
  });

  // Build graph and calculate in-degrees
  edges.forEach(edge => {
    const source = edge.source;
    const target = edge.target;
    if (graph.has(source)) {
      graph.get(source)?.add(target);
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    }
  });

  // Find nodes with 0 in-degree
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  const result: Node[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) {
      result.push(node);
      graph.get(nodeId)?.forEach(neighbor => {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      });
    }
  }

  return result;
}

interface OptimizerConfig {
  type: string;
  learningRate?: number;
  momentum?: number;
  beta1?: number;
  beta2?: number;
  epsilon?: number;
}

type ActivationType = 'relu' | 'sigmoid' | 'softmax' | 'tanh' | 'linear';

interface DenseLayerConfig {
  inputShape?: number[];
  units: number;
  activation: ActivationType;
  kernelInitializer?: string;
}

interface DropoutLayerConfig {
  rate: number;
}

function createOptimizer(tf: any, config: OptimizerConfig): any {
  const { type, learningRate = 0.01, momentum = 0.9, beta1 = 0.9, beta2 = 0.999, epsilon = 1e-7 } = config;
  switch (type.toLowerCase()) {
    case 'sgd':
      return tf.train.sgd(learningRate);
    case 'adam':
      return tf.train.adam(learningRate, beta1, beta2, epsilon);
    case 'rmsprop':
      return tf.train.rmsprop(learningRate);
    case 'momentum':
      return tf.train.momentum(learningRate, momentum);
    default:
      return tf.train.adam(learningRate);
  }
}

export async function buildTfModel(nodes: Node[], edges: Edge[]) {
  const tfLibs = await initTF();
  if (!tfLibs) throw new Error('TensorFlow.js failed to initialize');

  const sortedNodes = topologicalSort(nodes, edges);
  const neuralNode = sortedNodes.find(node => node.type === 'neuralLayer');
  const optimizer = sortedNodes.find(node => node.type == 'optimizer');
  console.log(optimizer)
  if (!neuralNode || !neuralNode.data) {
    throw new Error('Neural network node not found in the graph');
  }

  // Extract the transformed data from the neural node
  const {
    inputLayer,
    hiddenLayers,
    outputLayer,
    loss,
    metrics
  } = neuralNode.data.transformedData || {};

  console.log('Building model with data:', {
    inputLayer,
    hiddenLayers,
    outputLayer,
    loss,
    metrics
  });

  if (!inputLayer || !outputLayer || !hiddenLayers) {
    throw new Error('Neural network configuration is incomplete');
  }

  // Create sequential model
  const sequentialModel = tfLibs.tf.sequential();

  // Add input layer
  if (inputLayer) {
    const inputConfig: DenseLayerConfig = {
      inputShape: [inputLayer.units],
      units: inputLayer.units,
      activation: inputLayer.activation || 'relu'
    };
    sequentialModel.add(tfLibs.tf.layers.dense(inputConfig));
  }

  // Add hidden layers
  if (hiddenLayers && Array.isArray(hiddenLayers)) {
    hiddenLayers.forEach((layer, index) => {
      if (layer.type === 'dense') {
        const config: DenseLayerConfig = {
          units: layer.units,
          activation: layer.activation || 'relu',
          kernelInitializer: 'glorotNormal'
        };
        sequentialModel.add(tfLibs.tf.layers.dense(config));
      } else if (layer.type === 'dropout' && layer.rate) {
        const dropoutConfig: DropoutLayerConfig = {
          rate: layer.rate
        };
        sequentialModel.add(tfLibs.tf.layers.dropout(dropoutConfig));
      }
    });
  }

  // Add output layer
  if (outputLayer) {
    const outputConfig: DenseLayerConfig = {
      units: outputLayer.units,
      activation: outputLayer.activation || 'softmax'
    };
    sequentialModel.add(tfLibs.tf.layers.dense(outputConfig));
  }

  // Get optimizer configuration
  const optimizerConfig: OptimizerConfig = optimizer && optimizer.data
    ? { ...optimizer.data.params, type:optimizer.data.label }
    : {
        type: 'adam',
        learningRate: 0.001
      };
      console.log(optimizerConfig)

  // Compile the model
  sequentialModel.compile({
    optimizer: createOptimizer(tfLibs.tf, optimizerConfig),
    loss: loss || 'categoricalCrossentropy',
    metrics: metrics || ['accuracy']
  });

  return sequentialModel;
}
export async function trainModel(
  model: any,
  dataset: { xs: TFTensor; ys: TFTensor },
  optimizer: { type: string; params: any },
  loss: { type: string },
  epochs = 100,
  batchSize = 32
) {
  const libs = await initTF();
  if (!libs) return null;
  const { tf, tfvis } = libs;

  // Create optimizer based on type
  let optimizerInstance;
  switch (optimizer.type.toLowerCase()) {
    case 'adam':
      optimizerInstance = tf.train.adam(optimizer.params.learningRate);
      break;
    case 'sgd':
      optimizerInstance = tf.train.sgd(optimizer.params.learningRate);
      break;
    case 'rmsprop':
      optimizerInstance = tf.train.rmsprop(optimizer.params.learningRate);
      break;
    default:
      optimizerInstance = tf.train.adam(0.001); // default
  }

  // Compile the model
  model.compile({
    optimizer: optimizerInstance,
    loss: loss.type,
    metrics: ['accuracy']
  });

  // Create the visualization container
  const container = { name: 'Training Performance' };
  const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];

  // Train the model
  await model.fit(dataset.xs, dataset.ys, {
    epochs,
    batchSize,
    validationSplit: 0.2,
    callbacks: tfvis.show.fitCallbacks(
      container,
      metrics,
      { height: 200, callbacks: ['onEpochEnd'] }
    )
  });

  return model;
}

export function getOptimizer(nodes: Node[]) {
  const optimizerNode = nodes.find(n => n.type === 'optimizer');
  return {
    type: optimizerNode?.data.optimizerType || 'adam',
    params: optimizerNode?.data.params || { learningRate: 0.001 }
  };
}

export function getLoss(nodes: Node[]) {
    const lossNode = nodes.find(n => n.type === 'loss');
    return {
        type: lossNode?.data.lossType || 'meanSquaredError' // mse = 'meanSquaredError'
    };
}

export async function loadDummyData() {
  const libs = await initTF();
  if (!libs) return null;
  const { tf } = libs;

  // Create a simple XOR dataset for testing
  const xs = tf.tensor2d([[0, 0], [0, 1], [1, 0], [1, 1]], [4, 2]);
  const ys = tf.tensor2d([[0], [1], [1], [0]], [4, 1]);

  return {
    xs,
    ys
  };
}

export async function loadFromFile(file: File) {
  const libs = await initTF();
  if (!libs) return null;
  const { tf } = libs;

  return new Promise<{ xs: TFTensor; ys: TFTensor } | null>((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      const rows = data.split('\n').filter(row => row.trim());
      
      // Assuming last column is the target
      const values = rows.map(row => row.split(',').map(Number));
      const features = values.map(row => row.slice(0, -1));
      const labels = values.map(row => row.slice(-1));

      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels);

      resolve({ xs, ys });
    };
    reader.readAsText(file);
  });
}
