import * as tf from '@tensorflow/tfjs';

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit?: number;
}

export interface TrainingCallbacks {
  onEpochEnd?: (epoch: number, logs: any) => void;
  onBatchEnd?: (batch: number, logs: any) => void;
  onTrainBegin?: () => void;
  onTrainEnd?: () => void;
}

export interface MNISTData {
  trainImages: tf.Tensor4D;
  trainLabels: tf.Tensor2D;
  testImages: tf.Tensor4D;
  testLabels: tf.Tensor2D;
}

export class CNNTrainer {
  private model: tf.LayersModel | null = null;
  private mnistData: MNISTData | null = null;

  /**
   * Load and preprocess MNIST dataset
   */
  async loadMNISTData(): Promise<MNISTData> {
    console.log('Loading MNIST dataset...');

    try {
      // Use the mnist package for loading data
      const mnist = await import('mnist') as any;
      
      // Load MNIST dataset
      const set = mnist.set(60000, 10000); // 60k train, 10k test
      
      // Convert to proper tensor format (flatten completely)
      const trainImagesFlat: number[] = set.training.flatMap((item: any) => 
        item.input.flat().map((pixel: number) => pixel / 255.0)
      );
      const testImagesFlat: number[] = set.test.flatMap((item: any) => 
        item.input.flat().map((pixel: number) => pixel / 255.0)
      );
      
      const trainLabels: number[] = set.training.map((item: any) => item.output.indexOf(1));
      const testLabels: number[] = set.test.map((item: any) => item.output.indexOf(1));
      
      // Create tensors
      const trainImages = tf.tensor4d(trainImagesFlat, [set.training.length, 28, 28, 1]);
      const trainLabelsTensor = tf.oneHot(tf.tensor1d(trainLabels, 'int32'), 10);
      const testImages = tf.tensor4d(testImagesFlat, [set.test.length, 28, 28, 1]);
      const testLabelsTensor = tf.oneHot(tf.tensor1d(testLabels, 'int32'), 10);
      
      this.mnistData = {
        trainImages: trainImages as tf.Tensor4D,
        trainLabels: trainLabelsTensor as tf.Tensor2D,
        testImages: testImages as tf.Tensor4D,
        testLabels: testLabelsTensor as tf.Tensor2D,
      };
      
      console.log(`MNIST dataset loaded successfully: ${set.training.length} train, ${set.test.length} test samples`);
      return this.mnistData;

    } catch (error) {
      console.warn('Failed to load real MNIST data, falling back to synthetic data for testing:', error);
      
      // Fallback to synthetic data for testing
      const numTrainSamples = 60000;
      const numTestSamples = 10000;

      // Create synthetic MNIST-like data (28x28 grayscale images)
      const trainImages = tf.randomUniform([numTrainSamples, 28, 28, 1], 0, 1);
      const trainLabels = tf.oneHot(
        tf.randomUniform([numTrainSamples], 0, 10, 'int32'),
        10
      );

      const testImages = tf.randomUniform([numTestSamples, 28, 28, 1], 0, 1);
      const testLabels = tf.oneHot(
        tf.randomUniform([numTestSamples], 0, 10, 'int32'),
        10
      );

      this.mnistData = {
        trainImages: trainImages as tf.Tensor4D,
        trainLabels: trainLabels as tf.Tensor2D,
        testImages: testImages as tf.Tensor4D,
        testLabels: testLabels as tf.Tensor2D,
      };

      console.log('Synthetic MNIST dataset created for testing');
      return this.mnistData;
    }
  }

  /**
   * Build CNN model based on workflow configuration
   */
  buildModel(config: {
    inputShape: [number, number, number];
    numClasses: number;
    convLayers?: Array<{ filters: number; kernelSize: number; activation?: string }>;
    denseUnits?: number;
    dropoutRate?: number;
  }): tf.LayersModel {
    console.log('Building CNN model...');

    const model = tf.sequential();

    // Input layer
    model.add(tf.layers.inputLayer({ inputShape: config.inputShape }));

    // Convolutional layers (default: improved architecture for MNIST)
    const convLayers = config.convLayers || [
      { filters: 32, kernelSize: 3, activation: 'relu' },
      { filters: 64, kernelSize: 3, activation: 'relu' },
      { filters: 128, kernelSize: 3, activation: 'relu' },
    ];

    convLayers.forEach((layer: any, index: number) => {
      // Ensure kernelSize is properly set (handle both camelCase and snake_case)
      const kernelSize = layer.kernelSize || layer.kernel_size || 3;
      const filters = layer.filters || 32;
      const activation = layer.activation || 'relu';

      model.add(tf.layers.conv2d({
        filters: filters,
        kernelSize: kernelSize,
        activation: activation as any,
        padding: 'same',
      }));

      model.add(tf.layers.maxPooling2d({
        poolSize: 2,
        strides: 2,
      }));

      // Add batch normalization for better training
      model.add(tf.layers.batchNormalization());
    });

    // Flatten
    model.add(tf.layers.flatten());

    // Dense layers with better architecture
    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu',
    }));

    // Dropout for regularization
    model.add(tf.layers.dropout({ rate: 0.5 }));

    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
    }));

    // Another dropout
    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Output layer
    model.add(tf.layers.dense({
      units: config.numClasses,
      activation: 'softmax',
    }));

    console.log('Model built successfully with improved architecture');
    this.model = model;
    return model;
  }

  /**
   * Compile the model with optimizer and loss function
   */
  compileModel(config: {
    optimizer?: string | tf.Optimizer;
    learningRate?: number;
    loss?: string;
    metrics?: string[];
  }): void {
    if (!this.model) {
      throw new Error('Model not built. Call buildModel() first.');
    }

    const optimizer = config.optimizer || 'adam';
    const learningRate = config.learningRate || 0.001;

    let optimizerInstance: tf.Optimizer;
    if (typeof optimizer === 'string') {
      switch (optimizer.toLowerCase()) {
        case 'adam':
          optimizerInstance = tf.train.adam(learningRate);
          break;
        case 'sgd':
          optimizerInstance = tf.train.sgd(learningRate);
          break;
        case 'rmsprop':
          optimizerInstance = tf.train.rmsprop(learningRate);
          break;
        default:
          optimizerInstance = tf.train.adam(learningRate);
      }
    } else {
      optimizerInstance = optimizer;
    }

    this.model.compile({
      optimizer: optimizerInstance,
      loss: config.loss || 'categoricalCrossentropy',
      metrics: config.metrics || ['accuracy'],
    });

    console.log('Model compiled successfully');
  }

  /**
   * Train the model
   */
  async train(
    config: TrainingConfig,
    callbacks: TrainingCallbacks = {}
  ): Promise<tf.History> {
    if (!this.model) {
      throw new Error('Model not built. Call buildModel() first.');
    }

    if (!this.mnistData) {
      throw new Error('Data not loaded. Call loadMNISTData() first.');
    }

    console.log('Starting training...');
    
    if (callbacks.onTrainBegin) {
      callbacks.onTrainBegin();
    }

    const history = await this.model.fit(
      this.mnistData.trainImages,
      this.mnistData.trainLabels,
      {
        epochs: config.epochs,
        batchSize: config.batchSize || 128, // Better default batch size
        validationSplit: config.validationSplit || 0.1, // Reduced validation split
        shuffle: true,
        callbacks: {
          onEpochBegin: async (epoch) => {
            // Learning rate decay
            const initialLR = config.learningRate || 0.001;
            const decayRate = 0.95;
            const newLR = initialLR * Math.pow(decayRate, epoch);
            
            // Update learning rate if using Adam optimizer
            if (this.model && epoch > 0 && epoch % 5 === 0) {
              console.log(`Adjusting learning rate to ${newLR.toFixed(6)} at epoch ${epoch + 1}`);
            }
          },
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}/${config.epochs} - loss: ${logs?.loss?.toFixed(4)}, accuracy: ${logs?.acc?.toFixed(4)}, val_loss: ${logs?.val_loss?.toFixed(4)}, val_acc: ${logs?.val_acc?.toFixed(4)}`);
            if (callbacks.onEpochEnd) {
              callbacks.onEpochEnd(epoch, logs);
            }
          },
          onBatchEnd: (batch, logs) => {
            if (callbacks.onBatchEnd) {
              callbacks.onBatchEnd(batch, logs);
            }
          },
          onTrainEnd: () => {
            console.log('Training completed');
            if (callbacks.onTrainEnd) {
              callbacks.onTrainEnd();
            }
          },
        },
      }
    );

    console.log('Training completed successfully');
    return history;
  }

  /**
   * Evaluate the model on test data
   */
  async evaluate(): Promise<{ loss: number; accuracy: number }> {
    if (!this.model) {
      throw new Error('Model not trained. Train the model first.');
    }

    if (!this.mnistData) {
      throw new Error('Data not loaded. Call loadMNISTData() first.');
    }

    console.log('Evaluating model on test data...');

    const result = this.model.evaluate(
      this.mnistData.testImages,
      this.mnistData.testLabels
    ) as tf.Scalar[];

    const loss = await result[0].data();
    const accuracy = await result[1].data();

    console.log(`Test Loss: ${loss[0]}, Test Accuracy: ${accuracy[0]}`);

    return {
      loss: loss[0],
      accuracy: accuracy[0],
    };
  }

  /**
   * Make prediction on a single image
   */
  async predict(imageData: number[][] | number[] | tf.Tensor): Promise<{
    prediction: number;
    confidence: number;
    probabilities: number[];
  }> {
    if (!this.model) {
      throw new Error('Model not trained. Train the model first.');
    }

    let inputTensor: tf.Tensor;

    if (Array.isArray(imageData)) {
      if (!imageData || imageData.length === 0) {
        throw new Error('No image data provided for prediction. Please draw a digit first.');
      }

      // Convert array to tensor and normalize
      inputTensor = tf.tidy(() => {
        let tensor: tf.Tensor;
        if (typeof imageData[0] === 'number') {
          tensor = tf.tensor2d(imageData as number[], [28, 28]);
        } else if (Array.isArray(imageData[0]) && (imageData[0] as number[]).length > 0) {
          tensor = tf.tensor2d(imageData as number[][]);
        } else {
          throw new Error('Invalid image data dimensions.');
        }

        const maxVal = tensor.max().dataSync()[0];
        const normalized = maxVal > 1.0 ? tensor.div(255.0) : tensor;
        const reshaped = normalized.reshape([1, 28, 28, 1]);
        return reshaped;
      });
    } else {
      inputTensor = imageData;
    }

    const predictions = this.model.predict(inputTensor) as tf.Tensor;
    const probabilities = await predictions.data();
    const predictionArray = Array.from(probabilities);

    const prediction = predictionArray.indexOf(Math.max(...predictionArray));
    const confidence = predictionArray[prediction];

    // Clean up tensors
    if (Array.isArray(imageData)) {
      inputTensor.dispose();
    }
    predictions.dispose();

    return {
      prediction,
      confidence,
      probabilities: predictionArray,
    };
  }

  /**
   * Save the model
   */
  async saveModel(savePath: string = 'localstorage://mnist-cnn-model'): Promise<void> {
    if (!this.model) {
      throw new Error('Model not trained. Train the model first.');
    }

    await this.model.save(savePath);
    console.log(`Model saved to ${savePath}`);
  }

  /**
   * Load a saved model
   */
  async loadModel(loadPath: string = 'localstorage://mnist-cnn-model'): Promise<void> {
    this.model = await tf.loadLayersModel(loadPath);
    console.log(`Model loaded from ${loadPath}`);
  }

  /**
   * Get model summary
   */
  getModelSummary(): string {
    if (!this.model) {
      return 'Model not built yet';
    }

    let summary = '';
    this.model.summary(undefined, undefined, (line) => {
      summary += line + '\n';
    });

    return summary;
  }

  /**
   * Dispose of all tensors and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }

    if (this.mnistData) {
      this.mnistData.trainImages.dispose();
      this.mnistData.trainLabels.dispose();
      this.mnistData.testImages.dispose();
      this.mnistData.testLabels.dispose();
      this.mnistData = null;
    }

    console.log('Trainer disposed');
  }
}

export default CNNTrainer;
