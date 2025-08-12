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
        'w-40 rounded-lg flex flex-col items-center justify-center shadow-md relative cursor-pointer p-4 bg-purple-600',
        selected ? 'ring-2 ring-purple-300 shadow-lg' : ''
      )}
    >
      <Handle
        className="handle"
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />
      <div className="font-bold text-white mb-2 text-sm">Dense/Hidden Layers</div>
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
