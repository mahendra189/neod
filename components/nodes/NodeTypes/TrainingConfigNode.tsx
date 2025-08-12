import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

const TrainingConfigNode = ({ data, type, selected, isConnectable }: NodeProps) => {
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
  const updateConfig = (key: keyof typeof config, value: typeof config[keyof typeof config]) => {
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
      {/* Handles and content omitted for brevity */}
    </div>
  );
};

export default React.memo(TrainingConfigNode);
