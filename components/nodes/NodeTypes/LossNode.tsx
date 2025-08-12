import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';
import { Icon } from '@iconify/react';
import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';

const LossNode = ({ data, selected, isConnectable }: NodeProps) => {
  const lossType = data.lossType || data.type || "crossentropy";
  const [showModal, setShowModal] = useState(false);
  const getLossDefaults = () => {
    switch (lossType) {
      case "crossentropy":
        return { reduction: "mean" };
      case "mse":
        return { reduction: "mean" };
      case "mae":
        return { reduction: "mean" };
      case "bce":
        return { reduction: "mean", pos_weight: 1.0 };
      default:
        return {};
    }
  };
  const [params, setParams] = useState(data.params || getLossDefaults());
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
          "bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg shadow-lg border-2",
          "min-w-[160px] transition-all duration-200 p-3",
          selected ? "border-white ring-2 ring-red-300" : "border-transparent",
        )}
        onDoubleClick={() => setShowModal(true)}
      >
        <div className="flex flex-col p-3">
          <div className="flex items-center gap-2">
            {data.icon && <Icon className="w-5 h-5" icon={data.icon} />}
            <span className="font-medium capitalize">{lossType} Loss</span>
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
          <ModalHeader>Configure Loss</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold opacity-90">Parameters:</div>
              <label className="text-xs">Reduction</label>
              <Input
                className="text-gray-800"
                size="sm"
                type="text"
                value={params.reduction?.toString()}
                onChange={(e) => updateParam("reduction", e.target.value)}
              />
              {lossType === "bce" && (
                <>
                  <label className="text-xs">Pos Weight</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.01"
                    type="number"
                    value={params.pos_weight?.toString()}
                    onChange={(e) => updateParam("pos_weight", parseFloat(e.target.value))}
                  />
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="px-4 py-1 rounded bg-red-600 text-white" onClick={() => setShowModal(false)}>Close</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default React.memo(LossNode);
