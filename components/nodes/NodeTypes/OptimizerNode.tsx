import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

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
          className="handle"
          isConnectable={isConnectable}
          position={Position.Left}
          type="target"
        />
        <div className="flex items-center gap-2 p-2">
          {/* Icon and label omitted for brevity */}
        </div>
        <div className="text-xs">Double-click to configure</div>
        <Handle
          className="handle"
          isConnectable={isConnectable}
          position={Position.Right}
          type="source"
        />
      </div>
      {/* Modal code omitted for brevity */}
    </>
  );
};

export default React.memo(OptimizerNode);
