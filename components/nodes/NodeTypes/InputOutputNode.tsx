import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

const InputOutputNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [count, setCount] = useState(data.count || 1);
  const label = type === 'inputLayer' ? 'Input Neurons' : 'Output Neurons';
  const color = type === 'inputLayer' ? 'bg-blue-500' : 'bg-green-500';

  const handleCountChange = (delta: number) => {
    const newCount = Math.max(1, count + delta);
    setCount(newCount);
    data.onChange?.(newCount);
  };

  useEffect(() => {
    setCount(data.count || 1);
  }, [data.count]);

  return (
    <div
      className={clsx(
        `w-32 rounded-lg flex flex-col items-center justify-center shadow-md relative cursor-pointer p-4`,
        selected ? 'ring-2 ring-blue-300 shadow-lg' : '',
        color
      )}
    >
      <Handle
        className="handle"
        isConnectable={isConnectable}
        position={type === 'inputLayer' ? Position.Right : Position.Left}
        type={type === 'inputLayer' ? 'source' : 'target'}
      />
      <div className="font-bold text-white mb-2 text-sm">{label}</div>
      <div className="flex items-center gap-2">
        <button
          className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold"
          onClick={() => handleCountChange(-1)}
        >
          -
        </button>
        <span className="text-lg font-mono text-white">{count}</span>
        <button
          className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold"
          onClick={() => handleCountChange(1)}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default React.memo(InputOutputNode);
