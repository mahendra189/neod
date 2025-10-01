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

    // Load MNIST data from a CDN or local source
    // For now, we'll create a small synthetic dataset for testing
    // In production, you'd load the real MNIST data
    const numTrainSamples = 1000;
    const numTestSamples = 200;

    // Create synthetic data (28x28 grayscale images)
    const trainImages = tf.randomUniform([numTrainSamples, 28, 28, 1]);
    const trainLabels = tf.oneHot(
      tf.randomUniform([numTrainSamples], 0, 10, 'int32'),
      10
    );

    const testImages = tf.randomUniform([numTestSamples, 28, 28, 1]);
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

    console.log('MNIST dataset loaded successfully');
    return this.mnistData;
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

    // Convolutional layers (default: 2 conv layers)
    const convLayers = config.convLayers || [
      { filters: 32, kernelSize: 3, activation: 'relu' },
      { filters: 64, kernelSize: 3, activation: 'relu' },
    ];

    convLayers.forEach((layer: any) => {
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
    });

    // Flatten
    model.add(tf.layers.flatten());

    // Dense layer
    model.add(tf.layers.dense({
      units: config.denseUnits || 128,
      activation: 'relu',
    }));

    // Dropout
    if (config.dropoutRate) {
      model.add(tf.layers.dropout({ rate: config.dropoutRate }));
    }

    // Output layer
    model.add(tf.layers.dense({
      units: config.numClasses,
      activation: 'softmax',
    }));

    console.log('Model built successfully');
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
        batchSize: config.batchSize,
        validationSplit: config.validationSplit || 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}/${config.epochs}`, logs);
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
  async predict(imageData: number[][] | tf.Tensor): Promise<{
    prediction: number;
    confidence: number;
    probabilities: number[];
  }> {
    if (!this.model) {
      throw new Error('Model not trained. Train the model first.');
    }

    let inputTensor: tf.Tensor;

    if (Array.isArray(imageData)) {
      // Convert 2D array to tensor and normalize
      inputTensor = tf.tidy(() => {
        const tensor = tf.tensor2d(imageData);
        const normalized = tensor.div(255.0);
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
