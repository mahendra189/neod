import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";


// Refactored nodeTypesByCategory to match the modular node system
const nodeTypesByCategory = [
  {
    category: "Input/Output",
    nodes: [
      { type: "inputOutput", label: "Input/Output", icon: "lucide:box", details: "Input or Output Node" },
      { type: "textInput", label: "Text Input", icon: "lucide:type", details: "Text Input Node" },
      { type: "textOutput", label: "Text Output", icon: "lucide:file-text", details: "Text Output Node" },
      { type: "dataset", label: "Dataset", icon: "lucide:database", details: "Dataset Node" },
      { type: "graph", label: "Graph", icon: "lucide:activity", details: "Graph Node" },
    ],
  },
  {
    category: "Core Layers",
    nodes: [
      { type: "neuralLayer", label: "Neural Layer", icon: "lucide:grid", details: "Neural Network Layer" },
      { type: "denseHidden", label: "Dense/Hidden", icon: "lucide:layers", details: "Dense/Hidden Layer" },
      { type: "base", label: "Base Node", icon: "lucide:square", details: "Base Node" },
      { type: "dropout", label: "Dropout", icon: "lucide:cloud-rain", details: "Dropout Layer" },
    ],
  },
  {
    category: "Config & Training",
    nodes: [
      { type: "databaseConfig", label: "Database Config", icon: "lucide:settings", details: "Database Config Node" },
      { type: "dataPreprocessing", label: "Preprocessing", icon: "lucide:git-branch", details: "Data Preprocessing Node" },
      { type: "trainingConfig", label: "Training Config", icon: "lucide:settings", details: "Training Configuration Hub" },
      { type: "metrics", label: "Metrics", icon: "lucide:bar-chart-3", details: "Training Metrics" },
    ],
  },
  {
    category: "Optimizers",
    nodes: [
      { type: "optimizer", label: "Optimizer", icon: "lucide:zap", details: "Optimizer Node" },
    ],
  },
  {
    category: "Algorithms",
    nodes: [
      { type: "algorithm", label: "Algorithm", icon: "lucide:cpu", details: "Algorithm Node" },
    ],
  },
  {
    category: "Loss Functions",
    nodes: [
      { type: "loss", label: "Loss", icon: "lucide:target", details: "Loss Node" },
    ],
  },
  {
    category: "Schedulers",
    nodes: [
      { type: "scheduler", label: "Scheduler", icon: "lucide:clock", details: "Scheduler Node" },
    ],
  },
];

const Sidebar: React.FC = () => {
  const onDragStart = (
    event: React.DragEvent,
    node: (typeof nodeTypesByCategory)[0]["nodes"][0],
  ) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(node));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card className="w-64 m-4">
      <CardBody>
        <h2 className="text-lg font-semibold mb-4">Node Types</h2>
        <div className="flex flex-col gap-2">
          {nodeTypesByCategory.map((category) => (
            <div key={category.category} className="mb-2">
              <div className="text-xs font-bold text-gray-500 mb-1">
                {category.category}
              </div>
              <div className="flex flex-col gap-1">
                {category.nodes.map((node) => (
                  <Button
                    key={node.type}
                    draggable
                    className="justify-start"
                    variant="flat"
                    onDragStart={(event) => onDragStart(event, node)}
                  >
                    <Icon className="mr-2" icon={node.icon} />
                    {node.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default Sidebar;
