import { buildTfModel } from './tfModelBuilder';
import { Node, Edge } from 'reactflow';

// Import TensorFlow
let tf: typeof import('@tensorflow/tfjs');

async function initTF() {
  if (typeof window === 'undefined') return null;
  if (!tf) {
    tf = await import('@tensorflow/tfjs');
  }
  return tf;
}

async function testModelBuilder() {
  // Initialize TensorFlow
  const tfjs = await initTF();
  if (!tfjs) {
    throw new Error('TensorFlow.js failed to initialize');
  }
  tf = tfjs;
  // Create a test neural network configuration
  const testNodes: Node[] = [
    {
      id: '1',
      type: 'neuralNetwork',
      data: {
        inputLayer: {
          units: 2,
          activation: 'relu'
        },
        hiddenLayers: [
          {
            type: 'dense',
            units: 4,
            activation: 'relu'
          },
          {
            type: 'dropout',
            rate: 0.2
          },
          {
            type: 'dense',
            units: 3,
            activation: 'relu'
          }
        ],
        outputLayer: {
          units: 1,
          activation: 'sigmoid'
        },
        optimizer: {
          type: 'adam',
          params: {
            learningRate: 0.001
          }
        },
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      },
      position: { x: 0, y: 0 }
    }
  ];

  const testEdges: Edge[] = [];

  try {
    console.log('Building model...');
    const model = await buildTfModel(testNodes, testEdges);
    
    // Print model summary
    console.log('Model built successfully!');
    model.summary();

    // Test with some dummy data
    const xs = tf.tensor2d([[0, 0], [0, 1], [1, 0], [1, 1]], [4, 2]);
    const ys = tf.tensor2d([[0], [1], [1], [0]], [4, 1]);

    // Train for a few epochs
    console.log('Training model...');
    await model.fit(xs, ys, {
      epochs: 10,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}, accuracy = ${logs?.accuracy.toFixed(4)}`);
        }
      }
    });

    // Test predictions
    console.log('\nTesting predictions:');
    const predictions = model.predict(xs) as typeof tf.Tensor.prototype;
    const predArray = predictions.arraySync() as number[];
    const inputArray = xs.arraySync() as number[][];
    
    predArray.forEach((pred: number, i: number) => {
      console.log(`Input [${inputArray[i]}] => Prediction: ${pred}`);
    });

  } catch (error) {
    console.error('Error testing model:', error);
  }
}

// Run the test when the page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('Running model builder test...');
    testModelBuilder();
  });
}
