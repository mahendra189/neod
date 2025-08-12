import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import nodeStyles from '../nodeStyles';

const DropoutNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [showModal, setShowModal] = useState(false);
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    data.onChange?.({ ...data, params: { ...data.params, rate: value } });
  };
  return (
    <>
      <div
        className={clsx(
          'w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-md group relative cursor-pointer',
          'transition-all duration-200',
          selected ? 'ring-2 ring-pink-300 shadow-lg' : '',
          'bg-pink-500',
        )}
        onDoubleClick={() => setShowModal(true)}
      >
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Left}
          type="target"
        />
        <span className="text-white text-xs font-medium">Dropout</span>
        <span className="text-white text-xs">{data.params?.rate ?? 0.5}</span>
        <Handle
          className={nodeStyles.handle}
          isConnectable={isConnectable}
          position={Position.Right}
          type="source"
        />
      </div>
      {/* Modal code omitted for brevity */}
    </>
  );
};

export default React.memo(DropoutNode);
