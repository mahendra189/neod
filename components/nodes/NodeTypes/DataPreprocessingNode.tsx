import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import nodeStyles from '../nodeStyles';
import { Icon } from '@iconify/react';
import { 
    Modal, 
    ModalBody, 
    ModalContent, 
    ModalFooter, 
    ModalHeader,
    Switch,
    Select,
    Radio,
    RadioGroup,
} from '@heroui/react';

type PreprocessingConfig = {
    xScaler?: 'minmax' | 'standard' | 'robust' | 'none';
    xFeatureRange?: [number, number];
    xHandleMissing?: 'mean' | 'median' | 'constant' | 'drop';
    xMissingValue?: number;
    yEncoder?: 'label' | 'onehot' | 'ordinal' | 'none';
    yUnknownHandling?: 'error' | 'ignore';
};

const DataPreprocessingNode = ({ data, selected, isConnectable }: NodeProps) => {
    const [showModal, setShowModal] = useState(false);
    
    // Load config from data or use defaults
    const config: PreprocessingConfig = {
        xScaler: data.xScaler || 'standard',
        xFeatureRange: data.xFeatureRange || [-1, 1],
        xHandleMissing: data.xHandleMissing || 'mean',
        xMissingValue: data.xMissingValue || 0,
        yEncoder: data.yEncoder || 'label',
        yUnknownHandling: data.yUnknownHandling || 'error',
        ...data.config
    };

    const handleConfigChange = (changes: Partial<PreprocessingConfig>) => {
        const newConfig = { ...config, ...changes };
        
        // Calculate output shapes based on preprocessing
        const xShape = data.inputData?.xColumns?.length || 0;
        let outputXShape = xShape;
        
        // Adjust shape for different preprocessing methods
        if (newConfig.xScaler !== 'none') {
            // Scaling doesn't change shape
            outputXShape = xShape;
        }

        let outputYShape = 1; // Default for label encoding
        if (newConfig.yEncoder === 'onehot') {
            // One-hot encoding expands to number of unique classes
            outputYShape = data.inputData?.uniqueClasses?.length || 2;
        }

        data.onChange?.({ 
            config: newConfig,
            outputX: {
                ...data.outputX,
                preprocessing: {
                    scaler: newConfig.xScaler,
                    featureRange: newConfig.xFeatureRange,
                    missingHandler: newConfig.xHandleMissing,
                    missingValue: newConfig.xMissingValue
                },
                shape: outputXShape
            },
            outputY: {
                ...data.outputY,
                preprocessing: {
                    encoder: newConfig.yEncoder,
                    unknownHandling: newConfig.yUnknownHandling
                },
                shape: outputYShape
            }
        });
    };

    // Calculate shapes for display
    const inputXShape = data.inputData?.xColumns?.length || '?';
    const outputXShape = data.outputX?.shape || inputXShape;
    const outputYShape = data.outputY?.shape || 1;

    return (
        <div
            className={clsx(
                'bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg shadow-lg border-2',
                'min-w-[220px] max-w-[340px] transition-all duration-200 p-3',
                selected ? 'border-white ring-2 ring-blue-300' : 'border-transparent',
                'cursor-pointer'
            )}
            onDoubleClick={() => setShowModal(true)}
        >
            <Handle
                type="target"
                position={Position.Left}
                id="x_in"
                className={nodeStyles.handle}
                isConnectable={isConnectable}
                style={{ top: '40%' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="y_in"
                className={nodeStyles.handle}
                isConnectable={isConnectable}
                style={{ top: '60%' }}
            />
            
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5" icon="lucide:git-branch" />
                <div>
                    <div className="font-bold text-sm">Data Preprocessing</div>
                    <div className="text-xs opacity-80">Transform Features & Targets</div>
                </div>
            </div>

            <div className="text-xs space-y-1">
                <div className="opacity-75">X: {config.xScaler} scaling ({inputXShape} → {outputXShape})</div>
                <div className="opacity-75">y: {config.yEncoder} encoding ({outputYShape} classes)</div>
            </div>

            <Handle
                type="source"
                position={Position.Right}
                id="x_out"
                className={nodeStyles.handle}
                isConnectable={isConnectable}
                style={{ top: '40%' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="y_out"
                className={nodeStyles.handle}
                isConnectable={isConnectable}
                style={{ top: '60%' }}
            />

            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <ModalContent>
                    <ModalHeader>Data Preprocessing Config</ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            {/* X (Features) Configuration */}
                            <div className="border-b pb-4">
                                <h3 className="font-semibold mb-2 text-sm">Feature (X) Preprocessing</h3>
                                
                                <div className="space-y-3">
                                    {/* Scaler Selection */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Scaling Method</label>
                                        <select
                                            value={config.xScaler}
                                            onChange={(e) => handleConfigChange({ xScaler: e.target.value as any })}
                                            className="w-full rounded-md border border-gray-300 p-1 text-sm"
                                        >
                                            <option value="none">No Scaling</option>
                                            <option value="minmax">Min-Max Scaling</option>
                                            <option value="standard">Standard Scaling</option>
                                            <option value="robust">Robust Scaling</option>
                                        </select>
                                    </div>

                                    {/* Feature Range (for MinMax) */}
                                    {config.xScaler === 'minmax' && (
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Feature Range</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="number"
                                                    value={config.xFeatureRange?.[0] ?? -1}
                                                    onChange={(e) => handleConfigChange({
                                                        xFeatureRange: [parseFloat(e.target.value), config.xFeatureRange?.[1] ?? 1]
                                                    })}
                                                    className="w-20 text-xs p-1 rounded border border-gray-300"
                                                />
                                                <span>to</span>
                                                <input
                                                    type="number"
                                                    value={config.xFeatureRange?.[1] ?? 1}
                                                    onChange={(e) => handleConfigChange({
                                                        xFeatureRange: [config.xFeatureRange?.[0] ?? -1, parseFloat(e.target.value)]
                                                    })}
                                                    className="w-20 text-xs p-1 rounded border border-gray-300"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Missing Value Handling */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Handle Missing Values</label>
                                        <select
                                            value={config.xHandleMissing}
                                            onChange={(e) => handleConfigChange({ xHandleMissing: e.target.value as any })}
                                            className="w-full rounded-md border border-gray-300 p-1 text-sm"
                                        >
                                            <option value="mean">Replace with Mean</option>
                                            <option value="median">Replace with Median</option>
                                            <option value="constant">Replace with Constant</option>
                                            <option value="drop">Drop Rows</option>
                                        </select>

                                        {config.xHandleMissing === 'constant' && (
                                            <input
                                                type="number"
                                                value={config.xMissingValue}
                                                onChange={(e) => handleConfigChange({ xMissingValue: parseFloat(e.target.value) })}
                                                className="mt-2 w-full text-xs p-1 rounded"
                                                placeholder="Replacement value"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Y (Target) Configuration */}
                            <div>
                                <h3 className="font-semibold mb-2 text-sm">Target (y) Preprocessing</h3>
                                
                                <div className="space-y-3">
                                    {/* Encoder Selection */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Encoding Method</label>
                                        <div className="space-y-1">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={config.yEncoder === 'none'}
                                                    onChange={() => handleConfigChange({ yEncoder: 'none' })}
                                                />
                                                <span className="text-sm">No Encoding (Numeric)</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={config.yEncoder === 'label'}
                                                    onChange={() => handleConfigChange({ yEncoder: 'label' })}
                                                />
                                                <span className="text-sm">Label Encoding</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={config.yEncoder === 'onehot'}
                                                    onChange={() => handleConfigChange({ yEncoder: 'onehot' })}
                                                />
                                                <span className="text-sm">One-Hot Encoding</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={config.yEncoder === 'ordinal'}
                                                    onChange={() => handleConfigChange({ yEncoder: 'ordinal' })}
                                                />
                                                <span className="text-sm">Ordinal Encoding</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Unknown Value Handling */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Unknown Categories</label>
                                        <div className="space-y-1">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={config.yUnknownHandling === 'error'}
                                                    onChange={() => handleConfigChange({ yUnknownHandling: 'error' })}
                                                />
                                                <span className="text-sm">Raise Error</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    checked={config.yUnknownHandling === 'ignore'}
                                                    onChange={() => handleConfigChange({ yUnknownHandling: 'ignore' })}
                                                />
                                                <span className="text-sm">Ignore (Use Most Frequent)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button 
                            className="px-4 py-1 rounded bg-blue-700 text-white hover:bg-blue-600" 
                            onClick={() => setShowModal(false)}
                        >
                            Close
                        </button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default React.memo(DataPreprocessingNode);
