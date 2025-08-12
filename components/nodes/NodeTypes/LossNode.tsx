import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

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
          className="handle"
          isConnectable={isConnectable}
          position={Position.Left}
          type="target"
        />
        <div className="flex items-center gap-2 mb-2">
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

export default React.memo(LossNode);
