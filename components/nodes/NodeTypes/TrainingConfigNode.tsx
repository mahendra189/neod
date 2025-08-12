import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import { Icon } from '@iconify/react';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { Modal, ModalContent } from '@heroui/react';

const TrainingConfigNode = ({ data, type, selected, isConnectable }: NodeProps) => {



  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
    <>
      <div
        className={clsx(
          "bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-lg border-2 pl-20",
          "min-w-[240px] transition-all duration-200",
          selected
            ? "border-white ring-2 ring-emerald-300"
            : "border-transparent",
          isExpanded ? "min-h-[350px]" : "h-[120px]",
        )}
        onDoubleClick={() => setShowModal(true)}
      >
        {/* Input handles for optimizer, loss, scheduler, y (target) */}
        <Handle className="w-3 h-3 bg-orange-400" id="optimizer" isConnectable={isConnectable} position={Position.Left} style={{ top: "18%" }} type="target" />
        <div className="absolute left-1" style={{ top: '15%' }}>
          <span className="bg-orange-400 text-xs px-2 rounded text-white whitespace-nowrap shadow">Optimizer</span>
        </div>
        <Handle className="w-3 h-3 bg-red-500" id="loss" isConnectable={isConnectable} position={Position.Left} style={{ top: "33%" }} type="target" />
        <div className="absolute left-1" style={{ top: '30%' }}>
          <span className="bg-red-500 text-xs px-2 rounded text-white whitespace-nowrap shadow">Loss</span>
        </div>
        <Handle className="w-3 h-3 bg-yellow-500" id="scheduler" isConnectable={isConnectable} position={Position.Left} style={{ top: "48%" }} type="target" />
        <div className="absolute left-1" style={{ top: '45%' }}>
          <span className="bg-yellow-500 text-xs px-2 rounded text-black whitespace-nowrap shadow">Scheduler</span>
        </div>
        <Handle className="w-3 h-3 bg-pink-500" id="y" isConnectable={isConnectable} position={Position.Left} style={{ top: "63%" }} type="target" />
        <div className="absolute left-1" style={{ top: '60%' }}>
          <span className="bg-pink-500 text-xs px-2 rounded text-white whitespace-nowrap shadow">y (target)</span>
        </div>
        {/* Main network input from the last layer */}
        <Handle className="w-3 h-3 bg-blue-500" id="network" isConnectable={isConnectable} position={Position.Top} type="target" />
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-18px' }}>
          <span className="bg-blue-500 text-xs px-2 rounded text-white whitespace-nowrap shadow">NN</span>
        </div>
        <div className="p-4 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" icon={data.icon || "lucide:settings"} />
              <div>
                <div className="font-bold text-sm">{data.label || "Training Config"}</div>
                <div className="text-xs opacity-80">Epochs: {config.epochs}, Batch: {config.batch_size}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Output handle for metrics/results */}
        <Handle className="w-3 h-3 bg-green-500" id="metrics" isConnectable={isConnectable} position={Position.Right} type="source" />
      </div>
      {/* Modal for training config options */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <div className="p-4">
            <div className="text-base font-semibold mb-2">Training Parameters</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs">Epochs</label>
                <Input className="text-gray-800" min="1" size="sm" type="number" value={config.epochs?.toString()} onChange={e => updateConfig("epochs", parseInt(e.target.value))} />
              </div>
              <div>
                <label className="text-xs">Batch Size</label>
                <Input className="text-gray-800" min="1" size="sm" type="number" value={config.batch_size?.toString()} onChange={e => updateConfig("batch_size", parseInt(e.target.value))} />
              </div>
            </div>
            <div className="mb-2">
              <label className="text-xs">Validation Split</label>
              <Input className="text-gray-800" max="1" min="0" size="sm" step="0.1" type="number" value={config.validation_split?.toString()} onChange={e => updateConfig("validation_split", parseFloat(e.target.value))} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Switch isSelected={config.early_stopping} size="sm" onValueChange={value => updateConfig("early_stopping", value)} />
              <label className="text-xs">Early Stopping</label>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Switch isSelected={config.save_best} size="sm" onValueChange={value => updateConfig("save_best", value)} />
              <label className="text-xs">Save Best Model</label>
            </div>
            <div className="flex justify-end mt-4">
              <button className="px-4 py-1 rounded bg-emerald-600 text-white" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
export default React.memo(TrainingConfigNode);
