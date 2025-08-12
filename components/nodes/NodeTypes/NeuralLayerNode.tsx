import React, { useState, useEffect, memo } from 'react';
import clsx from 'clsx';
import { Handle, Position } from 'reactflow';

import { NodeProps } from 'reactflow';
const NeuralLayerNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [layers, setLayers] = useState(
    data.layers || [
      { type: 'input', neurons: 2 },
      { type: 'hidden', neurons: 4 },
      { type: 'output', neurons: 1 },
    ]
  );

  const updateLayer = (index: number, key: string, value: any) => {
    if (key === 'neurons') {
      let val = parseInt(value);
      if (isNaN(val) || val < 1) val = 1;
      value = val;
    }
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], [key]: value };
    setLayers(newLayers);
    data.onChange?.(newLayers);
  };

  const addLayer = (index: number) => {
    if (layers.length >= 20) return;
    const newLayers = [...layers];
    newLayers.splice(index + 1, 0, { type: 'hidden', neurons: 4 });
    setLayers(newLayers);
    data.onChange?.(newLayers);
  };

  const removeLayer = (index: number) => {
  const hiddenCount = layers.filter((l: { type: string }) => l.type === 'hidden').length;
    if (layers.length <= 3 || index === 0 || index === layers.length - 1 || (layers[index].type === 'hidden' && hiddenCount <= 1)) return;
    const newLayers = [...layers];
    newLayers.splice(index, 1);
    setLayers(newLayers);
    data.onChange?.(newLayers);
  };

  return (
    <div
      className={clsx(
        'bg-neutral-800 text-white rounded-lg shadow-lg p-3 w-48',
        selected && 'ring-2 ring-blue-400'
      )}
    >
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
  {layers.map((layer: any, idx: number) => {
    const hiddenCount = layers.filter((l: { type: string }) => l.type === 'hidden').length;
        const disableRemove = layers.length <= 3 || idx === 0 || idx === layers.length - 1 || (layer.type === 'hidden' && hiddenCount <= 1);
        const disableAdd = layers.length >= 20;
        return (
          <div
            key={idx}
            className={clsx(
              'flex items-center justify-between p-2 mb-2 rounded',
              layer.type === 'input' && 'bg-blue-600',
              layer.type === 'hidden' && 'bg-purple-600',
              layer.type === 'output' && 'bg-green-600'
            )}
          >
            <span className="text-xs">{layer.type.toUpperCase()}</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={layer.neurons}
              onChange={(e) => updateLayer(idx, 'neurons', e.target.value)}
              className="w-12 bg-transparent text-center text-white border-b border-white focus:outline-none"
            />
            {layer.type === 'hidden' && (
              <>
                <button onClick={() => addLayer(idx)} className="text-xs px-1" disabled={disableAdd}>+</button>
                <button onClick={() => removeLayer(idx)} className="text-xs px-1" disabled={disableRemove}>−</button>
              </>
            )}
          </div>
        );
      })}
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
  );
};

export default memo(NeuralLayerNode);
