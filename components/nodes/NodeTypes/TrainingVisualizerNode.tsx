import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import { Icon } from '@iconify/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrainingVisualizerNodeProps extends NodeProps {
  data: {
    label?: string;
    icon?: string;
    details?: string;
    trainingHistory?: Array<{
      epoch: number;
      loss: number;
      accuracy: number;
      valLoss?: number;
      valAccuracy?: number;
    }>;
    currentEpoch?: number;
    totalEpochs?: number;
    isTraining?: boolean;
  };
}

const TrainingVisualizerNode = ({ data, selected, isConnectable }: TrainingVisualizerNodeProps) => {
  const [history, setHistory] = useState(data.trainingHistory || []);
  const currentEpoch = data.currentEpoch || 0;
  const totalEpochs = data.totalEpochs || 10;
  const isTraining = data.isTraining || false;

  useEffect(() => {
    if (data.trainingHistory) {
      setHistory(data.trainingHistory);
    }
  }, [data.trainingHistory]);

  const latestMetrics = history.length > 0 ? history[history.length - 1] : null;
  const progress = totalEpochs > 0 ? (currentEpoch / totalEpochs) * 100 : 0;

  return (
    <div
      className={clsx(
        "bg-white border-2 border-gray-300 rounded-lg shadow-md p-4 min-w-[420px]",
        "transition-all duration-200",
        selected ? "border-blue-400 shadow-lg" : "",
        isTraining && "ring-2 ring-blue-400 ring-opacity-50"
      )}
    >
      <Handle
        className="handle"
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />
      
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Icon 
            className={clsx("text-blue-600", isTraining && "animate-spin")} 
            icon={isTraining ? "lucide:loader" : data.icon || "lucide:activity"} 
            width={24} 
          />
          <div className="flex-1">
            <div className="font-bold text-sm text-gray-800">
              {data.label || "Training Visualizer"}
            </div>
            <div className="text-xs text-gray-600">
              {data.details || "Real-time training metrics"}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Epoch {currentEpoch} / {totalEpochs}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={clsx(
                "h-2 rounded-full transition-all duration-300",
                isTraining ? "bg-blue-500 animate-pulse" : "bg-green-500"
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Current Metrics */}
        {latestMetrics && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="text-xs text-gray-600">Loss</div>
              <div className="text-lg font-bold text-red-600">
                {latestMetrics.loss.toFixed(4)}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <div className="text-xs text-gray-600">Accuracy</div>
              <div className="text-lg font-bold text-green-600">
                {(latestMetrics.accuracy * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        )}

        {/* Training Charts */}
        {history.length > 0 && (
          <div className="space-y-3">
            {/* Loss Chart */}
            <div className="border border-gray-200 rounded p-2">
              <div className="text-xs font-medium text-gray-700 mb-2">Loss Curve</div>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={history}>
                  <XAxis 
                    dataKey="epoch" 
                    tick={{ fontSize: 10 }}
                    stroke="#666"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    stroke="#666"
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value: any) => (typeof value === 'number' ? value.toFixed(4) : value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="loss" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name="Training Loss"
                  />
                  {history.some(h => h.valLoss !== undefined) && (
                    <Line 
                      type="monotone" 
                      dataKey="valLoss" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      strokeDasharray="5 5"
                      name="Val Loss"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Accuracy Chart */}
            <div className="border border-gray-200 rounded p-2">
              <div className="text-xs font-medium text-gray-700 mb-2">Accuracy Curve</div>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={history}>
                  <XAxis 
                    dataKey="epoch" 
                    tick={{ fontSize: 10 }}
                    stroke="#666"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    stroke="#666"
                    domain={[0, 1]}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value: any) => (typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name="Training Acc"
                  />
                  {history.some(h => h.valAccuracy !== undefined) && (
                    <Line 
                      type="monotone" 
                      dataKey="valAccuracy" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      strokeDasharray="5 5"
                      name="Val Acc"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Status */}
        <div className={clsx(
          "text-xs text-center py-1 rounded",
          isTraining ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600"
        )}>
          {isTraining ? "Training in progress..." : history.length > 0 ? "Training completed" : "Waiting to start..."}
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

export default React.memo(TrainingVisualizerNode);
