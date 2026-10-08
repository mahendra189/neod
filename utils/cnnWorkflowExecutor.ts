import { Node, Edge } from 'reactflow';
import CNNTrainer from '../runner/cnnTrainer';

export interface WorkflowExecutionState {
  isRunning: boolean;
  currentEpoch: number;
  totalEpochs: number;
  trainingHistory: Array<{
    epoch: number;
    loss: number;
    accuracy: number;
    valLoss?: number;
    valAccuracy?: number;
  }>;
  error: string | null;
}

export class CNNWorkflowExecutor {
  private trainer: CNNTrainer;
  private nodes: Node[];
  private edges: Edge[];
  private state: WorkflowExecutionState;
  private onStateUpdate?: (state: WorkflowExecutionState) => void;

  constructor(nodes: Node[], edges: Edge[], onStateUpdate?: (state: WorkflowExecutionState) => void) {
    this.trainer = new CNNTrainer();
    this.nodes = nodes;
    this.edges = edges;
    this.onStateUpdate = onStateUpdate;
    this.state = {
      isRunning: false,
      currentEpoch: 0,
      totalEpochs: 0,
      trainingHistory: [],
      error: null,
    };
  }

  /**
   * Extract configuration from workflow nodes
   */
  private extractWorkflowConfig() {
    // Find dataset node
    const datasetNode = this.nodes.find(n => n.type === 'mnistDataset' || n.type === 'dataset');
    
    // Find CNN algorithm node
    const cnnNode = this.nodes.find(n => n.type === 'algorithm' || n.type === 'cnn');
    
    // Find optimizer node
    const optimizerNode = this.nodes.find(n => n.type === 'optimizer');
    
    // Find loss node
    const lossNode = this.nodes.find(n => n.type === 'loss');
    
    // Find training config node
    const trainingConfigNode = this.nodes.find(n => n.type === 'trainingConfig');
    
    // Find scheduler node
    const schedulerNode = this.nodes.find(n => n.type === 'scheduler');

    // Extract CNN architecture
    const cnnParams = cnnNode?.data?.params || {};
    const convLayers = cnnParams.layers || [
      { filters: 32, kernelSize: 3, activation: 'relu' },
      { filters: 64, kernelSize: 3, activation: 'relu' },
    ];

    // Extract optimizer config with better defaults
    const optimizerType = optimizerNode?.data?.optimizerType || 'adam';
    const optimizerParams = optimizerNode?.data?.params || {};
    const learningRate = optimizerParams.lr || 0.001; // Good default for Adam

    // Extract loss function
    const lossType = lossNode?.data?.lossType || 'crossentropy';

    // Extract training config with better defaults for MNIST
    const trainingParams = trainingConfigNode?.data?.params || {};
    const epochs = trainingParams.epochs || 15; // Increased from 10
    const batchSize = trainingParams.batchSize || 128; // Increased from 32 for better stability
    const validationSplit = trainingParams.validationSplit || 0.1; // Reduced validation split

    return {
      model: {
        inputShape: [28, 28, 1] as [number, number, number],
        numClasses: 10,
        convLayers: convLayers.filter((l: any) => l.type === 'conv2d' || l.filters),
        denseUnits: 128,
        dropoutRate: 0.5,
      },
      optimizer: {
        type: optimizerType,
        learningRate,
      },
      loss: lossType === 'crossentropy' ? 'categoricalCrossentropy' : 'categoricalCrossentropy',
      training: {
        epochs,
        batchSize,
        validationSplit,
      },
    };
  }

  /**
   * Update node data in the workflow
   */
  private updateNodeData(nodeId: string, data: any) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.data = { ...node.data, ...data };
    }
  }

  /**
   * Find nodes of specific type
   */
  private findNodesByType(type: string): Node[] {
    return this.nodes.filter(n => n.type === type);
  }

  /**
   * Update training visualizer node
   */
  private updateTrainingVisualizer(epoch: number, logs: any) {
    const visualizerNodes = this.findNodesByType('trainingVisualizer');
    
    visualizerNodes.forEach(node => {
      const history = [...(node.data.trainingHistory || [])];
      history.push({
        epoch: epoch + 1,
        loss: logs.loss,
        accuracy: logs.acc,
        valLoss: logs.val_loss,
        valAccuracy: logs.val_acc,
      });

      this.updateNodeData(node.id, {
        trainingHistory: history,
        currentEpoch: epoch + 1,
        totalEpochs: this.state.totalEpochs,
        isTraining: true,
      });
    });
  }

  /**
   * Update CNN algorithm node with training progress
   */
  private updateCNNAlgorithmNode(epoch: number, logs: any) {
    const cnnNodes = this.findNodesByType('algorithm');
    
    cnnNodes.forEach(node => {
      this.updateNodeData(node.id, {
        currentEpoch: epoch + 1,
        totalEpochs: this.state.totalEpochs,
        isTraining: true,
        trainingMetrics: {
          loss: logs.loss,
          accuracy: logs.acc,
          valLoss: logs.val_loss,
          valAccuracy: logs.val_acc,
        },
        trainingProgress: ((epoch + 1) / this.state.totalEpochs) * 100,
      });
    });
  }

  /**
   * Update all neural network nodes with training progress
   */
  private updateNeuralNetworkNodes(epoch: number, logs: any) {
    const neuralNodeTypes = ['neuralLayer', 'denseHidden'];
    
    neuralNodeTypes.forEach(nodeType => {
      const nodes = this.findNodesByType(nodeType);
      nodes.forEach(node => {
        this.updateNodeData(node.id, {
          currentEpoch: epoch + 1,
          totalEpochs: this.state.totalEpochs,
          isTraining: true,
          trainingProgress: ((epoch + 1) / this.state.totalEpochs) * 100,
        });
      });
    });
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<WorkflowExecutionState>) {
    this.state = { ...this.state, ...updates };
    if (this.onStateUpdate) {
      this.onStateUpdate(this.state);
    }
  }

  /**
   * Execute the workflow
   */
  async execute(): Promise<void> {
    try {
      this.updateState({ isRunning: true, error: null });

      // Extract configuration from workflow
      const config = this.extractWorkflowConfig();
      this.updateState({ totalEpochs: config.training.epochs });

      // Load data
      console.log('Loading MNIST data...');
      await this.trainer.loadMNISTData();

      // Update dataset node
      const datasetNodes = this.findNodesByType('mnistDataset');
      datasetNodes.forEach(node => {
        this.updateNodeData(node.id, {
          dataLoaded: true,
          trainSize: 60000,
          testSize: 10000,
        });
      });

      // Build model
      console.log('Building model...');
      this.trainer.buildModel(config.model);

      // Compile model
      console.log('Compiling model...');
      this.trainer.compileModel({
        optimizer: config.optimizer.type,
        learningRate: config.optimizer.learningRate,
        loss: config.loss,
        metrics: ['accuracy'],
      });

      // Train model
      console.log('Training model...');
      await this.trainer.train(
        {
          ...config.training,
          learningRate: config.optimizer.learningRate,
        },
        {
          onTrainBegin: () => {
            console.log('Training started');
          },
          onEpochEnd: (epoch, logs) => {
            this.updateState({
              currentEpoch: epoch + 1,
              trainingHistory: [
                ...this.state.trainingHistory,
                {
                  epoch: epoch + 1,
                  loss: logs?.loss || 0,
                  accuracy: logs?.acc || 0,
                  valLoss: logs?.val_loss,
                  valAccuracy: logs?.val_acc,
                },
              ],
            });

            // Update visualizer nodes
            this.updateTrainingVisualizer(epoch, logs);
            
            // Update CNN algorithm node with real-time training progress
            this.updateCNNAlgorithmNode(epoch, logs);
            
            // Update all neural network nodes with training progress
            this.updateNeuralNetworkNodes(epoch, logs);
          },
          onTrainEnd: () => {
            console.log('Training ended');
          },
        }
      );

      // Evaluate model
      console.log('Evaluating model...');
      const testResults = await this.trainer.evaluate();
      console.log('Test results:', testResults);

      // Mark training as complete
      const visualizerNodes = this.findNodesByType('trainingVisualizer');
      visualizerNodes.forEach(node => {
        this.updateNodeData(node.id, {
          isTraining: false,
        });
      });

      // Mark CNN algorithm nodes as training complete
      const cnnNodes = this.findNodesByType('algorithm');
      cnnNodes.forEach(node => {
        this.updateNodeData(node.id, {
          isTraining: false,
          trainingComplete: true,
        });
      });

      // Mark all neural network nodes as training complete
      const neuralNodeTypes = ['neuralLayer', 'denseHidden'];
      neuralNodeTypes.forEach(nodeType => {
        const nodes = this.findNodesByType(nodeType);
        nodes.forEach(node => {
          this.updateNodeData(node.id, {
            isTraining: false,
            trainingComplete: true,
          });
        });
      });

      this.updateState({ isRunning: false });

      // Save model
      await this.trainer.saveModel();

    } catch (error) {
      console.error('Error during workflow execution:', error);
      this.updateState({
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Stop execution
   */
  stop(): void {
    this.updateState({ isRunning: false });
  }

  /**
   * Make prediction on drawn digit
   */
  async predict(imageData: number[][]): Promise<{
    prediction: number;
    confidence: number;
    probabilities: number[];
  }> {
    if (!this.trainer.getModel()) {
      throw new Error('CNN model is not trained yet. Please train the model first by clicking "Train CNN".');
    }
    return await this.trainer.predict(imageData);
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.trainer.dispose();
  }

  /**
   * Get current state
   */
  getState(): WorkflowExecutionState {
    return this.state;
  }

  /**
   * Get trainer instance for inference
   */
  getTrainer(): CNNTrainer {
    return this.trainer;
  }
}

export default CNNWorkflowExecutor;
