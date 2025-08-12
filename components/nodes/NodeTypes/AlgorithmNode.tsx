import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

const AlgorithmNode = ({ data, type, selected, isConnectable }: NodeProps) => {
  const [showModal, setShowModal] = useState(false);
  const getAlgorithmDefaults = () => {
    switch (type) {
      case "cnn":
        return {
          layers: 3,
          filters: [32, 64, 128],
          kernel_size: 3,
          pool_size: 2,
        };
      case "rnn":
        return { hidden_size: 128, num_layers: 2, bidirectional: false };
      case "lstm":
        return {
          hidden_size: 128,
          num_layers: 2,
          dropout: 0.2,
          bidirectional: false,
        };
      case "transformer":
        return {
          d_model: 512,
          nhead: 8,
          num_layers: 6,
          dim_feedforward: 2048,
          dropout: 0.1,
        };
      case "autoencoder":
        return {
          encoding_dim: 128,
          layers: [512, 256, 128],
          activation: "relu",
        };
      case "gan":
        return {
          latent_dim: 100,
          generator_layers: [256, 512, 1024],
          discriminator_layers: [1024, 512, 256],
        };
      case "resnet":
        return { depth: 50, num_classes: 1000, block_type: "bottleneck" };
      case "vae":
        return {
          latent_dim: 64,
          encoder_layers: [512, 256],
          decoder_layers: [256, 512],
        };
      default:
        return {};
    }
  };
  const [params, setParams] = useState(data.params || getAlgorithmDefaults());
  const updateParam = (key: string, value: any) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    if (data.onParamsChange) {
      data.onParamsChange(newParams);
    }
  };
  const getNodeColor = () => {
    switch (type) {
      case "cnn":
        return "from-blue-500 to-blue-700";
      case "rnn":
      case "lstm":
        return "from-purple-500 to-purple-700";
      case "transformer":
        return "from-green-500 to-green-700";
      case "autoencoder":
      case "vae":
        return "from-indigo-500 to-indigo-700";
      case "gan":
        return "from-red-500 to-red-700";
      case "resnet":
        return "from-teal-500 to-teal-700";
      default:
        return "from-gray-500 to-gray-700";
    }
  };
  return (
    <>
      <div
        className={clsx(
          `bg-gradient-to-r ${getNodeColor()} text-white rounded-lg shadow-lg border-2`,
          "min-w-[220px] transition-all duration-200",
          selected ? "border-white ring-2 ring-blue-300" : "border-transparent",
        )}
        onDoubleClick={() => setShowModal(true)}
      >
        <Handle
          className="handle"
          isConnectable={isConnectable}
          position={Position.Left}
          type="target"
        />
        <div className="flex items-center gap-2 p-2">
          {/* Icon and label omitted for brevity */}
        </div>
        <div className="text-xs">Double-click to configure</div>
        <Handle
          className="handle"
          isConnectable={isConnectable}
          position={Position.Right}
          type="source"
        />
      </div>
      {/* Modal code omitted for brevity */}
    </>
  );
};

export default React.memo(AlgorithmNode);
