import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

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
        className="handle"
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />
      <div className="flex items-center gap-2 mb-3">
        {/* Icon and label omitted for brevity */}
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
        className="handle"
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
    </div>
  );
};

export default React.memo(MetricsNode);
