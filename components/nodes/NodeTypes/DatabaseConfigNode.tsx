import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import nodeStyles from '../nodeStyles';
import { Icon } from '@iconify/react';

const DatabaseConfigNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedX, setSelectedX] = useState(data.selectedX || []);
  const [selectedY, setSelectedY] = useState(data.selectedY || []);

  const handleXChange = (values: any[]) => {
    setSelectedX(values);
    data.onChange?.({ selectedX: values });
  };

  const handleYChange = (values: any[]) => {
    setSelectedY(values);
    data.onChange?.({ selectedY: values });
  };

  return (
    <div
      className={clsx(
        'bg-gradient-to-r from-emerald-700 to-emerald-500 text-white rounded-lg shadow-lg border-2',
        'min-w-[220px] max-w-[340px] transition-all duration-200 p-3',
        selected ? 'border-white ring-2 ring-emerald-300' : 'border-transparent',
        'cursor-pointer'
      )}
      onDoubleClick={() => setShowModal(true)}
    >
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" icon="lucide:settings" />
        <div>
          <div className="font-bold text-sm">Database Config</div>
          <div className="text-xs opacity-80">Preprocess & Split Dataset</div>
        </div>
      </div>
      <div className="text-xs">Double-click to configure</div>
      <Handle
        id="x"
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
        style={{ top: '40%' }}
      />
      <div className="absolute right-2" style={{ top: '38%' }}>
        <span className="bg-emerald-900 text-xs px-1 rounded">X</span>
      </div>
      <Handle
        id="y"
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
        style={{ top: '60%' }}
      />
      <div className="absolute right-2" style={{ top: '58%' }}>
        <span className="bg-emerald-900 text-xs px-1 rounded">y</span>
      </div>
      {/* Modal code omitted for brevity */}
    </div>
  );
};

export default React.memo(DatabaseConfigNode);
