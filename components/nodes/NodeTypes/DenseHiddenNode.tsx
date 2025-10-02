import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

const DenseHiddenNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [numLayers, setNumLayers] = useState(data.numLayers || 1);
  const [neuronsPerLayer, setNeuronsPerLayer] = useState(data.neuronsPerLayer || 4);

  const handleLayerChange = (delta: number) => {
    const newLayers = Math.max(1, numLayers + delta);
    setNumLayers(newLayers);
    data.onChange?.({ ...data, numLayers: newLayers, neuronsPerLayer });
  };
  const handleNeuronChange = (delta: number) => {
    const newNeurons = Math.max(1, neuronsPerLayer + delta);
    setNeuronsPerLayer(newNeurons);
    data.onChange?.({ ...data, numLayers, neuronsPerLayer: newNeurons });
  };

  useEffect(() => {
    setNumLayers(data.numLayers || 1);
    setNeuronsPerLayer(data.neuronsPerLayer || 4);
  }, [data.numLayers, data.neuronsPerLayer]);

  return (
    <div
      className={clsx(
        'w-40 rounded-lg flex flex-col items-center justify-center shadow-md relative cursor-pointer p-4',
        selected ? 'ring-2 ring-purple-300 shadow-lg' : '',
        data.isTraining ? 'bg-orange-600 animate-pulse' : 'bg-purple-600',
        data.trainingComplete ? 'bg-green-600' : '',
      )}
    >
      <Handle
        className="handle"
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />
      <div className="font-bold text-white mb-2 text-sm flex items-center gap-2">
        Dense/Hidden Layers
        {data.isTraining && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-300 rounded-full animate-ping"></div>
          </div>
        )}
        {data.trainingComplete && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
          </div>
        )}
      </div>
      
      {/* Training Progress */}
      {data.isTraining && data.currentEpoch && data.totalEpochs && (
        <div className="mb-2 w-full">
          <div className="text-xs text-white text-center mb-1">
            Epoch {data.currentEpoch}/{data.totalEpochs}
          </div>
          <div className="w-full bg-white/20 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-300"
              style={{ width: `${data.trainingProgress || 0}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white">Layers</span>
          <button
            className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold"
            onClick={() => handleLayerChange(-1)}
          >
            -
          </button>
          <span className="text-lg font-mono text-white">{numLayers}</span>
          <button
            className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold"
            onClick={() => handleLayerChange(1)}
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white">Neurons/layer</span>
          <button
            className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold"
            onClick={() => handleNeuronChange(-1)}
          >
            -
          </button>
          <span className="text-lg font-mono text-white">{neuronsPerLayer}</span>
          <button
            className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold"
            onClick={() => handleNeuronChange(1)}
          >
            +
          </button>
        </div>
      </div>
      <Handle
        className="handle"
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};

export default React.memo(DenseHiddenNode);
