import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import { Icon } from '@iconify/react';
import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';

const OptimizerNode = ({ data, selected, isConnectable }: NodeProps) => {
  const optimizerType = data.optimizerType || data.type || "adam";
  const [showModal, setShowModal] = useState(false);
  const getOptimizerDefaults = () => {
    switch (optimizerType) {
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
        <div className="flex flex-col p-3">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" icon={data.icon} />
            <span className="font-medium capitalize">{optimizerType} Optimizer</span>
          </div>
          <div className="text-xs mt-1 opacity-80">Learning Rate: {params.lr}</div>
          <div className="text-xs mt-2 opacity-70">Double-click to configure</div>
        </div>
        <Handle
          className="handle"
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
              {optimizerType === "adam" || optimizerType === "adamw" ? (
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
                  {optimizerType === "adamw" && (
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
              ) : optimizerType === "sgd" ? (
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
              ) : optimizerType === "rmsprop" ? (
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
                  <label className="text-xs">Alpha</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.01"
                    type="number"
                    value={params.alpha?.toString()}
                    onChange={(e) => updateParam("alpha", parseFloat(e.target.value))}
                  />
                  <label className="text-xs">Epsilon</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.00001"
                    type="number"
                    value={params.eps?.toString()}
                    onChange={(e) => updateParam("eps", parseFloat(e.target.value))}
                  />
                  <label className="text-xs">Weight Decay</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.001"
                    type="number"
                    value={params.weight_decay?.toString()}
                    onChange={(e) => updateParam("weight_decay", parseFloat(e.target.value))}
                  />
                </>
              ) : optimizerType === "adagrad" ? (
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
                  <label className="text-xs">LR Decay</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.001"
                    type="number"
                    value={params.lr_decay?.toString()}
                    onChange={(e) => updateParam("lr_decay", parseFloat(e.target.value))}
                  />
                  <label className="text-xs">Weight Decay</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.001"
                    type="number"
                    value={params.weight_decay?.toString()}
                    onChange={(e) => updateParam("weight_decay", parseFloat(e.target.value))}
                  />
                  <label className="text-xs">Epsilon</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.00001"
                    type="number"
                    value={params.eps?.toString()}
                    onChange={(e) => updateParam("eps", parseFloat(e.target.value))}
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

export default React.memo(OptimizerNode);
