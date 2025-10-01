import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import { Button } from '@heroui/button';
import { Icon } from '@iconify/react';

interface MNISTDatasetNodeProps extends NodeProps {
  data: {
    label?: string;
    icon?: string;
    details?: string;
    dataLoaded?: boolean;
    trainSize?: number;
    testSize?: number;
    onLoadData?: () => Promise<void>;
  };
}

const MNISTDatasetNode = ({ data, selected, isConnectable }: MNISTDatasetNodeProps) => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(data.dataLoaded || false);
  const [stats, setStats] = useState({
    trainSize: data.trainSize || 0,
    testSize: data.testSize || 0,
  });

  const handleLoadData = async () => {
    setLoading(true);
    try {
      if (data.onLoadData) {
        await data.onLoadData();
      }
      // Simulate loading MNIST dataset
      // In real implementation, this would fetch from mnist package or load from files
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStats({
        trainSize: 60000,
        testSize: 10000,
      });
      setLoaded(true);
    } catch (error) {
      console.error('Error loading MNIST data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={clsx(
        "bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg shadow-md p-4 min-w-[260px]",
        "transition-all duration-200",
        selected ? "border-purple-500 shadow-lg" : "",
      )}
    >
      <Handle
        className="handle"
        isConnectable={isConnectable}
        position={Position.Right}
        type="source"
      />
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icon className="text-purple-600" icon={data.icon || "lucide:database"} width={24} />
          <div className="flex-1">
            <div className="font-bold text-sm text-gray-800">
              {data.label || "MNIST Dataset"}
            </div>
            <div className="text-xs text-gray-600">
              {data.details || "Handwritten digits dataset"}
            </div>
          </div>
        </div>

        {!loaded ? (
          <Button
            className="w-full"
            color="primary"
            isLoading={loading}
            size="sm"
            onClick={handleLoadData}
          >
            {loading ? 'Loading...' : 'Load MNIST Data'}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Training Set:</span>
              <span className="font-mono font-bold text-green-600">{stats.trainSize.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Test Set:</span>
              <span className="font-mono font-bold text-blue-600">{stats.testSize.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
              <Icon icon="lucide:check-circle" width={16} />
              <span>Dataset Ready</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-1 mt-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <div
              key={digit}
              className="bg-white border border-gray-300 rounded text-center text-xs py-1 font-mono"
            >
              {digit}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MNISTDatasetNode);
