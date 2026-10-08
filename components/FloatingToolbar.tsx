import React, { useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Network, Save, Brain, Code } from "lucide-react";
import { Node, Edge } from "reactflow";

import { SavedProject } from "@/utils/projectStorage";

// CNN Train Button Component
const CNNTrainButton: React.FC<{ nodes: Node[]; edges: Edge[]; compact?: boolean }> = ({ nodes, edges, compact = true }) => {
  const [isTraining, setIsTraining] = useState(false);

  // Check if this is a CNN workflow
  const hasCNNNode = nodes.some(n => n.type === 'algorithm' && n.data?.algorithmType === 'cnn');
  const hasMNISTDataset = nodes.some(n => n.type === 'mnistDataset');

  // Only show if CNN workflow is detected
  if (!hasCNNNode && !hasMNISTDataset) {
    return null;
  }

  const handleTrain = async () => {
    try {
      setIsTraining(true);
      
      // Call the global CNN training function
      if (typeof window !== 'undefined' && (window as any).trainCNNModel) {
        await (window as any).trainCNNModel();
      } else {
        console.error('CNN training function not available');
      }
    } catch (error) {
      console.error('CNN training failed:', error);
    } finally {
      setIsTraining(false);
    }
  };

  if (compact) {
    return (
      <Tooltip content="Train CNN Model">
        <Button
          isIconOnly
          className="shadow-lg"
          color="warning"
          variant="flat"
          onClick={handleTrain}
          disabled={isTraining}
        >
          <Brain className="w-4 h-4" />
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={handleTrain}
      className="w-full flex items-center justify-center gap-2"
      color="warning"
      disabled={isTraining}
    >
      <Brain className="w-4 h-4" />
      {isTraining ? 'Training CNN...' : 'Train CNN'}
    </Button>
  );
};

interface FloatingToolbarProps {
  nodes: Node[];
  edges: Edge[];
  onLayout: () => void;
  onSaveProject: () => void;
  currentProject?: SavedProject | null;
  onLoadTemplate?: (template: any) => void;
  onLoadProject?: (project: any) => void;
  onIssueSelect?: (nodeId: string) => void;
  onToggleCodePanel?: () => void;
  showCodePanel?: boolean;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  nodes,
  edges,
  onLayout,
  onSaveProject,
  currentProject,
  onToggleCodePanel,
  showCodePanel,
}) => {

  return (
    <div className="flex flex-col gap-2">
      {/* Always Visible - Key Actions */}
      <div className="flex gap-2">
        <Tooltip content={currentProject ? "Update Project" : "Save Project"}>
          <Button
            isIconOnly
            className="shadow-lg"
            color="success"
            variant="flat"
            onClick={onSaveProject}
          >
            <Save className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Auto Layout">
          <Button
            isIconOnly
            className="shadow-lg"
            color="default"
            variant="solid"
            onClick={onLayout}
          >
            <Network className="w-4 h-4" />
          </Button>
        </Tooltip>

        {onToggleCodePanel && (
          <Tooltip content={showCodePanel ? "Hide Code Panel" : "Generate Code"}>
            <Button
              isIconOnly
              className="shadow-lg"
              color="primary"
              variant={showCodePanel ? "solid" : "flat"}
              onClick={onToggleCodePanel}
            >
              <Code className="w-4 h-4" />
            </Button>
          </Tooltip>
        )}

        <CNNTrainButton nodes={nodes} edges={edges} />
      </div>
    </div>
  );
};

export default FloatingToolbar;
