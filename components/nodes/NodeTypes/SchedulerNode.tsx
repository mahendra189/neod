import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

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

export default React.memo(SchedulerNode);
