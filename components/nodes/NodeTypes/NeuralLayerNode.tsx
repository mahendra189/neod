import React, { useState, useEffect, memo } from 'react';
import { Button, Modal, ModalContent } from '@heroui/react';
import clsx from 'clsx';
import { Handle, Position } from 'reactflow';

import { NodeProps } from 'reactflow';
import { Icon } from '@iconify/react';

const activationOptions = [
  { value: 'relu', label: 'ReLU' },
  { value: 'sigmoid', label: 'Sigmoid' },
  { value: 'tanh', label: 'Tanh' },
  { value: 'softmax', label: 'Softmax' },
  { value: 'none', label: 'None' },
];

const NeuralLayerNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [layers, setLayers] = useState(
    data.layers || [
      { type: 'input', neurons: 2 },
      { type: 'hidden', neurons: 4 },
      { type: 'output', neurons: 1 },
    ]
  );
  const [showModal, setShowModal] = useState(false);
  // Activations: one between each pair of layers (length = layers.length - 1)
  const [activations, setActivations] = useState(
    data.activations || Array(layers.length - 1).fill('none')
  );

  // Keep activations array in sync with layers
  useEffect(() => {
    setActivations((prev: string[]) => {
      if (layers.length < 2) return [];
      if (!prev || prev.length !== layers.length - 1) {
        // Default to relu between hiddens, softmax after output
        return Array(layers.length - 2).fill('relu').concat(['softmax']);
      }
      return prev;
    });
  }, [layers.length]);

  const updateLayer = (index: number, key: string, value: any) => {
    if (key === 'neurons') {
      let val = parseInt(value);
      if (isNaN(val) || val < 1) val = 1;
      value = val;
    }
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], [key]: value };
    setLayers(newLayers);
    data.onChange?.(newLayers, activations);
  };

  const updateActivation = (idx: number, value: string) => {
    const newActs = [...activations];
    newActs[idx] = value;
    setActivations(newActs);
    data.onChange?.(layers, newActs);
  };

  const addLayer = (index: number) => {
    if (layers.length >= 20) return;
    const newLayers = [...layers];
    newLayers.splice(index + 1, 0, { type: 'hidden', neurons: 4 });
    setLayers(newLayers);
    // Insert a relu activation after the new layer
    const newActs = [...activations];
    newActs.splice(index + 1, 0, 'none');
    setActivations(newActs);
    data.onChange?.(newLayers, newActs);
  };

  const removeLayer = (index: number) => {
    const hiddenCount = layers.filter((l: { type: string }) => l.type === 'hidden').length;
    if (layers.length <= 3 || index === 0 || index === layers.length - 1 || (layers[index].type === 'hidden' && hiddenCount <= 1)) return;
    const newLayers = [...layers];
    newLayers.splice(index, 1);
    setLayers(newLayers);
    // Remove the activation after the removed layer
    const newActs = [...activations];
    newActs.splice(index === layers.length - 1 ? index - 1 : index, 1);
    setActivations(newActs);
    data.onChange?.(newLayers, newActs);
  };

  // Compact summary for node
  const inputLayer = layers[0];
  const outputLayer = layers[layers.length - 1];
  const hiddenLayers = layers.filter((l: any) => l.type === 'hidden');
  // Stacked summary: layer (neurons) → activation → ...
  const stackedSummary = [];
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    stackedSummary.push(
      <div key={`layer-${i}`} className="flex items-center gap-1">
        <span className={
          'rounded px-2 py-0.5 text-xs font-semibold ' +
          (layer.type === 'input' ? 'bg-blue-700' : layer.type === 'output' ? 'bg-green-700' : 'bg-purple-700')
        }>
          {layer.type.toUpperCase()} <b>{layer.neurons}</b>
        </span>
      </div>
    );
    if (i < activations.length) {
      const actLabel = activationOptions.find(opt => opt.value === activations[i])?.label || activations[i];
      stackedSummary.push(
        <div key={`act-${i}`} className="flex items-center gap-1">
          <span className="text-[10px] text-blue-200">{actLabel}</span>
          <span className="text-[10px] text-blue-200">&#8595;</span>
        </div>
      );
    }
  }

  return (
    <>
      <div
        className={clsx(
          'bg-neutral-800 text-white rounded-lg shadow-lg p-3 w-56',
          selected && 'ring-2 ring-blue-400'
        )}
      >
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
        <div className="flex flex-col items-center gap-1">
          <span className="font-bold text-xs mb-1">Neural Network</span>
          <div className="flex flex-col items-center gap-0.5">
            {stackedSummary}
          </div>
          <Button isIconOnly aria-label="edit" color="default" size='sm' onClick={() => setShowModal(true)} className="self-end">
            <Icon className="w-5 h-5" icon="lucide:edit" />
          </Button>
          {/* <button onClick={() => setShowModal(true)} className="mt-2 px-2 py-1 rounded bg-blue-600 text-xs cursor-pointer" type="button">Edit Layers</button> */}
        </div>
        <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <div className="p-4 min-w-[340px]">
            <div className="font-bold mb-2 text-base">Edit Neural Network Layers</div>
            {layers.map((layer: any, idx: number) => {
              const hiddenCount = layers.filter((l: { type: string }) => l.type === 'hidden').length;
              const disableRemove = layers.length <= 3 || idx === 0 || idx === layers.length - 1 || (layer.type === 'hidden' && hiddenCount <= 1);
              const disableAdd = layers.length >= 20;
              return (
                <React.Fragment key={idx}>
                  <div
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
                  {/* Activation selector between layers, except after output */}
                  {idx < layers.length - 1 && (
                    <div className="flex items-center justify-center mb-2">
                      <select
                        className="text-xs bg-neutral-700 text-white rounded px-2 py-1 border border-neutral-500 focus:outline-none"
                        value={activations[idx] || 'relu'}
                        onChange={e => updateActivation(idx, e.target.value)}
                      >
                        {activationOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <span className="ml-2 text-xs text-neutral-300">Activation</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            <div className="flex justify-end mt-4">
              <button className="px-4 py-1 rounded bg-blue-600 text-white" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default memo(NeuralLayerNode);
