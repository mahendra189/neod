import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import nodeStyles from '../nodeStyles';

const GraphNode = ({ data, type, selected, isConnectable }: NodeProps) => {
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
        {/* Icon and title omitted for brevity */}
      </div>
      <div className="bg-white rounded-lg p-3 mb-2 shadow-inner" style={{ height: 200 }}>
        {/* Chart code omitted for brevity */}
      </div>
      {metricsHistory.length > 0 && (
        <div className="flex justify-between text-xs text-blue-100 mt-1">
          <span>Last Loss: <span className="font-mono text-orange-200">{metricsHistory[metricsHistory.length - 1].loss?.toFixed(4)}</span></span>
          <span>Last Acc: <span className="font-mono text-blue-200">{(metricsHistory[metricsHistory.length - 1].acc * 100).toFixed(2)}%</span></span>
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

export default React.memo(GraphNode);
