import React, { useState, useEffect, memo, useRef } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

import { Icon } from '@iconify/react';
import { Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';

interface CNNLayer {
  type: 'conv2d' | 'maxpool' | 'avgpool' | 'dropout' | 'batchnorm' | 'flatten';
  filters?: number;
  kernel_size?: number;
  pool_size?: number;
  strides?: number;
  padding?: 'valid' | 'same';
  activation?: string;
  rate?: number;
}

interface TransformedCNNData {
  layers: Array<{
    type: string;
    filters?: number;
    kernel_size?: number;
    pool_size?: number;
    strides?: number;
    padding?: string;
    activation?: string;
    rate?: number;
  }>;
}

const AlgorithmNode = ({ data, selected, isConnectable }: NodeProps) => {
  const algorithmType = data.algorithmType || data.type || "cnn";
  const [showModal, setShowModal] = useState(false);
  
  // For CNN, use detailed layer configuration
  const getCNNDefaults = (): CNNLayer[] => [
    { type: 'conv2d', filters: 32, kernel_size: 3, activation: 'relu', strides: 1, padding: 'same' },
    { type: 'maxpool', pool_size: 2, strides: 2, padding: 'valid' },
    { type: 'conv2d', filters: 64, kernel_size: 3, activation: 'relu', strides: 1, padding: 'same' },
    { type: 'maxpool', pool_size: 2, strides: 2, padding: 'valid' },
    { type: 'flatten' }
  ];

  const getAlgorithmDefaults = () => {
    switch (algorithmType) {
      case "cnn":
        return { layers: getCNNDefaults() };
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
  
  // For CNN, handle layers separately
  const [cnnLayers, setCnnLayers] = useState<CNNLayer[]>(() => {
    if (algorithmType === "cnn") {
      const existingLayers = params.layers;
      if (Array.isArray(existingLayers) && existingLayers.length > 0 && typeof existingLayers[0] === 'object' && 'type' in existingLayers[0]) {
        // New format with detailed layer config
        return existingLayers as CNNLayer[];
      } else {
        // Old format or no layers, use defaults
        return getCNNDefaults();
      }
    }
    return [];
  });

  // Sync cnnLayers with params.layers when params change
  useEffect(() => {
    if (algorithmType === "cnn" && params.layers && Array.isArray(params.layers)) {
      if (JSON.stringify(params.layers) !== JSON.stringify(cnnLayers)) {
        setCnnLayers(params.layers as CNNLayer[]);
      }
    }
  }, [params.layers, algorithmType]);

  const updateParam = (key: string, value: any) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    if (data.onParamsChange) {
      data.onParamsChange(newParams);
    }
  };

  // Update CNN layers and notify parent
  useEffect(() => {
    if (algorithmType === "cnn") {
      const transformedData: TransformedCNNData = {
        layers: cnnLayers.map(layer => ({
          type: layer.type,
          filters: layer.filters,
          kernel_size: layer.kernel_size,
          pool_size: layer.pool_size,
          strides: layer.strides,
          padding: layer.padding,
          activation: layer.activation,
          rate: layer.rate
        }))
      };
      
      const newParams = { ...params, layers: cnnLayers, transformedData };
      setParams(newParams);
      if (data.onParamsChange) {
        data.onParamsChange(newParams);
      }
    }
  }, [cnnLayers]);

  const updateCnnLayer = (index: number, key: string, value: any) => {
    const newLayers = [...cnnLayers];
    newLayers[index] = { ...newLayers[index], [key]: value };
    setCnnLayers(newLayers);
  };

  const addCnnLayer = (index: number, type: CNNLayer['type']) => {
    if (cnnLayers.length >= 20) return;
    const newLayers = [...cnnLayers];
    const defaultLayer: CNNLayer = type === 'conv2d' 
      ? { type: 'conv2d', filters: 64, kernel_size: 3, activation: 'relu', strides: 1, padding: 'same' }
      : type === 'maxpool' 
      ? { type: 'maxpool', pool_size: 2, strides: 2, padding: 'valid' }
      : type === 'avgpool'
      ? { type: 'avgpool', pool_size: 2, strides: 2, padding: 'valid' }
      : type === 'dropout'
      ? { type: 'dropout', rate: 0.25 }
      : type === 'batchnorm'
      ? { type: 'batchnorm' }
      : { type: 'flatten' };
    
    newLayers.splice(index + 1, 0, defaultLayer);
    setCnnLayers(newLayers);
  };

  const removeCnnLayer = (index: number) => {
    if (cnnLayers.length <= 3) return;
    const newLayers = [...cnnLayers];
    newLayers.splice(index, 1);
    setCnnLayers(newLayers);
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
          {algorithmType === "cnn" && cnnLayers.length > 0 && (
            <div className="text-xs mt-2 opacity-70">
              {cnnLayers.length} layers: {cnnLayers.filter(l => l.type === 'conv2d').length} Conv, {cnnLayers.filter(l => l.type === 'maxpool' || l.type === 'avgpool').length} Pool
            </div>
          )}
          <div className="text-xs mt-1 opacity-70">Double-click to configure</div>
        </div>
        <Handle
          className="handle"
          isConnectable={isConnectable}
          position={Position.Right}
          type="source"
        />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size='5xl'>
        <ModalContent>
          <ModalHeader>Configure {algorithmType.toUpperCase()} Algorithm</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4 h-[600px]">
              {/* CNN Enhanced Configuration */}
              {algorithmType === "cnn" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">CNN Layers Configuration</h3>
                    <div className="text-sm text-slate-500">Total layers: {cnnLayers.length}</div>
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    <Button size="sm" color="primary" onClick={() => addCnnLayer(-1, 'conv2d')}>
                      + Conv2D
                    </Button>
                    <Button size="sm" color="secondary" onClick={() => addCnnLayer(-1, 'maxpool')}>
                      + MaxPool
                    </Button>
                    <Button size="sm" color="secondary" onClick={() => addCnnLayer(-1, 'avgpool')}>
                      + AvgPool
                    </Button>
                    <Button size="sm" color="warning" onClick={() => addCnnLayer(-1, 'dropout')}>
                      + Dropout
                    </Button>
                    <Button size="sm" color="default" onClick={() => addCnnLayer(-1, 'batchnorm')}>
                      + BatchNorm
                    </Button>
                    <Button size="sm" color="success" onClick={() => addCnnLayer(-1, 'flatten')}>
                      + Flatten
                    </Button>
                  </div>

                  <div className="space-y-3 overflow-auto max-h-[400px]">
                    {Array.isArray(cnnLayers) && cnnLayers.map((layer: CNNLayer, idx: number) => (
                      <div key={idx} className={clsx(
                        'p-4 rounded-lg border',
                        layer.type === 'conv2d' ? 'border-blue-200 bg-blue-50' :
                        layer.type === 'maxpool' || layer.type === 'avgpool' ? 'border-green-200 bg-green-50' :
                        layer.type === 'dropout' ? 'border-orange-200 bg-orange-50' :
                        layer.type === 'batchnorm' ? 'border-purple-200 bg-purple-50' :
                        'border-gray-200 bg-gray-50'
                      )}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ 
                              background: layer.type === 'conv2d' ? '#3b82f6' : 
                                         layer.type === 'maxpool' ? '#10b981' :
                                         layer.type === 'avgpool' ? '#059669' :
                                         layer.type === 'dropout' ? '#f59e0b' :
                                         layer.type === 'batchnorm' ? '#8b5cf6' : '#6b7280'
                            }} />
                            <div>
                              <div className="text-sm font-medium">{layer.type.toUpperCase()}</div>
                              <div className="text-xs text-slate-500">
                                {layer.type === 'conv2d' && `${layer.filters} filters, ${layer.kernel_size}x${layer.kernel_size}`}
                                {layer.type === 'maxpool' && `Pool ${layer.pool_size}x${layer.pool_size}`}
                                {layer.type === 'avgpool' && `Pool ${layer.pool_size}x${layer.pool_size}`}
                                {layer.type === 'dropout' && `Rate ${layer.rate}`}
                                {layer.type === 'flatten' && 'Flatten for dense layers'}
                                {layer.type === 'batchnorm' && 'Batch normalization'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {layer.type !== 'flatten' && layer.type !== 'batchnorm' && (
                              <button onClick={() => removeCnnLayer(idx)} className="p-1 rounded hover:bg-red-100 text-red-600" title="Remove layer">
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Layer-specific controls */}
                        <div className="grid grid-cols-2 gap-3">
                          {layer.type === 'conv2d' && (
                            <>
                              <div>
                                <label className="text-xs text-slate-600">Filters</label>
                                <Input
                                  size="sm"
                                  type="number"
                                  min={1}
                                  max={1024}
                                  value={layer.filters?.toString()}
                                  onChange={(e) => updateCnnLayer(idx, 'filters', parseInt(e.target.value) || 32)}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-600">Kernel Size</label>
                                <Input
                                  size="sm"
                                  type="number"
                                  min={1}
                                  max={7}
                                  value={layer.kernel_size?.toString()}
                                  onChange={(e) => updateCnnLayer(idx, 'kernel_size', parseInt(e.target.value) || 3)}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-600">Activation</label>
                                <select
                                  value={layer.activation || 'relu'}
                                  onChange={(e) => updateCnnLayer(idx, 'activation', e.target.value)}
                                  className="w-full p-2 rounded border text-sm"
                                >
                                  <option value="relu">ReLU</option>
                                  <option value="sigmoid">Sigmoid</option>
                                  <option value="tanh">Tanh</option>
                                  <option value="none">None</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-slate-600">Padding</label>
                                <select
                                  value={layer.padding || 'same'}
                                  onChange={(e) => updateCnnLayer(idx, 'padding', e.target.value)}
                                  className="w-full p-2 rounded border text-sm"
                                >
                                  <option value="same">Same</option>
                                  <option value="valid">Valid</option>
                                </select>
                              </div>
                            </>
                          )}
                          
                          {(layer.type === 'maxpool' || layer.type === 'avgpool') && (
                            <>
                              <div>
                                <label className="text-xs text-slate-600">Pool Size</label>
                                <Input
                                  size="sm"
                                  type="number"
                                  min={2}
                                  max={4}
                                  value={layer.pool_size?.toString()}
                                  onChange={(e) => updateCnnLayer(idx, 'pool_size', parseInt(e.target.value) || 2)}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-600">Strides</label>
                                <Input
                                  size="sm"
                                  type="number"
                                  min={1}
                                  max={4}
                                  value={layer.strides?.toString()}
                                  onChange={(e) => updateCnnLayer(idx, 'strides', parseInt(e.target.value) || 2)}
                                />
                              </div>
                            </>
                          )}
                          
                          {layer.type === 'dropout' && (
                            <div>
                              <label className="text-xs text-slate-600">Dropout Rate</label>
                              <Input
                                size="sm"
                                type="number"
                                min={0}
                                max={0.9}
                                step={0.1}
                                value={layer.rate?.toString()}
                                onChange={(e) => updateCnnLayer(idx, 'rate', parseFloat(e.target.value) || 0.25)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Other algorithms - keep existing simple config */}
              {algorithmType !== "cnn" && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-semibold opacity-90">Parameters:</div>
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
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => setShowModal(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default React.memo(AlgorithmNode);
