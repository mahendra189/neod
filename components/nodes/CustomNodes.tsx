import NeuralLayerNode from './NodeTypes/NeuralLayerNode';
import DatabaseConfigNode from './NodeTypes/DatabaseConfigNode';
import DatasetNode from './NodeTypes/DatasetNode';
import DataPreprocessingNode from './NodeTypes/DataPreprocessingNode';
import BaseNode from './NodeTypes/BaseNode';
import DropoutNode from './NodeTypes/DropoutNode';
import InputOutputNode from './NodeTypes/InputOutputNode';
import DenseHiddenNode from './NodeTypes/DenseHiddenNode';
import TextInput from './NodeTypes/TextInput';
import TextOutput from './NodeTypes/TextOutput';
import GraphNode from './NodeTypes/GraphNode';
import OptimizerNode from './NodeTypes/OptimizerNode';
import AlgorithmNode from './NodeTypes/AlgorithmNode';
import LossNode from './NodeTypes/LossNode';
import SchedulerNode from './NodeTypes/SchedulerNode';
import TrainingConfigNode from './NodeTypes/TrainingConfigNode';
import MetricsNode from './NodeTypes/MetricsNode';
import DigitDrawerNode from './NodeTypes/DigitDrawerNode';

// Export a map of node types for React Flow
const nodeTypes = {
  neuralLayer: NeuralLayerNode,
  databaseConfig: DatabaseConfigNode,
  dataset: DatasetNode,
  dataPreprocessing: DataPreprocessingNode,
  base: BaseNode,
  dropout: DropoutNode,
  inputOutput: InputOutputNode,
  denseHidden: DenseHiddenNode,
  textInput: TextInput,
  textOutput: TextOutput,
  graph: GraphNode,
  optimizer: OptimizerNode,
  algorithm: AlgorithmNode,
  loss: LossNode,
  scheduler: SchedulerNode,
  trainingConfig: TrainingConfigNode,
  metrics: MetricsNode,
  digitDrawer: DigitDrawerNode,
};


export default nodeTypes;


