import React, { useState, useEffect, memo, useRef } from 'react';
import { Button, Modal, ModalContent } from '@heroui/react';
import clsx from 'clsx';
import { Handle, Position } from 'reactflow';

import { NodeProps } from 'reactflow';
import { Icon } from '@iconify/react';

interface Layer {
  type: 'input' | 'hidden' | 'output';
  neurons: number;
}

interface TransformedData {
  inputLayer?: {
    units: number;
    activation: string;
  };
  hiddenLayers: Array<{
    type: string;
    units: number;
    activation: string;
  }>;
  outputLayer?: {
    units: number;
    activation: string;
  };
  loss: string;
  metrics: string[];
}

interface NeuralLayerProps extends NodeProps {
  data: {
    layers?: Layer[];
    activations?: string[];
    label?: string;
    icon?: string;
    details?: string;
    transformedData?: TransformedData;
    onChange?: (layers: Layer[], activations: string[], transformedData: TransformedData) => void;
  } & Record<string, any>;
}

const activationOptions = [
  { value: 'relu', label: 'ReLU' },
  { value: 'sigmoid', label: 'Sigmoid' },
  { value: 'tanh', label: 'Tanh' },
  { value: 'softmax', label: 'Softmax' },
  { value: 'none', label: 'None' },
];

const NeuralLayerNode = ({ data, type, selected, isConnectable }: NeuralLayerProps) => {

  const [layers, setLayers] = useState<Layer[]>(
    data.layers || [
      { type: 'input', neurons: 2 },
      { type: 'hidden', neurons: 4 },
      { type: 'output', neurons: 1 },
    ]
  );
  const [showModal, setShowModal] = useState(false);
  // Activations: one between each pair of layers (length = layers.length - 1)
  const [activations, setActivations] = useState(
    data.activations || Array(layers.length - 1).fill('relu')
  );

  // Initialize the neural network data structure
  useEffect(() => {
    const initialTransformedData = createTransformedData(layers, activations);
    
    // Update the node data with both the layers and transformed data
    if (data.onChange) {
      // Store both the raw layers/activations and the transformed data
      data.data = {
        ...data.data,
        layers,
        activations,
        transformedData: initialTransformedData
      };
      data.onChange(layers, activations, initialTransformedData);
    }
  }, []);

  // Keep activations array in sync with layers
  useEffect(() => {
    // Update activations array
    setActivations((prev: string[]) => {
      if (layers.length < 2) return [];
      if (!prev || prev.length !== layers.length - 1) {
        // Default to relu between hiddens, softmax after output
        return Array(layers.length - 2).fill('relu').concat(['softmax']);
      }
      return prev;
    });

    // Create transformed data structure
    const transformedData = createTransformedData(layers, activations);

    // Update both the node's data and notify parent through onChange
    if (data.onChange) {
      // Update the node's own data
      data.layers = layers;
      data.activations = activations;
      data.transformedData = transformedData;

      // Notify parent of changes
      data.onChange(layers, activations, transformedData);
    }

    // Log the current state for debugging
    console.log('Neural Layer Node Data:', {
      layers,
      activations,
      transformedData
    });
  }, [layers, activations]);

  const createTransformedData = (layerList: Layer[], activationList: string[]): TransformedData => {
    const inputLayer = layerList.find(l => l.type === 'input');
    const outputLayer = layerList.find(l => l.type === 'output');
    const hiddenLayers = layerList
      .filter(l => l.type === 'hidden')
      .map((layer, idx) => ({
        type: 'dense',
        units: layer.neurons,
        activation: activationList[idx] || 'relu'
      }));

    return {
      inputLayer: inputLayer ? {
        units: inputLayer.neurons,
        activation: activationList[0] || 'relu'
      } : undefined,
      hiddenLayers,
      outputLayer: outputLayer ? {
        units: outputLayer.neurons,
        activation: activationList[activationList.length - 1] || 'softmax'
      } : undefined,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    };
  };

  const updateLayer = (index: number, key: string, value: any) => {
    if (key === 'neurons') {
      let val = parseInt(value);
      if (isNaN(val) || val < 1) val = 1;
      value = val;
    }
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], [key]: value };
    setLayers(newLayers);
    data.onChange?.(newLayers, activations, createTransformedData(newLayers, activations));
  };

  const updateActivation = (idx: number, value: string) => {
    const newActs = [...activations];
    newActs[idx] = value;
    setActivations(newActs);
    data.onChange?.(layers, newActs, createTransformedData(layers, newActs));
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
    data.onChange?.(newLayers, newActs, createTransformedData(newLayers, newActs));
  };

  const removeLayer = (index: number) => {
    const hiddenCount = layers.filter((l: Layer) => l.type === 'hidden').length;
    if (layers.length <= 3 || index === 0 || index === layers.length - 1 || (layers[index].type === 'hidden' && hiddenCount <= 1)) return;
    const newLayers = [...layers];
    newLayers.splice(index, 1);
    setLayers(newLayers);
    // Remove the activation after the removed layer
    const newActs = [...activations];
    newActs.splice(index === layers.length - 1 ? index - 1 : index, 1);
    setActivations(newActs);
    data.onChange?.(newLayers, newActs, createTransformedData(newLayers, newActs));
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
    if (i < activations.length && activations[i] !== 'none') {
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
          'text-white rounded-lg shadow-lg p-3 w-56',
          selected && 'ring-2 ring-blue-400',
          data.isTraining ? 'bg-orange-800 animate-pulse' : 'bg-neutral-800',
          data.trainingComplete ? 'bg-green-800' : '',
        )}
      >
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-xs">Neural Network</span>
            {data.isTraining && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-300 rounded-full animate-ping"></div>
                <span className="text-xs font-semibold">TRAINING</span>
              </div>
            )}
            {data.trainingComplete && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                <span className="text-xs font-semibold">TRAINED</span>
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
          
          <div className="flex flex-col items-center gap-0.5">
            {stackedSummary}
          </div>
          <Button isIconOnly aria-label="edit" color="default" size='sm' onClick={() => setShowModal(true)} className="self-end">
            <Icon className="w-5 h-5" icon="lucide:edit" />
          </Button>
        </div>
        <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size='5xl'>
        <ModalContent>
          <div className="flex flex-col md:flex-row gap-6 p-4 h-[650px]">
            {/* Left: Layer List and Editing */}
            <aside className=" bg-background rounded-xl p-4 shadow-sm flex flex-col gap-4 w-1/4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Edit Layers</h3>
              </div>
              <div className="text-sm text-slate-500">Total layers: {layers.length}</div>
              <div className="space-y-2 overflow-auto">
                {layers.map((layer: any, idx: number) => (
                  <div key={idx} className={clsx(
                    'p-3 rounded-lg border',
                    layer.type === 'input' ? 'border-blue-200 ' :
                      layer.type === 'output' ? 'border-green-200 ' :
                        'border-purple-200 ')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: layer.type === 'input' ? '#10b981' : layer.type === 'output' ? '#ef4444' : '#6366f1' }} />
                        <div>
                          <div className="text-sm font-medium">{layer.type.toUpperCase()} LAYER</div>
                          <div className="text-xs text-slate-500">{layer.neurons} neurons • {activations[idx] || 'none'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {layer.type === 'hidden' && (
                          <>
                            <button onClick={() => removeLayer(idx)} className="p-1 rounded hover:bg-slate-100" title="Remove layer">
                              <span className="sr-only">Remove</span>−
                            </button>
                            <button onClick={() => addLayer(idx)} className="p-1 rounded hover:bg-slate-100" title="Add layer after">
                              <span className="sr-only">Add</span>+
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Edit controls for selected layer */}
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="text-xs text-slate-600">Neurons: {layer.neurons}</label>
                        <input
                          type="range"
                          min={1}
                          max={16}
                          value={layer.neurons}
                          onChange={e => updateLayer(idx, 'neurons', e.target.value)}
                          className="w-full"
                        />
                      </div>
                      {idx < layers.length - 1 && (
                        <div>
                          <label className="text-xs text-slate-600">Activation</label>
                          <select
                            value={activations[idx] || 'none'}
                            onChange={e => updateActivation(idx, e.target.value)}
                            className="w-full mt-1 p-2 rounded border"
                          >
                            <option value="none">none</option>
                            <option value="relu">ReLU</option>
                            <option value="sigmoid">Sigmoid</option>
                            <option value="tanh">Tanh</option>
                            <option value="softmax">Softmax</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* <div className="mt-auto flex gap-2">
                <button
                  onClick={() => addLayer(layers.length - 1)}
                  className="flex-1 py-2 rounded bg-indigo-600 text-white font-medium hover:brightness-95"
                >Add Hidden Layer</button>
                <button
                  onClick={() => setLayers([
                    { type: 'input', neurons: 2 },
                    { type: 'hidden', neurons: 4 },
                    { type: 'output', neurons: 1 },
                  ])}
                  className="px-3 py-2 rounded border hover:bg-slate-50"
                >Reset</button>
              </div> */}
            </aside>
            {/* Right: SVG Visualization */}
            <div className="flex-1 rounded-xl p-4 shadow-sm ">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Visualization</h4>
              </div>
              <div className="w-full h-[550px] rounded-lg border border-slate-100 relative overflow-hidden">
                {/* Responsive centering using ref and state */}
                {(() => {
                  const containerRef = useRef<HTMLDivElement>(null);
                  const [canvasWidth, setCanvasWidth] = useState(0);
                  useEffect(() => {
                    const handleResize = () => {
                      if (containerRef.current) {
                        setCanvasWidth(containerRef.current.offsetWidth);
                      }
                    };
                    handleResize();
                    window.addEventListener('resize', handleResize);
                    return () => window.removeEventListener('resize', handleResize);
                  }, []);
                  function getNeuronPositions(
                    count: number,
                    neuronGap: number,
                    visHeight: number
                  ): { y: number; type: 'neuron' | 'dots' }[] {
                    if (count <= 8) {
                      const totalHeight = (count - 1) * neuronGap;
                      return Array.from({ length: count }, (_, i) => ({
                        y: visHeight / 2 - totalHeight / 2 + i * neuronGap,
                        type: 'neuron',
                      }));
                    }
                    // >10 neurons → first 5, dots, last 5
                    const positions = [];
                    const totalHeight = (10 - 1) * neuronGap;
                    const startY = visHeight / 2 - totalHeight / 2;
                    for (let i = 0; i < 4; i++) {
                      positions.push({ y: startY + i * neuronGap, type: 'neuron' as 'neuron' });
                    }
                    positions.push({ y: startY + 5 * neuronGap, type: 'dots' as 'dots' });
                    for (let i = 0; i < 4; i++) {
                      positions.push({ y: startY + (6 + i) * neuronGap, type: 'neuron' as 'neuron' });
                    }
                    return positions;
                  }
                  // Layout constants
                  const colGap = 80;
                  const circleSize = 28;
                  const neuronGap = 36;
                  const visHeight = 500;

                  // We'll use a flex container to center the neuron columns horizontally
                  // and measure their positions for edge drawing
                  const neuronColRefs = useRef<(HTMLDivElement | null)[]>([]);
                  const [colCenters, setColCenters] = useState<number[]>([]);

                  useEffect(() => {
                    // After render, measure the center X of each neuron column
                    if (!containerRef.current) return;
                    const containerRect = containerRef.current.getBoundingClientRect();
                    const centers = neuronColRefs.current.map(ref => {
                      if (!ref) return 0;
                      const rect = ref.getBoundingClientRect();
                      return rect.left - containerRect.left + rect.width / 2;
                    });
                    setColCenters(centers);
                  }, [layers, canvasWidth]);

                  return (
                    <div ref={containerRef} className="relative w-full h-full">
                      {/* Edges */}
                      <div className="absolute inset-0 pointer-events-none">
                        {colCenters.length === layers.length && layers.map((layer: any, idx: number) => {
                          if (idx === layers.length - 1) return null;
                          const nextLayer = layers[idx + 1];
                          const x1 = colCenters[idx];
                          const x2 = colCenters[idx + 1];
                          const positions1 = getNeuronPositions(layer.neurons, neuronGap, visHeight);
                          const positions2 = getNeuronPositions(nextLayer.neurons, neuronGap, visHeight);
                          return positions1.map((p1, nidx) => {
                            if (p1.type === 'dots') return null;
                            return positions2.map((p2, nnidx) => {
                              if (p2.type === 'dots') return null;
                              return (
                                <svg
                                  key={`edge-${idx}-${nidx}-${nnidx}`}
                                  width="100%" height="100%"
                                  style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
                                >
                                  <line
                                    x1={x1}
                                    y1={p1.y}
                                    x2={x2}
                                    y2={p2.y}
                                    stroke="#a5b4fc"
                                    strokeWidth={1.2}
                                    opacity={0.5}
                                  />
                                </svg>
                              );
                            });
                          });
                        })}
                      </div>
                      {/* Neurons */}
                      <div className="flex h-full items-center justify-center gap-20 px-4 overflow-x-auto relative z-10" style={{ height: visHeight }}>
                        {layers.map((layer: any, idx: number) => {
                          const positions = getNeuronPositions(layer.neurons, neuronGap, visHeight);
                          return (
                            <div
                              key={idx}
                              ref={el => { neuronColRefs.current[idx] = el; }}
                              className="flex flex-col items-center gap-2"
                            >
                              <div className="text-xs font-semibold mb-1">{layer.type.toUpperCase()}</div>
                              {positions.map((p, nidx) =>
                                p.type === 'dots' ? (
                                  <div key={nidx} className="text-white text-center" style={{ lineHeight: `${circleSize}px`, height: circleSize }}>
                                    ...
                                  </div>
                                ) : (
                                  <div
                                    key={nidx}
                                    className="w-7 h-7 rounded-full border-2"
                                    style={{
                                      background: layer.type === 'input' ? '#10b981' : layer.type === 'output' ? '#ef4444' : '#6366f1',
                                      borderColor: '#e5e7eb',
                                    }}
                                  />
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-md border">
                  <div className="text-xs">Layers: {layers.length}</div>
                  <div className="text-xs">Neurons: {layers.reduce((s: number, l: any) => s + l.neurons, 0)}</div>
                </div>
              </div>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default memo(NeuralLayerNode);
