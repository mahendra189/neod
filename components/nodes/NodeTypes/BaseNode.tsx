import React from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import  nodeStyles  from '../nodeStyles';

const BaseNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const isProcessing = data.isProcessing || false;
  const activationLevel = data.activationLevel || 0;

  return (
    <div
      className={clsx(
        nodeStyles.base,
  nodeStyles[type as keyof typeof nodeStyles] || nodeStyles.dense,
        selected && nodeStyles.selected,
        isProcessing && 'ring-2 ring-blue-400 ring-opacity-50 animate-pulse',
        'p-4',
      )}
    >
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />
      <div className="flex items-center gap-2">
        {data.icon && <span className="w-5 h-5">{data.icon}</span>}
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

export default React.memo(BaseNode);
