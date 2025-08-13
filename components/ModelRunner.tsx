import { useCallback, useRef, useState } from 'react';
import { useReactFlow } from 'reactflow';
import dynamic from 'next/dynamic';
import { buildTfModel, trainModel, getOptimizer, getLoss, loadDummyData, loadFromFile, getTrainConfig } from '../utils/tfModelBuilder';
import { Button } from '@heroui/react';
import { Play, Upload } from 'lucide-react';
import TrainingVizModal from './TrainingVizModal';

interface TFTensor {
  shape: number[];
  dtype: string;
  size: number;
  strides: number[];
  dataId: {};
  id: number;
  rankType: string;
}

// The actual component implementation
function ModelRunnerComponent() {
  const { getNodes, getEdges } = useReactFlow();
  const [isTraining, setIsTraining] = useState(false);
  const [showVizModal, setShowVizModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRun = useCallback(async (dataset?: { xs: TFTensor; ys: TFTensor } | null) => {
    try {
      setIsTraining(true);
      
      // Get current nodes and edges
      const nodes = getNodes();
      const edges = getEdges();

      // Build the model from the graph
      const model = await buildTfModel(nodes, edges);
      if (!model) {
        console.error('Failed to build model');
        return;
      }
      
      // Load dataset or use provided one
      const data = dataset || await loadDummyData();
      if (!data) {
        console.error('Failed to load data');
        return;
      }
      
      // Get optimizer and loss configurations
      const optimizer = getOptimizer(nodes);
      const loss = getLoss(nodes);
      const config = getTrainConfig(nodes);

      // Train the model
      await trainModel(model, data, optimizer, loss,config.epochs,config.batch_size);

      console.log('Training completed successfully');
    } catch (error) {
      console.error('Error training model:', error);
    } finally {
      setIsTraining(false);
    }
  }, [getNodes, getEdges]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataset = await loadFromFile(file);
      handleRun(dataset);
    } catch (error) {
      console.error('Error loading dataset:', error);
    }
  }, [handleRun]);

  return (
    <div className="space-y-2">
      <Button
        onClick={async () => {
          setShowVizModal(true);
          await handleRun();
        }}
        className="w-full flex items-center justify-center gap-2"
        color="primary"
        disabled={isTraining}
      >
        <Play className="w-4 h-4" />
        {isTraining ? 'Training...' : 'Run Model'}
      </Button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        className="hidden"
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2"
        color="default"
      >
        <Upload className="w-4 h-4" />
        Upload Data

      <TrainingVizModal 
        isOpen={showVizModal}
        onClose={() => setShowVizModal(false)}
      />
      </Button>
    </div>
  );
}

// Export the component wrapped in dynamic import with no SSR
export const ModelRunner = dynamic(
  () => Promise.resolve(ModelRunnerComponent),
  { ssr: false }
);
