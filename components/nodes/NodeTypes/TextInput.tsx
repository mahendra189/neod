import React from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

const TextInput = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [inputValue, setInputValue] = React.useState(data.value || "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    data.onChange?.(newValue);
  };

  React.useEffect(() => {
    setInputValue(data.value || "");
  }, [data.value]);

  const isProcessing = data.isProcessing || false;
  const activationLevel = data.activationLevel || 0;

  return (
    <div
      className={clsx(
        "bg-gray-900 border-2 border-gray-700 rounded-lg shadow-md p-3 min-w-[200px]",
        "transition-all duration-200",
        selected ? "border-blue-500 shadow-lg" : "",
        isProcessing
          ? "ring-2 ring-green-400 ring-opacity-50 animate-pulse"
          : "",
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-200">
            {data.label || "Text Input"}
          </label>
          {isProcessing && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Processing</span>
            </div>
          )}
        </div>
        <input
          className={clsx(
            "px-3 py-2 border border-gray-700 bg-gray-800 text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            isProcessing ? "border-green-400 bg-gray-750" : "",
          )}
          placeholder="Enter text..."
          type="text"
          value={inputValue}
          onChange={handleInputChange}
        />
        {isProcessing && activationLevel > 0 && (
          <div className="mt-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Activation</span>
              <span>{activationLevel.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div
                className="bg-green-400 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(activationLevel * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
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

export default React.memo(TextInput);
