import React from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

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
        className="handle"
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

export default React.memo(TextOutput);
