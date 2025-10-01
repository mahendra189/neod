import React from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

const CNNOutputNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  // MNIST has 10 classes (digits 0-9)
  const classes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const predictions = data.predictions || new Array(10).fill(0);
  const predictedClass = data.predictedClass !== undefined ? data.predictedClass : null;

  return (
    <div
      className={clsx(
        "bg-white border-2 border-gray-300 rounded-lg shadow-md p-4 min-w-[280px]",
        "transition-all duration-200",
        selected ? "border-green-400 shadow-lg" : "",
      )}
    >
      <Handle
        className="handle"
        isConnectable={isConnectable}
        position={Position.Left}
        type="target"
      />
      <div className="flex flex-col gap-3">
        <div className="text-sm font-medium text-gray-700 text-center">
          {data.label || "CNN MNIST Output"}
        </div>

        {/* Predicted digit display */}
        {predictedClass !== null && (
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              Predicted: {predictedClass}
            </div>
            <div className="text-xs text-gray-500">Most likely digit</div>
          </div>
        )}

        {/* Confidence bars for each digit */}
        <div className="space-y-1">
          <div className="text-xs text-gray-600 mb-2 text-center">Confidence Scores</div>
          {classes.map((digit, index) => {
            const confidence = predictions[index] || 0;
            const percentage = Math.round(confidence * 100);
            const isPredicted = predictedClass === parseInt(digit);

            return (
              <div key={digit} className="flex items-center gap-2">
                <div className="w-4 text-xs font-mono text-gray-600">{digit}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <div
                    className={clsx(
                      "h-3 rounded-full transition-all duration-300",
                      isPredicted ? "bg-green-500" : "bg-blue-500"
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="w-8 text-xs text-right text-gray-600">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Status message */}
        <div className="text-xs text-gray-500 text-center mt-2">
          {data.status || "Waiting for input..."}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CNNOutputNode);