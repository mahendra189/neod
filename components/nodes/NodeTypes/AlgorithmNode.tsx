import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

import { Icon } from '@iconify/react';
import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';

const AlgorithmNode = ({ data, selected, isConnectable }: NodeProps) => {
  const algorithmType = data.algorithmType || data.type || "cnn";
  const [showModal, setShowModal] = useState(false);
  const getAlgorithmDefaults = () => {
    switch (algorithmType) {
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

  return (
    <>
      <div
        className={clsx(
          "bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-lg border-2",
          "min-w-[180px] transition-all duration-200 p-3",
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
        <div className="flex flex-col p-3">
          <div className="flex items-center gap-2">
            {data.icon && <Icon className="w-5 h-5" icon={data.icon} />}
            <span className="font-medium capitalize">{algorithmType} Algorithm</span>
          </div>
          <div className="text-xs mt-2 opacity-70">Double-click to configure</div>
        </div>
        <Handle
          className="handle"
          isConnectable={isConnectable}
          position={Position.Right}
          type="source"
        />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <ModalHeader>Configure Algorithm</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold opacity-90">Parameters:</div>
              {/* CNN */}
              {algorithmType === "cnn" && (
                <>
                  <label className="text-xs">Layers</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.layers?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("layers", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Filters (comma separated)</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="text"
                    value={params.filters?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("filters", e.target.value.split(',').map(Number))}
                  />
                  <label className="text-xs">Kernel Size</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.kernel_size?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("kernel_size", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Pool Size</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.pool_size?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("pool_size", parseInt(e.target.value))}
                  />
                </>
              )}
              {/* RNN */}
              {algorithmType === "rnn" && (
                <>
                  <label className="text-xs">Hidden Size</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.hidden_size?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("hidden_size", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Num Layers</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.num_layers?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("num_layers", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Bidirectional</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="checkbox"
                    checked={!!params.bidirectional}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("bidirectional", e.target.checked)}
                  />
                </>
              )}
              {/* LSTM */}
              {algorithmType === "lstm" && (
                <>
                  <label className="text-xs">Hidden Size</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.hidden_size?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("hidden_size", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Num Layers</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.num_layers?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("num_layers", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Dropout</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.dropout?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("dropout", parseFloat(e.target.value))}
                  />
                  <label className="text-xs">Bidirectional</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="checkbox"
                    checked={!!params.bidirectional}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("bidirectional", e.target.checked)}
                  />
                </>
              )}
              {/* Transformer */}
              {algorithmType === "transformer" && (
                <>
                  <label className="text-xs">d_model</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.d_model?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("d_model", parseInt(e.target.value))}
                  />
                  <label className="text-xs">nhead</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.nhead?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("nhead", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Num Layers</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.num_layers?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("num_layers", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Dim Feedforward</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.dim_feedforward?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("dim_feedforward", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Dropout</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.dropout?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("dropout", parseFloat(e.target.value))}
                  />
                </>
              )}
              {/* Autoencoder */}
              {algorithmType === "autoencoder" && (
                <>
                  <label className="text-xs">Encoding Dim</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.encoding_dim?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("encoding_dim", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Layers (comma separated)</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="text"
                    value={params.layers?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("layers", e.target.value.split(',').map(Number))}
                  />
                  <label className="text-xs">Activation</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="text"
                    value={params.activation?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("activation", e.target.value)}
                  />
                </>
              )}
              {/* GAN */}
              {algorithmType === "gan" && (
                <>
                  <label className="text-xs">Latent Dim</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.latent_dim?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("latent_dim", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Generator Layers (comma separated)</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="text"
                    value={params.generator_layers?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("generator_layers", e.target.value.split(',').map(Number))}
                  />
                  <label className="text-xs">Discriminator Layers (comma separated)</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="text"
                    value={params.discriminator_layers?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("discriminator_layers", e.target.value.split(',').map(Number))}
                  />
                </>
              )}
              {/* ResNet */}
              {algorithmType === "resnet" && (
                <>
                  <label className="text-xs">Depth</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.depth?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("depth", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Num Classes</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.num_classes?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("num_classes", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Block Type</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="text"
                    value={params.block_type?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("block_type", e.target.value)}
                  />
                </>
              )}
              {/* VAE */}
              {algorithmType === "vae" && (
                <>
                  <label className="text-xs">Latent Dim</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="number"
                    value={params.latent_dim?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("latent_dim", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Encoder Layers (comma separated)</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="text"
                    value={params.encoder_layers?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("encoder_layers", e.target.value.split(',').map(Number))}
                  />
                  <label className="text-xs">Decoder Layers (comma separated)</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="text"
                    value={params.decoder_layers?.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam("decoder_layers", e.target.value.split(',').map(Number))}
                  />
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="px-4 py-1 rounded bg-blue-600 text-white" onClick={() => setShowModal(false)}>Close</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default React.memo(AlgorithmNode);
