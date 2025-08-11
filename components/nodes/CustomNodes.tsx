// Unified NeuralLayerNode (TensorFlow Playground style)
const NeuralLayerNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [layers, setLayers] = useState(
    data.layers || [
      { type: 'input', neurons: 2 },
      { type: 'hidden', neurons: 4 },
      { type: 'output', neurons: 1 },
    ]
  );

  const updateLayer = (index: number, key: string, value: any) => {
    // Error handling: only allow positive integers for neurons
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
    // Error handling: don't allow more than 20 layers
    if (layers.length >= 20) return;
    const newLayers = [...layers];
    newLayers.splice(index + 1, 0, { type: 'hidden', neurons: 4 });
    setLayers(newLayers);
    data.onChange?.(newLayers);
  };

  const removeLayer = (index: number) => {
    // Prevent removing input/output layers or if only 1 hidden layer left
  const hiddenCount = layers.filter((l: { type: string; neurons: number }) => l.type === 'hidden').length;
    if (layers.length <= 3 || index === 0 || index === layers.length - 1 || (layers[index].type === 'hidden' && hiddenCount <= 1)) return;
    const newLayers = [...layers];
    newLayers.splice(index, 1);
    setLayers(newLayers);
    data.onChange?.(newLayers);
  };

  return (
    <div
      className={clsx(
        "bg-neutral-800 text-white rounded-lg shadow-lg p-3 w-48",
        selected && "ring-2 ring-blue-400"
      )}
    >
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      {layers.map((layer: { type: string; neurons: number }, idx: number) => {
  const hiddenCount = layers.filter((l: { type: string; neurons: number }) => l.type === 'hidden').length;
        const disableRemove = layers.length <= 3 || idx === 0 || idx === layers.length - 1 || (layer.type === 'hidden' && hiddenCount <= 1);
        const disableAdd = layers.length >= 20;
        return (
          <div
            key={idx}
            className={clsx(
              "flex items-center justify-between p-2 mb-2 rounded",
              layer.type === 'input' && "bg-blue-600",
              layer.type === 'hidden' && "bg-purple-600",
              layer.type === 'output' && "bg-green-600"
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
import React, { memo, useState, useEffect } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Icon } from "@iconify/react";
import { Input, Select, SelectItem, Switch, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import clsx from "clsx";
import { nodeStyles } from "./nodeStyles";
import { LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';

// Database Config Node - Lets user configure dataset preprocessing
const DatabaseConfigNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [showModal, setShowModal] = useState(false);
  // Only show minimal info on node
  return (
    <div
      className={clsx(
        'bg-gradient-to-r from-emerald-700 to-emerald-500 text-white rounded-lg shadow-lg border-2',
        'min-w-[220px] max-w-[340px] transition-all duration-200 p-3',
        selected ? 'border-white ring-2 ring-emerald-300' : 'border-transparent',
        'cursor-pointer'
      )}
      onDoubleClick={() => setShowModal(true)}
    >
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" icon="lucide:settings" />
        <div>
          <div className="font-bold text-sm">Database Config</div>
          <div className="text-xs opacity-80">Preprocess & Split Dataset</div>
        </div>
      </div>
      <div className="text-xs">Double-click to configure</div>
      {/* Output handles for X and y */}
      <Handle
        id="x"
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
        style={{ top: '40%' }}
      />
      <div className="absolute right-2" style={{ top: '38%' }}>
        <span className="bg-emerald-900 text-xs px-1 rounded">X</span>
      </div>
      <Handle
        id="y"
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
        style={{ top: '60%' }}
      />
      <div className="absolute right-2" style={{ top: '58%' }}>
        <span className="bg-emerald-900 text-xs px-1 rounded">y</span>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white text-black rounded-lg shadow-lg p-6 min-w-[320px] relative">
            <button className="absolute top-2 right-2 text-lg" onClick={() => setShowModal(false)}>&times;</button>
            <div className="font-bold mb-2">Database Config</div>
            <div className="mb-2">
              <div className="text-xs font-semibold mb-1">Select X (features):</div>
              <Select
                multiple
                className="w-full text-black text-xs"
                value={data.selectedX || []}
                onChange={val => data.onChange?.({ selectedX: val })}
              >
                {(data.xColumns || []).map((col: string) => (
                  <SelectItem key={col}>{col}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="mb-2">
              <div className="text-xs font-semibold mb-1">Select y (target):</div>
              <Select
                className="w-full text-black text-xs"
                value={data.selectedY || []}
                onChange={val => data.onChange?.({ selectedY: [val] })}
              >
                {(data.yColumns || []).map((col: string) => (
                  <SelectItem key={col}>{col}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <div className="text-xs font-semibold mb-1">Train Split</div>
                <Input
                  type="number"
                  min={0.5}
                  max={0.99}
                  step={0.01}
                  value={data.trainSplit ?? 0.8}
                  onChange={e => data.onChange?.({ trainSplit: parseFloat(e.target.value) })}
                  className="w-full text-black text-xs"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="text-xs flex items-center gap-1">
                  <Switch checked={data.shuffle ?? true} onChange={val => data.onChange?.({ shuffle: val })} /> Shuffle
                </label>
                <label className="text-xs flex items-center gap-1">
                  <Switch checked={data.stratify ?? false} onChange={val => data.onChange?.({ stratify: val })} /> Stratify
                </label>
              </div>
            </div>
            {Array.isArray(data.preview) && data.preview.length > 0 && (
              <div className="bg-white/80 text-black rounded p-1 text-xs mt-2 overflow-x-auto">
                <div className="font-semibold mb-1">Preview</div>
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      {Object.keys(data.preview[0]).map((col) => (
                        <th key={col} className="px-1 text-left">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.preview.slice(0, 3).map((row: any, i: number) => (
                      <tr key={i}>
                        {Object.values(row).map((val: any, j: number) => (
                          <td key={j} className="px-1">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Dataset Node - Lets user select dataset for training
const DatasetNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const dataset: string = data.dataset || 'mnist';
  const setDataset = typeof data.onDatasetChange === 'function' ? data.onDatasetChange : () => {};
  const handleCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && typeof data.onCsvUpload === 'function') {
      data.onCsvUpload(e.target.files[0]);
    }
  };
  return (
    <div
      className={clsx(
        'bg-gradient-to-r from-gray-700 to-gray-500 text-white rounded-lg shadow-lg border-2',
        'min-w-[180px] max-w-[260px] transition-all duration-200 p-3',
        selected ? 'border-white ring-2 ring-gray-300' : 'border-transparent',
      )}
    >
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" icon="lucide:database" />
        <div>
          <div className="font-bold text-sm">Dataset</div>
          <div className="text-xs opacity-80">Select for training</div>
        </div>
      </div>
      <select
        className="w-full text-black rounded p-1 text-xs"
        value={dataset}
        onChange={e => setDataset(e.target.value)}
      >
        <option value="mnist">MNIST (images)</option>
        <option value="iris">Iris (tabular)</option>
        <option value="csv">Upload CSV</option>
      </select>
      {/* For CSV, show upload button */}
      {dataset === 'csv' && (
        <input
          type="file"
          accept=".csv"
          className="mt-2 w-full text-xs"
          onChange={handleCsv}
        />
      )}
    </div>
  );
};
// Graph Node - Visualizes training metrics
const GraphNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  // data.metricsHistory: [{epoch, loss, acc}]
  const metricsHistory = data.metricsHistory || [];
  return (
    <div
      className={clsx(
        "bg-gradient-to-r from-blue-800 to-blue-400 text-white rounded-xl shadow-xl border-2",
        "min-w-[320px] max-w-[480px] transition-all duration-200 p-4",
        selected ? "border-white ring-2 ring-blue-300" : "border-transparent",
      )}
    >
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-6 h-6" icon="lucide:line-chart" />
        <div>
          <div className="font-bold text-base">Training Metrics</div>
          <div className="text-xs opacity-80">Live Loss & Accuracy</div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-3 mb-2 shadow-inner" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metricsHistory} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
            <XAxis dataKey="epoch" tick={{ fontSize: 12 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} label={{ value: 'Value', angle: -90, position: 'insideLeft', fontSize: 12 }} />
            <ChartTooltip contentStyle={{ fontSize: 12 }} />
            <Legend verticalAlign="top" height={30} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="loss" stroke="#f59e42" name="Loss" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="acc" stroke="#2563eb" name="Accuracy" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {metricsHistory.length > 0 && (
        <div className="flex justify-between text-xs text-blue-100 mt-1">
          <span>Last Loss: <span className="font-mono text-orange-200">{metricsHistory[metricsHistory.length-1].loss?.toFixed(4)}</span></span>
          <span>Last Acc: <span className="font-mono text-blue-200">{(metricsHistory[metricsHistory.length-1].acc*100).toFixed(2)}%</span></span>
        </div>
      )}
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};
// (imports already at top of file)

// Dropout Node with Modal
const DropoutNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [showModal, setShowModal] = useState(false);
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    data.onChange?.({ ...data, params: { ...data.params, rate: value } });
  };
  return (
    <>
      <div
        className={clsx(
          "w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-md group relative cursor-pointer",
          "transition-all duration-200",
          selected ? "ring-2 ring-pink-300 shadow-lg" : "",
          "bg-pink-500",
        )}
        onDoubleClick={() => setShowModal(true)}
      >
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Left}
          type="target"
        />
        <span className="text-white text-xs font-medium">Dropout</span>
        <span className="text-white text-xs">{data.params?.rate ?? 0.5}</span>
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Right}
          type="source"
        />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <ModalHeader>Configure Dropout</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold">Dropout Rate (0-1)</label>
              <input
                className="w-full border rounded p-1 text-xs"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={data.params?.rate ?? 0.5}
                onChange={handleRateChange}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="px-4 py-1 rounded bg-pink-500 text-white" onClick={() => setShowModal(false)}>Close</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const BaseNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const isProcessing = data.isProcessing || false;
  const activationLevel = data.activationLevel || 0;

  return (
    <div
      className={clsx(
        nodeStyles.base,
        nodeStyles[type as keyof typeof nodeStyles] || nodeStyles.dense,
        selected && nodeStyles.selected,
        isProcessing && "ring-2 ring-blue-400 ring-opacity-50 animate-pulse",
        "p-4",
      )}
    >
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />

      <div className="flex items-center gap-2">
        {data.icon && <Icon className="w-5 h-5" icon={data.icon} />}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm">{data.label}</div>
            {isProcessing && (
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse ml-2" />
            )}
          </div>
          {data.details && (
            <div className="text-xs text-gray-500">{data.details}</div>
          )}
          {isProcessing && activationLevel > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-600 rounded-full h-1">
                <div
                  className="bg-blue-400 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(activationLevel * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};


// Combined Input/Output Node
const InputOutputNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  // type: 'inputLayer' or 'outputLayer'
  const [count, setCount] = useState(data.count || 1);
  const label = type === 'inputLayer' ? 'Input Neurons' : 'Output Neurons';
  const color = type === 'inputLayer' ? 'bg-blue-500' : 'bg-green-500';

  const handleCountChange = (delta: number) => {
    const newCount = Math.max(1, count + delta);
    setCount(newCount);
    data.onChange?.(newCount);
  };

  useEffect(() => {
    setCount(data.count || 1);
  }, [data.count]);

  return (
    <div
      className={clsx(
        `w-32 rounded-lg flex flex-col items-center justify-center shadow-md relative cursor-pointer p-4`,
        selected ? 'ring-2 ring-blue-300 shadow-lg' : '',
        color
      )}
    >
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={type === 'inputLayer' ? Position.Right : Position.Left}
        type={type === 'inputLayer' ? 'source' : 'target'}
      />
      <div className="font-bold text-white mb-2 text-sm">{label}</div>
      <div className="flex items-center gap-2">
        <button
          className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold"
          onClick={() => handleCountChange(-1)}
        >
          -
        </button>
        <span className="text-lg font-mono text-white">{count}</span>
        <button
          className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold"
          onClick={() => handleCountChange(1)}
        >
          +
        </button>
      </div>
    </div>
  );
};

// Combined Dense/Hidden Node (like TensorFlow Playground)
const DenseHiddenNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  // type: 'dense' or 'hidden'
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
        className={nodeStyles.handle}
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
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};


const TextInput = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [inputValue, setInputValue] = React.useState(data.value || "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    setInputValue(newValue);
    data.onChange?.(newValue);
  };

  React.useEffect(() => {
    setInputValue(data.value || "");
  }, [data.value]);

  const isProcessing = data.isProcessing || false;
  const activationLevel = data.activationLevel || 0;

  return (
    <div
      className={clsx(
        "bg-gray-900 border-2 border-gray-700 rounded-lg shadow-md p-3 min-w-[200px]",
        "transition-all duration-200",
        selected ? "border-blue-500 shadow-lg" : "",
        isProcessing
          ? "ring-2 ring-green-400 ring-opacity-50 animate-pulse"
          : "",
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-200">
            {data.label || "Text Input"}
          </label>
          {isProcessing && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Processing</span>
            </div>
          )}
        </div>
        <input
          className={clsx(
            "px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            isProcessing ? "border-green-400 bg-gray-750" : "",
          )}
          placeholder="Enter text..."
          type="text"
          value={inputValue}
          onChange={handleInputChange}
        />
        {isProcessing && activationLevel > 0 && (
          <div className="mt-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Activation</span>
              <span>{activationLevel.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div
                className="bg-green-400 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(activationLevel * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};

const TextOutput = ({ data, type, selected, isConnectable }: NodeProps) => {
  return (
    <div
      className={clsx(
        "bg-white border-2 border-gray-300 rounded-lg shadow-md p-3 min-w-[200px]",
        "transition-all duration-200",
        selected ? "border-green-400 shadow-lg" : "",
      )}
    >
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          {data.label || "Text Output"}
        </label>
        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm min-h-[40px]">
          {data.outputText || "Output will appear here..."}
        </div>
      </div>
    </div>
  );
};

// Optimizer Nodes with Hyperparameters
const OptimizerNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [showModal, setShowModal] = useState(false);

  const getOptimizerDefaults = () => {
    switch (type) {
      case "adam":
        return { lr: 0.001, beta1: 0.9, beta2: 0.999, eps: 1e-8 };
      case "sgd":
        return { lr: 0.01, momentum: 0.9, dampening: 0, weight_decay: 0 };
      case "rmsprop":
        return { lr: 0.01, alpha: 0.99, eps: 1e-8, weight_decay: 0 };
      case "adagrad":
        return { lr: 0.01, lr_decay: 0, weight_decay: 0, eps: 1e-10 };
      case "adamw":
        return {
          lr: 0.001,
          beta1: 0.9,
          beta2: 0.999,
          eps: 1e-8,
          weight_decay: 0.01,
        };
      default:
        return { lr: 0.001 };
    }
  };

  const [params, setParams] = useState(data.params || getOptimizerDefaults());

  const updateParam = (key: string, value: any) => {
    const newParams = { ...params, [key]: value };

    setParams(newParams);
    if (data.onParamsChange) {
      data.onParamsChange(newParams);
    }
  };

  return (
    <>
      <div
        className={clsx(
          "bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-lg shadow-lg border-2",
          "min-w-[200px] transition-all duration-200",
          selected ? "border-white ring-2 ring-orange-300" : "border-transparent",
        )}
        onDoubleClick={() => setShowModal(true)}
      >
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Left}
          type="target"
        />
        <div className="flex items-center gap-2 p-2">
          <Icon className="w-5 h-5" icon={data.icon} />
          <div>
            <div className="font-bold text-sm">{data.label}</div>
            <div className="text-xs opacity-80">{data.details}</div>
          </div>
        </div>
        <div className="text-xs">Double-click to configure</div>
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Right}
          type="source"
        />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <ModalHeader>Configure Optimizer</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold opacity-90">Hyperparameters:</div>
              {type === "adam" || type === "adamw" ? (
                <>
                  <label className="text-xs">Learning Rate</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.0001"
                    type="number"
                    value={params.lr?.toString()}
                    onChange={(e) => updateParam("lr", parseFloat(e.target.value))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs">Beta1</label>
                      <Input
                        className="text-gray-800"
                        size="sm"
                        step="0.01"
                        type="number"
                        value={params.beta1?.toString()}
                        onChange={(e) => updateParam("beta1", parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-xs">Beta2</label>
                      <Input
                        className="text-gray-800"
                        size="sm"
                        step="0.001"
                        type="number"
                        value={params.beta2?.toString()}
                        onChange={(e) => updateParam("beta2", parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  {type === "adamw" && (
                    <div className="space-y-2">
                      <label className="text-xs">Weight Decay</label>
                      <Input
                        className="text-gray-800"
                        size="sm"
                        step="0.001"
                        type="number"
                        value={params.weight_decay?.toString()}
                        onChange={(e) => updateParam("weight_decay", parseFloat(e.target.value))}
                      />
                    </div>
                  )}
                </>
              ) : type === "sgd" ? (
                <>
                  <label className="text-xs">Learning Rate</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.001"
                    type="number"
                    value={params.lr?.toString()}
                    onChange={(e) => updateParam("lr", parseFloat(e.target.value))}
                  />
                  <label className="text-xs">Momentum</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.1"
                    type="number"
                    value={params.momentum?.toString()}
                    onChange={(e) => updateParam("momentum", parseFloat(e.target.value))}
                  />
                </>
              ) : (
                <>
                  <label className="text-xs">Learning Rate</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.001"
                    type="number"
                    value={params.lr?.toString()}
                    onChange={(e) => updateParam("lr", parseFloat(e.target.value))}
                  />
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="px-4 py-1 rounded bg-orange-500 text-white" onClick={() => setShowModal(false)}>Close</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// Algorithm Nodes with Architecture-specific parameters
const AlgorithmNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [showModal, setShowModal] = useState(false);

  const getAlgorithmDefaults = () => {
    switch (type) {
      case "cnn":
        return {
          layers: 3,
          filters: [32, 64, 128],
          kernel_size: 3,
          pool_size: 2,
        };
      case "rnn":
        return { hidden_size: 128, num_layers: 2, bidirectional: false };
      case "lstm":
        return {
          hidden_size: 128,
          num_layers: 2,
          dropout: 0.2,
          bidirectional: false,
        };
      case "transformer":
        return {
          d_model: 512,
          nhead: 8,
          num_layers: 6,
          dim_feedforward: 2048,
          dropout: 0.1,
        };
      case "autoencoder":
        return {
          encoding_dim: 128,
          layers: [512, 256, 128],
          activation: "relu",
        };
      case "gan":
        return {
          latent_dim: 100,
          generator_layers: [256, 512, 1024],
          discriminator_layers: [1024, 512, 256],
        };
      case "resnet":
        return { depth: 50, num_classes: 1000, block_type: "bottleneck" };
      case "vae":
        return {
          latent_dim: 64,
          encoder_layers: [512, 256],
          decoder_layers: [256, 512],
        };
      default:
        return {};
    }
  };

  const [params, setParams] = useState(data.params || getAlgorithmDefaults());

  const updateParam = (key: string, value: any) => {
    const newParams = { ...params, [key]: value };

    setParams(newParams);
    if (data.onParamsChange) {
      data.onParamsChange(newParams);
    }
  };

  const getNodeColor = () => {
    switch (type) {
      case "cnn":
        return "from-blue-500 to-blue-700";
      case "rnn":
      case "lstm":
        return "from-purple-500 to-purple-700";
      case "transformer":
        return "from-green-500 to-green-700";
      case "autoencoder":
      case "vae":
        return "from-indigo-500 to-indigo-700";
      case "gan":
        return "from-red-500 to-red-700";
      case "resnet":
        return "from-teal-500 to-teal-700";
      default:
        return "from-gray-500 to-gray-700";
    }
  };

  return (
    <>
      <div
        className={clsx(
          `bg-gradient-to-r ${getNodeColor()} text-white rounded-lg shadow-lg border-2`,
          "min-w-[220px] transition-all duration-200",
          selected ? "border-white ring-2 ring-blue-300" : "border-transparent",
        )}
        onDoubleClick={() => setShowModal(true)}
      >
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Left}
          type="target"
        />
        <div className="flex items-center gap-2 p-2">
          <Icon className="w-5 h-5" icon={data.icon} />
          <div>
            <div className="font-bold text-sm">{data.label}</div>
            <div className="text-xs opacity-80">{data.details}</div>
          </div>
        </div>
        <div className="text-xs">Double-click to configure</div>
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Right}
          type="source"
        />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <ModalHeader>Configure Architecture</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold opacity-90">Architecture Parameters:</div>
              {type === "cnn" && (
                <>
                  <label className="text-xs">Number of Layers</label>
                  <Input
                    className="text-gray-800"
                    min="1"
                    size="sm"
                    type="number"
                    value={params.layers?.toString()}
                    onChange={(e) => updateParam("layers", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Kernel Size</label>
                  <Select
                    className="text-gray-800"
                    selectedKeys={[params.kernel_size?.toString()]}
                    size="sm"
                    onSelectionChange={(selection) =>
                      updateParam("kernel_size", parseInt(Array.from(selection)[0] as string))
                    }
                  >
                    <SelectItem key="3">3x3</SelectItem>
                    <SelectItem key="5">5x5</SelectItem>
                    <SelectItem key="7">7x7</SelectItem>
                  </Select>
                </>
              )}
              {(type === "rnn" || type === "lstm") && (
                <>
                  <label className="text-xs">Hidden Size</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.hidden_size?.toString()}
                    onChange={(e) => updateParam("hidden_size", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Number of Layers</label>
                  <Input
                    className="text-gray-800"
                    min="1"
                    size="sm"
                    type="number"
                    value={params.num_layers?.toString()}
                    onChange={(e) => updateParam("num_layers", parseInt(e.target.value))}
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      isSelected={params.bidirectional}
                      size="sm"
                      onValueChange={(value) => updateParam("bidirectional", value)}
                    />
                    <label className="text-xs">Bidirectional</label>
                  </div>
                </>
              )}
              {type === "transformer" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs">Model Dim</label>
                      <Input
                        className="text-gray-800"
                        size="sm"
                        type="number"
                        value={params.d_model?.toString()}
                        onChange={(e) => updateParam("d_model", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-xs">Heads</label>
                      <Input
                        className="text-gray-800"
                        size="sm"
                        type="number"
                        value={params.nhead?.toString()}
                        onChange={(e) => updateParam("nhead", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <label className="text-xs">Number of Layers</label>
                  <Input
                    className="text-gray-800"
                    min="1"
                    size="sm"
                    type="number"
                    value={params.num_layers?.toString()}
                    onChange={(e) => updateParam("num_layers", parseInt(e.target.value))}
                  />
                </>
              )}
              {type === "autoencoder" && (
                <>
                  <label className="text-xs">Encoding Dimension</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.encoding_dim?.toString()}
                    onChange={(e) => updateParam("encoding_dim", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Activation</label>
                  <Select
                    className="text-gray-800"
                    selectedKeys={[params.activation]}
                    size="sm"
                    onSelectionChange={(selection) => updateParam("activation", Array.from(selection)[0])}
                  >
                    <SelectItem key="relu">ReLU</SelectItem>
                    <SelectItem key="tanh">Tanh</SelectItem>
                    <SelectItem key="sigmoid">Sigmoid</SelectItem>
                  </Select>
                </>
              )}
              {type === "gan" && (
                <>
                  <label className="text-xs">Latent Dimension</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.latent_dim?.toString()}
                    onChange={(e) => updateParam("latent_dim", parseInt(e.target.value))}
                  />
                </>
              )}
              {type === "resnet" && (
                <>
                  <label className="text-xs">Depth</label>
                  <Select
                    className="text-gray-800"
                    selectedKeys={[params.depth?.toString()]}
                    size="sm"
                    onSelectionChange={(selection) => updateParam("depth", parseInt(Array.from(selection)[0] as string))}
                  >
                    <SelectItem key="18">ResNet-18</SelectItem>
                    <SelectItem key="34">ResNet-34</SelectItem>
                    <SelectItem key="50">ResNet-50</SelectItem>
                    <SelectItem key="101">ResNet-101</SelectItem>
                  </Select>
                  <label className="text-xs">Number of Classes</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.num_classes?.toString()}
                    onChange={(e) => updateParam("num_classes", parseInt(e.target.value))}
                  />
                </>
              )}
              {type === "vae" && (
                <>
                  <label className="text-xs">Latent Dimension</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.latent_dim?.toString()}
                    onChange={(e) => updateParam("latent_dim", parseInt(e.target.value))}
                  />
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="px-4 py-1 rounded bg-blue-500 text-white" onClick={() => setShowModal(false)}>Close</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// Loss Function Node
const LossNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [params, setParams] = useState(data.params || {});

  const updateParam = (key: string, value: any) => {
    const newParams = { ...params, [key]: value };

    setParams(newParams);
    if (data.onParamsChange) {
      data.onParamsChange(newParams);
    }
  };

  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div
        className={clsx(
          "bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg shadow-lg border-2",
          "min-w-[160px] transition-all duration-200 p-3",
          selected ? "border-white ring-2 ring-red-300" : "border-transparent",
        )}
        onDoubleClick={() => setShowModal(true)}
      >
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Left}
          type="target"
        />
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4" icon={data.icon} />
          <div>
            <div className="font-bold text-xs">{data.label}</div>
            <div className="text-xs opacity-80">{data.details}</div>
          </div>
        </div>
        <div className="text-xs">Double-click to configure</div>
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Right}
          type="source"
        />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <ModalHeader>Configure Loss Function</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2">
              {type === "crossentropy" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      isSelected={params.reduction !== "none"}
                      size="sm"
                      onValueChange={(value) => updateParam("reduction", value ? "mean" : "none")}
                    />
                    <label className="text-xs">Reduction</label>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="px-4 py-1 rounded bg-red-500 text-white" onClick={() => setShowModal(false)}>Close</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// Learning Rate Scheduler Node
const SchedulerNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [showModal, setShowModal] = useState(false);

  const getSchedulerDefaults = () => {
    switch (type) {
      case "steplr":
        return { step_size: 30, gamma: 0.1 };
      case "exponentiallr":
        return { gamma: 0.95 };
      case "cosineannealinglr":
        return { T_max: 50, eta_min: 0 };
      case "reducelronplateau":
        return { mode: "min", factor: 0.1, patience: 10, threshold: 1e-4 };
      default:
        return {};
    }
  };

  const [params, setParams] = useState(data.params || getSchedulerDefaults());

  const updateParam = (key: string, value: any) => {
    const newParams = { ...params, [key]: value };

    setParams(newParams);
    if (data.onParamsChange) {
      data.onParamsChange(newParams);
    }
  };

  return (
    <>
      <div
        className={clsx(
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-lg border-2",
          "min-w-[180px] transition-all duration-200",
          selected ? "border-white ring-2 ring-yellow-300" : "border-transparent",
        )}
        onDoubleClick={() => setShowModal(true)}
      >
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Left}
          type="target"
        />
        <div className="flex items-center gap-2 p-2">
          <Icon className="w-4 h-4" icon={data.icon} />
          <div>
            <div className="font-bold text-xs">{data.label}</div>
            <div className="text-xs opacity-80">{data.details}</div>
          </div>
        </div>
        <div className="text-xs">Double-click to configure</div>
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Right}
          type="source"
        />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <ModalHeader>Configure Scheduler</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2">
              {type === "steplr" && (
                <>
                  <label className="text-xs">Step Size</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.step_size?.toString()}
                    onChange={(e) => updateParam("step_size", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Gamma</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.01"
                    type="number"
                    value={params.gamma?.toString()}
                    onChange={(e) => updateParam("gamma", parseFloat(e.target.value))}
                  />
                </>
              )}
              {type === "exponentiallr" && (
                <>
                  <label className="text-xs">Gamma</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.01"
                    type="number"
                    value={params.gamma?.toString()}
                    onChange={(e) => updateParam("gamma", parseFloat(e.target.value))}
                  />
                </>
              )}
              {type === "cosineannealinglr" && (
                <>
                  <label className="text-xs">T Max</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.T_max?.toString()}
                    onChange={(e) => updateParam("T_max", parseInt(e.target.value))}
                  />
                </>
              )}
              {type === "reducelronplateau" && (
                <>
                  <label className="text-xs">Factor</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.01"
                    type="number"
                    value={params.factor?.toString()}
                    onChange={(e) => updateParam("factor", parseFloat(e.target.value))}
                  />
                  <label className="text-xs">Patience</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.patience?.toString()}
                    onChange={(e) => updateParam("patience", parseInt(e.target.value))}
                  />
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="px-4 py-1 rounded bg-yellow-500 text-white" onClick={() => setShowModal(false)}>Close</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// Training Configuration Node - Acts as a hub for optimizers, loss, and schedulers
const TrainingConfigNode = ({
  data,
  type,
  selected,
  isConnectable,
}: NodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [config, setConfig] = useState(
    data.config || {
      epochs: 10,
      batch_size: 32,
      validation_split: 0.2,
      early_stopping: false,
      save_best: true,
    },
  );

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };

    setConfig(newConfig);
    if (data.onConfigChange) {
      data.onConfigChange(newConfig);
    }
  };

  return (
    <div
      className={clsx(
        "bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-lg border-2 pl-20",
        "min-w-[240px] transition-all duration-200",
        selected
          ? "border-white ring-2 ring-emerald-300"
          : "border-transparent",
        isExpanded ? "min-h-[350px]" : "h-[120px]",
      )}
    >
      {/* Input handles for optimizer, loss, scheduler, y (target) */}
      {/* Input handles for optimizer, loss, scheduler, y (target) with improved spacing and right-aligned labels */}
      <Handle
        className="w-3 h-3 bg-orange-400"
        id="optimizer"
        isConnectable={isConnectable}
        position={Position.Left}
        style={{ top: "18%" }}
        type="target"
      />
      <div className="absolute left-1" style={{ top: '15%' }}>
        <span className="bg-orange-400 text-xs px-2 rounded text-white whitespace-nowrap shadow">Optimizer</span>
      </div>
      <Handle
        className="w-3 h-3 bg-red-500"
        id="loss"
        isConnectable={isConnectable}
        position={Position.Left}
        style={{ top: "33%" }}
        type="target"
      />
      <div className="absolute left-1" style={{ top: '30%' }}>
        <span className="bg-red-500 text-xs px-2 rounded text-white whitespace-nowrap shadow">Loss</span>
      </div>
      <Handle
        className="w-3 h-3 bg-yellow-500"
        id="scheduler"
        isConnectable={isConnectable}
        position={Position.Left}
        style={{ top: "48%" }}
        type="target"
      />
      <div className="absolute left-1" style={{ top: '45%' }}>
        <span className="bg-yellow-500 text-xs px-2 rounded text-black whitespace-nowrap shadow">Scheduler</span>
      </div>
      <Handle
        className="w-3 h-3 bg-pink-500"
        id="y"
        isConnectable={isConnectable}
        position={Position.Left}
        style={{ top: "63%" }}
        type="target"
      />
      <div className="absolute left-1" style={{ top: '60%' }}>
        <span className="bg-pink-500 text-xs px-2 rounded text-white whitespace-nowrap shadow">y (target)</span>
      </div>
      {/* Main network input from the last layer */}
      <Handle
        className="w-3 h-3 bg-blue-500"
        id="network"
        isConnectable={isConnectable}
        position={Position.Top}
        type="target"
      />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-18px' }}>
        <span className="bg-blue-500 text-xs px-2 rounded text-white whitespace-nowrap shadow">Network</span>
      </div>

      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" icon={data.icon || "lucide:settings"} />
            <div>
              <div className="font-bold text-sm">
                {data.label || "Training Config"}
              </div>
              <div className="text-xs opacity-80">
                Epochs: {config.epochs}, Batch: {config.batch_size}
              </div>
            </div>
          </div>
          <Icon
            className="w-4 h-4"
            icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"}
          />
        </div>

        {/* Connection indicators */}
        <div className="flex gap-1 text-xs opacity-90">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <span>Optimizer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>Loss</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span>Scheduler</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 max-h-[230px] overflow-y-auto">
          <div className="text-xs font-semibold opacity-90">
            Training Parameters:
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs">Epochs</label>
              <Input
                className="text-gray-800"
                min="1"
                size="sm"
                type="number"
                value={config.epochs?.toString()}
                onChange={(e) =>
                  updateConfig("epochs", parseInt(e.target.value))
                }
              />
            </div>
            <div>
              <label className="text-xs">Batch Size</label>
              <Input
                className="text-gray-800"
                min="1"
                size="sm"
                type="number"
                value={config.batch_size?.toString()}
                onChange={(e) =>
                  updateConfig("batch_size", parseInt(e.target.value))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs">Validation Split</label>
            <Input
              className="text-gray-800"
              max="1"
              min="0"
              size="sm"
              step="0.1"
              type="number"
              value={config.validation_split?.toString()}
              onChange={(e) =>
                updateConfig("validation_split", parseFloat(e.target.value))
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              isSelected={config.early_stopping}
              size="sm"
              onValueChange={(value) => updateConfig("early_stopping", value)}
            />
            <label className="text-xs">Early Stopping</label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              isSelected={config.save_best}
              size="sm"
              onValueChange={(value) => updateConfig("save_best", value)}
            />
            <label className="text-xs">Save Best Model</label>
          </div>
        </div>
      )}

      {/* Output handle for metrics/results */}
      <Handle
        className="w-3 h-3 bg-green-500"
        id="metrics"
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};

// Metrics Node - Shows training results
const MetricsNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [metrics] = useState(
    data.metrics || {
      accuracy: 0.95,
      loss: 0.05,
      val_accuracy: 0.92,
      val_loss: 0.08,
    },
  );

  return (
    <div
      className={clsx(
        "bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg border-2",
        "min-w-[180px] transition-all duration-200 p-4",
        selected ? "border-white ring-2 ring-green-300" : "border-transparent",
      )}
    >
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />

      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5" icon={data.icon} />
        <div>
          <div className="font-bold text-sm">{data.label}</div>
          <div className="text-xs opacity-80">{data.details}</div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Accuracy:</span>
          <span className="font-mono">
            {(metrics.accuracy * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Loss:</span>
          <span className="font-mono">{metrics.loss.toFixed(3)}</span>
        </div>
        <div className="flex justify-between">
          <span>Val Acc:</span>
          <span className="font-mono">
            {(metrics.val_accuracy * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Val Loss:</span>
          <span className="font-mono">{metrics.val_loss.toFixed(3)}</span>
        </div>
      </div>

      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};

// Update the nodeTypes object to use renamed layers and new text nodes
export const nodeTypes = {
  database_config: memo((props: NodeProps) => <DatabaseConfigNode {...props} />),
  dataset: memo((props: NodeProps) => <DatasetNode {...props} />),
  graphNode: memo((props: NodeProps) => <GraphNode {...props} />),
  neuralLayer: memo((props: NodeProps) => <NeuralLayerNode {...props} />),
  textInput: memo((props: NodeProps) => <TextInput {...props} />),
  textOutput: memo((props: NodeProps) => <TextOutput {...props} />),
  conv2d: memo((props: NodeProps) => <BaseNode {...props} />),
  maxpool: memo((props: NodeProps) => <BaseNode {...props} />),
  dropout: memo((props: NodeProps) => <DropoutNode {...props} />),
  activation: memo((props: NodeProps) => <BaseNode {...props} />),
  lstm: memo((props: NodeProps) => <BaseNode {...props} />),
  concat: memo((props: NodeProps) => <BaseNode {...props} />),
  flatten: memo((props: NodeProps) => <BaseNode {...props} />),
  reshape: memo((props: NodeProps) => <BaseNode {...props} />),
  batchnorm: memo((props: NodeProps) => <BaseNode {...props} />),
  add: memo((props: NodeProps) => <BaseNode {...props} />),
  subtract: memo((props: NodeProps) => <BaseNode {...props} />),
  multiply: memo((props: NodeProps) => <BaseNode {...props} />),
  average: memo((props: NodeProps) => <BaseNode {...props} />),
  globalavgpool: memo((props: NodeProps) => <BaseNode {...props} />),
  globalmaxpool: memo((props: NodeProps) => <BaseNode {...props} />),
  embedding: memo((props: NodeProps) => <BaseNode {...props} />),
  gru: memo((props: NodeProps) => <BaseNode {...props} />),
  repeatvector: memo((props: NodeProps) => <BaseNode {...props} />),
  bidirectional: memo((props: NodeProps) => <BaseNode {...props} />),
  time_distributed: memo((props: NodeProps) => <BaseNode {...props} />),
  custom: memo((props: NodeProps) => <BaseNode {...props} />),

  // Additional node types for templates
  attention: memo((props: NodeProps) => <BaseNode {...props} />),
  normalization: memo((props: NodeProps) => <BaseNode {...props} />),
  pooling: memo((props: NodeProps) => <BaseNode {...props} />),

  // Optimizers
  adam: memo((props: NodeProps) => <OptimizerNode {...props} />),
  sgd: memo((props: NodeProps) => <OptimizerNode {...props} />),
  rmsprop: memo((props: NodeProps) => <OptimizerNode {...props} />),
  adagrad: memo((props: NodeProps) => <OptimizerNode {...props} />),
  adamw: memo((props: NodeProps) => <OptimizerNode {...props} />),

  // Algorithms
  cnn: memo((props: NodeProps) => <AlgorithmNode {...props} />),
  rnn: memo((props: NodeProps) => <AlgorithmNode {...props} />),
  autoencoder: memo((props: NodeProps) => <AlgorithmNode {...props} />),
  gan: memo((props: NodeProps) => <AlgorithmNode {...props} />),
  transformer: memo((props: NodeProps) => <AlgorithmNode {...props} />),
  resnet: memo((props: NodeProps) => <AlgorithmNode {...props} />),
  vae: memo((props: NodeProps) => <AlgorithmNode {...props} />),

  // Loss Functions
  crossentropy: memo((props: NodeProps) => <LossNode {...props} />),
  mse: memo((props: NodeProps) => <LossNode {...props} />),
  mae: memo((props: NodeProps) => <LossNode {...props} />),
  bce: memo((props: NodeProps) => <LossNode {...props} />),

  // Learning Rate Schedulers
  steplr: memo((props: NodeProps) => <SchedulerNode {...props} />),
  exponentiallr: memo((props: NodeProps) => <SchedulerNode {...props} />),
  cosineannealinglr: memo((props: NodeProps) => <SchedulerNode {...props} />),
  reducelronplateau: memo((props: NodeProps) => <SchedulerNode {...props} />),

  // Training and Metrics
  training_config: memo((props: NodeProps) => (
    <TrainingConfigNode {...props} />
  )),
  metrics: memo((props: NodeProps) => <MetricsNode {...props} />),

  // Add other node types as needed
  softmax: memo((props: NodeProps) => <BaseNode {...props} />),
  recurrent: memo((props: NodeProps) => <BaseNode {...props} />),
};
