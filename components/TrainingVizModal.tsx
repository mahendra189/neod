import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { Activity } from 'lucide-react';

interface TrainingVizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrainingVizModal: React.FC<TrainingVizModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      placement="center"
      size="5xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Training Progress
          </div>
          <p className="text-sm text-default-500 font-normal">
            Real-time visualization of model training metrics
          </p>
        </ModalHeader>

        <ModalBody>
          <div id="tfvis-container" className=" dark:invert  h-[500px] overflow-y-scroll  bg-dark rounded-lg">
            {/* TensorFlow.js vis will be rendered here */}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TrainingVizModal;
