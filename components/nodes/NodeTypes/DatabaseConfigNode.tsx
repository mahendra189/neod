import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import nodeStyles from '../nodeStyles';
import { Icon } from '@iconify/react';
import { Checkbox, CheckboxGroup, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from '@heroui/react';

const DatabaseConfigNode = ({ data, type, selected, isConnectable }: NodeProps) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedX, setSelectedX] = useState<string[]>(data.selectedX || []);
    const [selectedY, setSelectedY] = useState<string[]>(data.selectedY || []);



    const handleXChange = (values: string[]) => {
        setSelectedX(values);
        data.onChange?.({ 
            selectedX: values,
            outputX: {
                columns: values,
                trainSplit: data.trainSplit ?? 0.8,
                shuffle: data.shuffle ?? true,
                stratify: data.stratify ?? false
            }
        });
    };

    const handleYChange = (values: string[]) => {
        setSelectedY(values);
        data.onChange?.({ 
            selectedY: values,
            outputY: {
                columns: values,
                trainSplit: data.trainSplit ?? 0.8,
                shuffle: data.shuffle ?? true,
                stratify: data.stratify ?? false
            }
        });
    };

    // Only show minimal info on node
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
            {/* Output handles for X and y */}
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
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <ModalContent>
                    <ModalHeader>Database Config</ModalHeader>
                    <ModalBody>
                        <div className="mb-2">
                            <div className="text-xs font-semibold mb-1">Select X (features):</div>
                            {(data.xColumns || []).length > 30 ? (
                                <div className="mb-2">
                                    <div className="text-xs text-red-600 mb-2">
                                        Too many columns to display ({data.xColumns.length}). Showing as a formatted list below:
                                    </div>
                                    <div className="bg-emerald-100 text-emerald-900 rounded p-2 text-xs max-h-40 overflow-y-auto whitespace-pre-wrap break-all">
                                        {data.xColumns.join(', ')}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-700">
                                        You can still select columns programmatically or by filtering.
                                    </div>
                                </div>
                            ) : (data.xColumns || []).length > 10 ? (
                                <>
                                    <CheckboxGroup
                                        value={selectedX}
                                        onValueChange={handleXChange}
                                        className="grid grid-cols-2 gap-2"
                                    >
                                        {(data.xColumns || []).map((col: string) => (
                                            <Checkbox key={col} value={col}>{col}</Checkbox>
                                        ))}
                                    </CheckboxGroup>
                                    {/* Show selected X as chips */}
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedX.map((val: string) => (
                                            <span key={val} className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-xs">{val}</span>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <CheckboxGroup
                                        value={selectedX}
                                        onValueChange={handleXChange}
                                        className="flex flex-wrap gap-2"
                                    >
                                        {(data.xColumns || []).map((col: string) => (
                                            <Checkbox key={col} value={col}>{col}</Checkbox>
                                        ))}
                                    </CheckboxGroup>
                                    {/* Show selected X as chips */}
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedX.map((val: string) => (
                                            <span key={val} className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-xs">{val}</span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="mb-2">
                            <div className="text-xs font-semibold mb-1">Select y (target):</div>
                            <CheckboxGroup
                                value={selectedY}
                                onValueChange={handleYChange}
                                className="flex flex-wrap gap-2"
                            >
                                {(data.yColumns || []).map((col: string) => (
                                    <Checkbox key={col} value={col}>{col}</Checkbox>
                                ))}
                            </CheckboxGroup>
                            {/* Show selected Y as chips */}
                            <div className="flex flex-wrap gap-1 mt-1">
                                {selectedY.map((val: string) => (
                                    <span key={val} className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-xs">{val}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 items-end mb-2">
                            <div className="flex-1">
                                <label className="text-xs">Train Split</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={data.trainSplit ?? 0.8}
                                    onChange={e => {
                                        const value = Math.min(1, Math.max(0, parseFloat(e.target.value)));
                                        data.onChange?.({ trainSplit: value });
                                    }}
                                    className="w-full text-xs p-1 rounded border border-emerald-300"
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="text-xs flex items-center gap-1">
                                    <Switch checked={data.shuffle ?? true} onChange={val => data.onChange?.({ shuffle: val })} /> Shuffle
                                </label>
                                <label className="text-xs flex items-center gap-1">
                                    <Switch checked={data.stratify ?? false} onChange={val => data.onChange?.({ stratify: val })} /> Stratify
                                </label>
                            </div>
                        </div>
                        {Array.isArray(data.preview) && data.preview.length > 0 && (
                            <div className="bg-white/80 text-black rounded p-1 text-xs mt-2 overflow-x-auto">
                                <div className="font-semibold mb-1">Preview</div>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr>
                                            {Object.keys(data.preview[0]).map((col) => (
                                                <th key={col} className="px-1 text-left">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.preview.slice(0, 3).map((row: any, i: number) => (
                                            <tr key={i}>
                                                {Object.values(row).map((val: any, j: number) => (
                                                    <td key={j} className="px-1">{val}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <button className="px-4 py-1 rounded bg-emerald-700 text-white" onClick={() => setShowModal(false)}>Close</button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default React.memo(DatabaseConfigNode);
