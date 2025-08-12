import React from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import nodeStyles from '../nodeStyles';
import { Icon } from '@iconify/react';

const DatasetNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const dataset = data.dataset || 'mnist';
  const setDataset = (value: string) => {
    if (typeof data.onDatasetChange === 'function') {
      data.onDatasetChange(value);
    }
    // Pass dataset to downstream nodes if callback exists
    if (typeof data.onDataPass === 'function') {
      data.onDataPass({ dataset: value });
    }
  };
  const handleCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (typeof data.onCsvUpload === 'function') {
        data.onCsvUpload(e.target.files[0]);
      }
      // Pass file to downstream nodes if callback exists
      if (typeof data.onDataPass === 'function') {
        data.onDataPass({ dataset: 'csv', file: e.target.files[0] });
      }
    }
  };
  return (
    <div
      className={clsx(
        'bg-gradient-to-r from-gray-700 to-gray-500 text-white rounded-lg shadow-lg border-2',
        'min-w-[180px] max-w-[260px] transition-all duration-200 p-3',
        selected ? 'border-white ring-2 ring-gray-300' : 'border-transparent',
      )}
    >
      <Handle
        className={nodeStyles.handle}
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" icon="lucide:database" />
        <div>
          <div className="font-bold text-sm">Dataset</div>
          <div className="text-xs opacity-80">Select for training</div>
        </div>
      </div>
      <select
        className="w-full text-black rounded p-1 text-xs"
        value={dataset}
        onChange={e => setDataset(e.target.value)}
      >
        <option value="mnist">MNIST (images)</option>
        <option value="iris">Iris (tabular)</option>
        <option value="csv">Upload CSV</option>
      </select>
      {dataset === 'csv' && (
        <input
          type="file"
          accept=".csv"
          className="mt-2 w-full text-xs"
          onChange={handleCsv}
        />
      )}
    </div>
  );
};

export default React.memo(DatasetNode);
