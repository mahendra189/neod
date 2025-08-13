import { Node, Edge } from 'reactflow';

// We'll dynamically import TensorFlow.js to avoid SSR issues
let tf: typeof import('@tensorflow/tfjs');
let tfvis: typeof import('@tensorflow/tfjs-vis');

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

export async function buildTfModel(nodes: Node[], edges: Edge[]) {
  const libs = await initTF();
  if (!libs) return null;
  const { tf } = libs;
  
  const model = tf.sequential();
  
  // Sort nodes by their connections to ensure proper layer order
  const sortedNodes = sortNodesByConnections(nodes, edges);

  // Find input shape from the first layer or use default
  let inputShape: number[] = [2]; // Default for XOR dataset
  const firstNode = sortedNodes[0];
  if (firstNode?.data?.inputShape) {
    inputShape = firstNode.data.inputShape;
  } else if (firstNode?.type === 'algorithm' && firstNode.data.algorithmType === 'cnn') {
    inputShape = [28, 28, 1]; // Default for CNN (e.g., MNIST)
  }

  let isFirstLayer = true;
  for (const node of sortedNodes) {
    const type = node.type;
    const data = node.data;

    switch (type) {
      case 'denseHidden':
      case 'neuralLayer':
        const units = data.neurons || 64;
        const activation = data.activation || 'relu';
        if (isFirstLayer) {
          model.add(tf.layers.dense({ units, activation, inputShape }));
        } else {
          model.add(tf.layers.dense({ units, activation }));
        }
        break;

      case 'dropout':
        const rate = data.rate || 0.2;
        model.add(tf.layers.dropout({ rate }));
        break;

      case 'algorithm':
        if (data.algorithmType === 'cnn') {
          const filters = data.params?.filters || [32, 64];
          const kernelSize = data.params?.kernel_size || 3;
          const poolSize = data.params?.pool_size || 2;

          filters.forEach((f: number, index: number) => {
            if (index === 0 && isFirstLayer) {
              // First CNN layer needs inputShape
              model.add(tf.layers.conv2d({
                filters: f,
                kernelSize,
                activation: 'relu',
                inputShape: [28, 28, 1] // For image data
              }));
            } else {
              model.add(tf.layers.conv2d({
                filters: f,
                kernelSize,
                activation: 'relu'
              }));
            }
            model.add(tf.layers.maxPooling2d({ poolSize }));
          });
        }
        break;
    }
    isFirstLayer = false;
  }

  return model;
}

function sortNodesByConnections(nodes: Node[], edges: Edge[]): Node[] {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize graphs
  nodes.forEach(node => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build adjacency list and count incoming edges
  edges.forEach(edge => {
    const source = edge.source;
    const target = edge.target;
    graph.get(source)?.push(target);
    inDegree.set(target, (inDegree.get(target) || 0) + 1);
  });

  // Topological sort
  const queue: string[] = [];
  const sorted: Node[] = [];

  // Start with nodes that have no incoming edges
  nodes.forEach(node => {
    if ((inDegree.get(node.id) || 0) === 0) {
      queue.push(node.id);
    }
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentNode = nodeMap.get(currentId);
    if (currentNode) {
      sorted.push(currentNode);
    }

    graph.get(currentId)?.forEach(neighborId => {
      inDegree.set(neighborId, (inDegree.get(neighborId) || 0) - 1);
      if ((inDegree.get(neighborId) || 0) === 0) {
        queue.push(neighborId);
      }
    });
  }

  return sorted;
}

interface TFTensor {
  shape: number[];
  dtype: string;
  size: number;
  strides: number[];
  dataId: {};
  id: number;
  rankType: string;
}

export async function trainModel(
  model: any,
  dataset: { xs: TFTensor; ys: TFTensor },
  optimizer: { type: string; params: any },
  loss: { type: string },
  epochs = 10,
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
    type: lossNode?.data.lossType || 'categoricalCrossentropy'
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
