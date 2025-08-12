import React, { useState } from 'react';
import clsx from 'clsx';
import { Handle, Position, NodeProps } from 'reactflow';

import { Icon } from '@iconify/react';
import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';

const SchedulerNode = ({ data, selected, isConnectable }: NodeProps) => {
  const schedulerType = data.schedulerType || data.type || "steplr";
  const [showModal, setShowModal] = useState(false);
  const getSchedulerDefaults = () => {
    switch (schedulerType) {
      case "steplr":
        return { step_size: 30, gamma: 0.1 };
      case "exponentiallr":
        return { gamma: 0.95 };
      case "cosineannealinglr":
        return { T_max: 50, eta_min: 0 };
      case "reducelronplateau":
        return { mode: "min", factor: 0.1, patience: 10, threshold: 1e-4 };
      default:
        return {};
    }
  };
  const [params, setParams] = useState(data.params || getSchedulerDefaults());
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
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-lg border-2",
          "min-w-[180px] transition-all duration-200",
          selected ? "border-white ring-2 ring-yellow-300" : "border-transparent",
        )}
        onDoubleClick={() => setShowModal(true)}
      >
        <div className="flex flex-col p-3">
          <div className="flex items-center gap-2">
            {data.icon && <Icon className="w-5 h-5" icon={data.icon} />}
            <span className="font-medium capitalize">{schedulerType} Scheduler</span>
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
          <ModalHeader>Configure Scheduler</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold opacity-90">Parameters:</div>
              {schedulerType === "steplr" ? (
                <>
                  <label className="text-xs">Step Size</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="1"
                    type="number"
                    value={params.step_size?.toString()}
                    onChange={(e) => updateParam("step_size", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Gamma</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.01"
                    type="number"
                    value={params.gamma?.toString()}
                    onChange={(e) => updateParam("gamma", parseFloat(e.target.value))}
                  />
                </>
              ) : schedulerType === "exponentiallr" ? (
                <>
                  <label className="text-xs">Gamma</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.01"
                    type="number"
                    value={params.gamma?.toString()}
                    onChange={(e) => updateParam("gamma", parseFloat(e.target.value))}
                  />
                </>
              ) : schedulerType === "cosineannealinglr" ? (
                <>
                  <label className="text-xs">T_max</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="1"
                    type="number"
                    value={params.T_max?.toString()}
                    onChange={(e) => updateParam("T_max", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Eta Min</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.001"
                    type="number"
                    value={params.eta_min?.toString()}
                    onChange={(e) => updateParam("eta_min", parseFloat(e.target.value))}
                  />
                </>
              ) : schedulerType === "reducelronplateau" ? (
                <>
                  <label className="text-xs">Mode</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    type="text"
                    value={params.mode?.toString()}
                    onChange={(e) => updateParam("mode", e.target.value)}
                  />
                  <label className="text-xs">Factor</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.01"
                    type="number"
                    value={params.factor?.toString()}
                    onChange={(e) => updateParam("factor", parseFloat(e.target.value))}
                  />
                  <label className="text-xs">Patience</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="1"
                    type="number"
                    value={params.patience?.toString()}
                    onChange={(e) => updateParam("patience", parseInt(e.target.value))}
                  />
                  <label className="text-xs">Threshold</label>
                  <Input
                    className="text-gray-800"
                    size="sm"
                    step="0.0001"
                    type="number"
                    value={params.threshold?.toString()}
                    onChange={(e) => updateParam("threshold", parseFloat(e.target.value))}
                  />
                </>
              ) : (
                <div>No parameters available.</div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="px-4 py-1 rounded bg-orange-500 text-white" onClick={() => setShowModal(false)}>Close</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default React.memo(SchedulerNode);
