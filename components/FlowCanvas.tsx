import React, { useCallback, useRef, useState, useEffect } from "react";
import { Copy, Download, X } from "lucide-react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  useReactFlow,
  ConnectionMode,
} from "reactflow";
import { Icon } from "@iconify/react";
import { Card, CardBody, CardFooter, RadioGroup, Radio } from "@heroui/react";
import { Button } from "@heroui/button";

import nodeTypes from "./nodes/CustomNodes";
import Papa from 'papaparse';
import { NetworkCodeGenerator } from "./CodeGenerator";
import { getLayoutedElements } from "./utils/layoutUtils";
import { getTemplateByType } from "./templates/templateDefinitions";
import HelpSystem from "./HelpSystem";
import ModelValidator from "./ModelValidator";
import type { Node, Edge } from 'reactflow';
import FloatingToolbar from "./FloatingToolbar";
import SaveProjectModal from "./SaveProjectModal";
import { useToast } from "./ToastProvider";
import TfjsRunner from "../runner/tfjsRunner";
import { LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import PerformanceAnalysis from "./PerformanceAnalysis";

import ProjectStorage, { SavedProject } from "@/utils/projectStorage";
import "reactflow/dist/style.css";

interface FlowCanvasProps {
  onNodeSelect: (node: Node | null) => void;
  templateType?: string | null;
  projectId?: string | null;
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  onNodeSelect,
  templateType,
  projectId,
}) => {
  const { showSuccess, showError } = useToast();
  // Default simple text processing network
  const getDefaultNodes = (): Node[] => [
    {
      id: "inputlayer-1",
      type: "inputLayer",
      data: {
        label: "Input Layer (10)",
        icon: "lucide:square-dot-minus",
        details: "MNIST input layer - 28x28 flattened",
        count: 10,
        params: { shape: [10] },
        onChange: (newCount: number) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === "inputlayer-1"
                ? {
                  ...node,
                  data: {
                    ...node.data,
                    count: Math.max(1, newCount),
                    params: { shape: [newCount] },
                  },
                }
                : node,
            ),
          );
        },
      },
      position: { x: 300, y: 200 },
    },
    {
      id: "output-1",
      type: "outputLayer",
      data: {
        label: "Output (10 classes)",
        count: 10,
        icon: "lucide:arrow-right",
        details: "MNIST output - 10 classes",
        params: { activation: "softmax", units: 10 },
        onChange: (newCount: number) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === "output-1"
                ? {
                  ...node,
                  data: { ...node.data, count: Math.max(1, newCount) },
                }
                : node,
            ),
          );
        },
      },
      position: { x: 800, y: 200 },
    },
    {
      id: "graph-1",
      type: "graphNode",
      data: {
        label: "Training Graph",
        icon: "lucide:line-chart",
        details: "Live Loss & Accuracy",
        metricsHistory: [],
      },
      position: { x: 1050, y: 200 },
    },
  ];

  const getDefaultEdges = (): Edge[] => [
    {
      id: "e-textinput-inputlayer",
      source: "input-1",
      target: "inputlayer-1",
      animated: true,
      type: "smooth",
    },
    {
      id: "e-inputlayer-dense",
      source: "inputlayer-1",
      target: "dense-1",
      animated: true,
      type: "smooth",
    },
    {
      id: "e-dense-output",
      source: "dense-1",
      target: "output-1",
      animated: true,
      type: "smooth",
    },
    {
      id: "e-output-graph",
      source: "output-1",
      target: "graph-1",
      animated: false,
      type: "smooth",
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(getDefaultNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getDefaultEdges());
  // Dataset node state by node id
  const [datasetNodeState, setDatasetNodeState] = useState<Record<string, { dataset: string; csvFile?: File; columns?: string[] }>>({});

  // Handler for dataset node changes
  const handleDatasetChange = useCallback((nodeId: string, dataset: string) => {
    setDatasetNodeState(prev => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], dataset }
    }));
  }, []);

  const handleCsvUpload = useCallback((nodeId: string, file: File) => {
    // Parse CSV header for columns
    Papa.parse(file, {
      header: true,
      preview: 1,
      complete: (results: Papa.ParseResult<any>) => {
        const columns = results.meta.fields || [];
        setDatasetNodeState(prev => ({
          ...prev,
          [nodeId]: { ...prev[nodeId], csvFile: file, dataset: 'csv', columns },
        }));
      },
    });
  }, []);

  // Find the dataset node connected to the input layer
  const getSelectedDataset = () => {
    const inputNode = nodes.find(n => n.type === 'inputLayer');
    if (!inputNode) return { dataset: 'mnist' };
    const datasetEdge = edges.find(e => e.target === inputNode.id && nodes.find(n => n.id === e.source && n.type === 'dataset'));
    if (!datasetEdge) return { dataset: 'mnist' };
    const datasetNodeId = datasetEdge.source;
    const state = datasetNodeState[datasetNodeId];
    if (!state) return { dataset: 'mnist' };
    if (state.dataset === 'csv' && state.csvFile) {
      return { dataset: state.csvFile };
    }
    return { dataset: String(state.dataset) };
  };

  // Update nodes and edges when template type changes
  useEffect(() => {
    if (templateType) {
      const template = getTemplateByType(templateType);

      if (template) {
        setNodes(template.nodes);
        setEdges(template.edges);
      }
    }
  }, [templateType, setNodes, setEdges]);

  // Load project when projectId changes
  useEffect(() => {
    if (projectId) {
      const project = ProjectStorage.getProject(projectId);

      if (project) {
        setNodes(project.nodes);
        setEdges(project.edges);
        setCurrentProjectId(projectId);
        setCurrentProject(project);
      }
    } else {
      setCurrentProjectId(null);
      setCurrentProject(null);
    }
  }, [projectId, setNodes, setEdges]);
  const [showPanel, setShowPanel] = useState(false);
  // Real-time execution state
  const [runner, setRunner] = useState<TfjsRunner | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [liveChartData, setLiveChartData] = useState<{ epoch: number, loss: number, acc: number }[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs, setTotalEpochs] = useState(10);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [tensorPreview, setTensorPreview] = useState<any>(null);
  const [inferenceMode, setInferenceMode] = useState(false);
  const [liveWarning, setLiveWarning] = useState<string | null>(null);
  const [framework, setFramework] = useState<"tensorflow" | "pytorch">(
    "pytorch",
  );
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [validationIssues, setValidationIssues] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<SavedProject | null>(
    null,
  );
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { project, fitView } = useReactFlow();

  // Helper function to close panel and reset state
  const closePanel = useCallback(() => {
    setShowPanel(false);
    setGeneratedCode("");
    setError("");
  }, []);

  // Handle clicking outside the panel to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showPanel &&
        panelRef.current &&
        !panelRef.current.contains(event.target as HTMLElement) &&
        !(event.target as Element).closest('[aria-label="Show code panel"]')
      ) {
        closePanel();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showPanel) {
        closePanel();
      }
    };

    if (showPanel) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showPanel, closePanel]);

  // Custom onConnect to support X/y handle propagation from DatabaseConfigNode
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge(params, eds));
      // If the source is a DatabaseConfigNode and has a handle id ("x" or "y"), propagate info to downstream node
      const sourceNode = nodes.find(n => n.id === params.source);
      if (sourceNode && sourceNode.type === "database_config" && params.sourceHandle) {
        setNodes(nds => nds.map(node => {
          if (node.id === params.target) {
            // Attach info about which handle (X or y) is connected
            return {
              ...node,
              data: {
                ...node.data,
                inputFrom: params.sourceHandle // 'x' or 'y'
              }
            };
          }
          return node;
        }));
      }
    },
    [setEdges, nodes, setNodes],
  );

  // Auto layout function
  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      "LR",
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);

    window.requestAnimationFrame(() => {
      fitView();
    });
  }, [nodes, edges, setNodes, setEdges, fitView]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current!.getBoundingClientRect();
      const nodeData = JSON.parse(
        event.dataTransfer.getData("application/reactflow"),
      );

      if (!nodeData) return;

      // Check if trying to add input/output node when one already exists
      const hasInputNode = nodes.some(
        (node) => node.type === "textInput" || node.type === "inputLayer",
      );
      const hasOutputNode = nodes.some((node) => node.type === "outputLayer");

      if (
        (nodeData.type === "textInput" || nodeData.type === "inputLayer") &&
        hasInputNode
      ) {
        alert("Only one input node is allowed");

        return;
      }
      if (nodeData.type === "outputLayer" && hasOutputNode) {
        alert("Only one output node is allowed");

        return;
      }

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Special handling for optimizer, scheduler, and loss nodes
      let nodeType = nodeData.type;
      let optimizerType = nodeData.optimizerType;
      let schedulerType = nodeData.schedulerType;
      let lossType = nodeData.lossType;
      if (["adam", "sgd", "rmsprop", "adagrad", "adamw"].includes(nodeData.type)) {
        nodeType = "optimizer";
        optimizerType = nodeData.type;
      } else if (["steplr", "exponentiallr", "cosineannealinglr", "reducelronplateau"].includes(nodeData.type)) {
        nodeType = "scheduler";
        schedulerType = nodeData.type;
      } else if (["crossentropy", "mse", "mae", "bce"].includes(nodeData.type)) {
        nodeType = "loss";
        lossType = nodeData.type;
      }
      const newNode: Node = {
        id: Date.now().toString(),
        type: nodeType,
        position,
        data: {
          label: nodeData.label,
          icon: nodeData.icon,
          details: nodeData.details,
          ...(optimizerType ? {
            optimizerType,
            params: nodeData.params || {},
            onParamsChange: (newParams: any) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === newNode.id
                    ? {
                      ...node,
                      data: {
                        ...node.data,
                        params: newParams,
                      },
                    }
                    : node,
                ),
              );
            },
          } : {}),
          ...(schedulerType ? {
            schedulerType,
            params: nodeData.params || {},
            onParamsChange: (newParams: any) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === newNode.id
                    ? {
                      ...node,
                      data: {
                        ...node.data,
                        params: newParams,
                      },
                    }
                    : node,
                ),
              );
            },
          } : {}),
          ...(lossType ? {
            lossType,
            params: nodeData.params || {},
            onParamsChange: (newParams: any) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === newNode.id
                    ? {
                      ...node,
                      data: {
                        ...node.data,
                        params: newParams,
                      },
                    }
                    : node,
                ),
              );
            },
          } : {}),
          ...([
            "inputLayer",
            "outputLayer",
            "hidden",
            "dense",
            "embedding",
            "lstm",
          ].includes(nodeType)
            ? {
              count:
                nodeType === "inputLayer"
                  ? 784
                  : nodeType === "outputLayer"
                    ? 1
                    : nodeType === "embedding"
                      ? 64
                      : nodeType === "lstm"
                        ? 128
                        : 128,
              onChange: (newCount: number) => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === newNode.id
                      ? {
                        ...node,
                        data: {
                          ...node.data,
                          count: Math.max(1, newCount),
                        },
                      }
                      : node,
                  ),
                );
              },
            }
            : {}),
          // Add text value handling for text input nodes
          ...(nodeType === "textInput"
            ? {
              value: "Enter name...",
              onChange: (newValue: string) => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === newNode.id
                      ? {
                        ...node,
                        data: {
                          ...node.data,
                          value: newValue,
                        },
                      }
                      : node,
                  ),
                );
              },
            }
            : {}),
          // Add parameter handling for algorithm, loss, and scheduler nodes
          ...([
            "cnn",
            "rnn",
            "lstm",
            "transformer",
            "autoencoder",
            "gan",
            "resnet",
            "vae",
            "crossentropy",
            "mse",
            "mae",
            "bce",
            "steplr",
            "exponentiallr",
            "cosineannealinglr",
            "reducelronplateau",
          ].includes(nodeType)
            ? {
              params: {},
              onParamsChange: (newParams: any) => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === newNode.id
                      ? {
                        ...node,
                        data: {
                          ...node.data,
                          params: newParams,
                        },
                      }
                      : node,
                  ),
                );
              },
            }
            : {}),
          // Add configuration handling for training config nodes
          ...(nodeType === "training_config"
            ? {
              config: {
                epochs: 10,
                batch_size: 32,
                validation_split: 0.2,
                early_stopping: false,
                save_best: true,
              },
              onConfigChange: (newConfig: any) => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === newNode.id
                      ? {
                        ...node,
                        data: {
                          ...node.data,
                          config: newConfig,
                        },
                      }
                      : node,
                  ),
                );
              },
            }
            : {}),
          // Add metrics handling for metrics nodes
          ...(nodeType === "metrics"
            ? {
              metrics: {
                accuracy: 0.0,
                loss: 0.0,
                val_accuracy: 0.0,
                val_loss: 0.0,
              },
            }
            : {}),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, project, nodes],
  );

  // Handle loading a template
  const handleLoadTemplate = useCallback(
    (template: any) => {
      setNodes(template.nodes);
      setEdges(template.edges);

      // Auto-layout the loaded template
      setTimeout(() => {
        onLayout();
      }, 100);
    },
    [setNodes, setEdges],
  );

  // Handle loading a project
  const handleLoadProject = useCallback(
    (project: any) => {
      setNodes(project.nodes);
      setEdges(project.edges);

      // Auto-layout the loaded project
      setTimeout(() => {
        onLayout();
      }, 100);
    },
    [setNodes, setEdges],
  );

  // Handle highlighting a node (from validator)
  const handleIssueSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setTimeout(() => {
      setSelectedNodeId(null);
    }, 3000);
  }, []);

  // Inline model analysis logic for instant feedback
  useEffect(() => {
    // --- ModelValidator logic (robust) ---
    // Support neuralLayer stack node as unified input/output
    const neuralLayerNodes = nodes.filter((n: Node) => n.type === "neuralLayer");
    const denseNodes = nodes.filter((n: Node) => n.type === "dense");
    const dropoutNodes = nodes.filter((n: Node) => n.type === "dropout");
    const convNodes = nodes.filter((n: Node) => n.type === "conv2d");
    const trainingConfigNodes = nodes.filter((n: Node) => n.type === "training_config");
    const issues: any[] = [];
    // Validation checks
    if (neuralLayerNodes.length === 0) {
      issues.push({
        id: "no-neurallayer",
        type: "error",
        title: "No Neural Layer",
        description: "Your model needs at least one neural layer to build model.",
      });
    }
    // Disconnected nodes
    const connectedNodeIds = new Set();
    edges.forEach((edge: Edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    const disconnectedNodes = nodes.filter((node: Node) => !connectedNodeIds.has(node.id) && node.type !== "textInput");
    if (disconnectedNodes.length > 0) {
      issues.push({
        id: "disconnected-nodes",
        type: "error",
        title: `Disconnected Nodes`,
        description: "Some nodes are not connected to the main network flow.",
      });
    }
    // Check for required connections to Training Config node
    trainingConfigNodes.forEach(tcNode => {
      const tcEdges = edges.filter(e => e.target === tcNode.id);
      const hasOptimizer = tcEdges.some(e => e.targetHandle === 'optimizer');
      const hasLoss = tcEdges.some(e => e.targetHandle === 'loss');
      const hasY = tcEdges.some(e => e.targetHandle === 'y');
      const hasNetwork = tcEdges.some(e => e.targetHandle === 'network');
      if (!hasOptimizer) {
        issues.push({
          id: `tc-no-optimizer-${tcNode.id}`,
          type: "error",
          title: "Training Config Missing Optimizer",
          description: "Connect an optimizer node to the Training Config node.",
        });
      }
      if (!hasLoss) {
        issues.push({
          id: `tc-no-loss-${tcNode.id}`,
          type: "error",
          title: "Training Config Missing Loss",
          description: "Connect a loss node to the Training Config node.",
        });
      }
      if (!hasY) {
        issues.push({
          id: `tc-no-y-${tcNode.id}`,
          type: "error",
          title: "Training Config Missing y (target)",
          description: "Connect the y (target) output from Database Config to the Training Config node.",
        });
      }
      if (!hasNetwork) {
        issues.push({
          id: `tc-no-network-${tcNode.id}`,
          type: "error",
          title: "Training Config Missing Network",
          description: "Connect the last layer of your model to the Training Config node.",
        });
      }
    });
    // Check for shape mismatches between connected nodes (basic check: count property)
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode && sourceNode.data && targetNode.data) {
        if (typeof sourceNode.data.count === 'number' && typeof targetNode.data.count === 'number') {
          if (edge.targetHandle !== 'y' && sourceNode.data.count !== targetNode.data.count) {
            issues.push({
              id: `shape-mismatch-${edge.id}`,
              type: "warning",
              title: "Shape Mismatch",
              description: `Node ${sourceNode.data.label || sourceNode.type} (count: ${sourceNode.data.count}) is connected to ${targetNode.data.label || targetNode.type} (count: ${targetNode.data.count}), but their sizes differ.`,
            });
          }
        }
      }
    });
    setValidationIssues(issues);
    // Show toast for errors/warnings
    if (issues.length > 0) {
      const error = issues.find(i => i.type === 'error');
      if (error) showError('Model Error', error.title + ': ' + error.description);
      else {
        const warning = issues.find(i => i.type === 'warning');
        if (warning) showError('Model Warning', warning.title + ': ' + warning.description);
      }
    }
  }, [nodes, edges, showError]);

  // Handle saving a project
  const handleSaveProject = useCallback(() => {
    // If we're working on an existing project, update it directly
    if (currentProjectId && currentProject) {
      const updatedProject = ProjectStorage.updateProject(currentProjectId, {
        nodes,
        edges,
        nodeCount: nodes.length,
      });

      if (updatedProject) {
        setCurrentProject(updatedProject);
        showSuccess(
          "Project Updated!",
          `"${updatedProject.name}" has been saved with your latest changes.`,
        );
      } else {
        showError(
          "Update Failed",
          "Failed to update the project. Please try again.",
        );
      }
    } else {
      // If it's a new project, show the save modal
      setShowSaveModal(true);
    }
  }, [currentProjectId, currentProject, nodes, edges, showSuccess, showError]);

  // Handle save success for new projects
  const handleSaveSuccess = useCallback(
    (project: SavedProject) => {
      setCurrentProjectId(project.id);
      setCurrentProject(project);
      showSuccess(
        "Project Saved!",
        `"${project.name}" has been saved successfully.`,
      );
    },
    [showSuccess],
  );

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError("");

      const generator = new NetworkCodeGenerator(nodes, edges);

      let code;

      if (framework === "tensorflow") {
        code = generator.generateTensorFlowCode();
      } else {
        code = generator.generatePyTorchCode();
      }

      setGeneratedCode(code);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setGeneratedCode("");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const downloadCode = () => {
    const extension = framework === "tensorflow" ? "tf.py" : "torch.py";
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `neural_network_${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadNotebook = () => {
    try {
      const generator = new NetworkCodeGenerator(nodes, edges);
      let notebook;
      let filename;

      if (framework === "tensorflow") {
        notebook = generator.generateTensorFlowNotebook();
        filename = "tensorflow_training_notebook.ipynb";
      } else {
        notebook = generator.generatePyTorchNotebook();
        filename = "pytorch_training_notebook.ipynb";
      }

      const blob = new Blob([JSON.stringify(notebook, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate notebook",
      );
    }
  };

  // --- Real-time runner handlers ---
  const handleRun = async (mode: 'train' | 'inference') => {
    if (isRunning) return;
    setIsRunning(true);
    setInferenceMode(mode === 'inference');
    setLiveChartData([]);
    setTensorPreview(null);
    setCurrentEpoch(0);
    setLiveWarning(null);
    const tfjsRunner = new TfjsRunner();
    setRunner(tfjsRunner);
    tfjsRunner.on('epochEnd', (epoch: number, logs: any) => {
      setLiveChartData((prev) => [...prev, { epoch, loss: logs.loss ?? 0, acc: logs.acc ?? logs.accuracy ?? 0 }]);
      setCurrentEpoch(epoch + 1);
      setLiveMetrics({ accuracy: logs.acc ?? logs.accuracy ?? 0, loss: logs.loss ?? 0 });
      setNodes((nds) => {
        const outputNodeIds = nds.filter(n => n.type === 'outputLayer' || n.type === 'metrics').map(n => n.id);
        return nds.map(node => {
          if (node.type === 'graphNode') {
            const incoming = edges.filter(e => e.target === node.id);
            const isConnected = incoming.some(e => outputNodeIds.includes(e.source));
            if (isConnected) {
              const prevHistory = Array.isArray(node.data.metricsHistory) ? node.data.metricsHistory : [];
              return {
                ...node,
                data: {
                  ...node.data,
                  metricsHistory: [...prevHistory, { epoch, loss: logs.loss ?? 0, acc: logs.acc ?? logs.accuracy ?? 0 }],
                },
              };
            }
          }
          return node;
        });
      });
    });
    tfjsRunner.on('nodeExecute', (nodeId: string, info: any) => {
      setHighlightedNode(nodeId);
      if (mode === 'inference') setTensorPreview(info.output);
    });
    tfjsRunner.on('warning', (msg: string) => setLiveWarning(msg));
    tfjsRunner.on('inferenceEnd', () => setIsRunning(false));
    tfjsRunner.on('complete', () => setIsRunning(false));
    tfjsRunner.on('error', (err: Error) => {
      setIsRunning(false);
      setLiveWarning(err.message);
    });
    // Use selected dataset from dataset node
    const { dataset } = getSelectedDataset();
    await tfjsRunner.run({
      mode,
      networkJson: { nodes, edges },
      dataset: dataset as import("../runner/tfjsRunner").DatasetType | File,
      epochs: totalEpochs,
      batchSize: 32,
      onEpochEnd: () => { },
      onNodeExecute: () => { },
      onWarning: () => { },
      onError: () => { },
      onComplete: () => { },
    });
  };
  const handlePause = () => { runner?.pause(); setIsPaused(true); };
  const handleResume = () => { runner?.resume(); setIsPaused(false); };
  const handleStop = () => { runner?.stop(); setIsRunning(false); setIsPaused(false); };

  return (
    <div
      ref={reactFlowWrapper}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {/* Real-time execution controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-white/80 dark:bg-black/40 rounded-lg shadow p-2">
        <Button color="primary" disabled={isRunning} onClick={() => handleRun('train')}>Run</Button>
        <Button color="secondary" disabled={isRunning} onClick={() => handleRun('inference')}>Inference</Button>
        <Button color="warning" disabled={!isRunning || isPaused} onClick={handlePause}>Pause</Button>
        <Button color="success" disabled={!isRunning || !isPaused} onClick={handleResume}>Resume</Button>
        <Button color="danger" disabled={!isRunning} onClick={handleStop}>Stop</Button>
      </div>


      {/* Model Validator Button (top right) */}
      <div className="absolute top-4 right-56 z-20">
        <ModelValidator nodes={nodes} edges={edges} onIssueSelect={handleIssueSelect} />
      </div>

      {/* Main ReactFlow canvas */}
      {/* Custom nodeTypes to inject dataset node state/handlers, memoized to avoid React Flow error */}
      {/** Memoize customNodeTypes to avoid recreating on every render */}
      {(() => {
        // Memoize customNodeTypes
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const customNodeTypes = React.useMemo(() => ({
          ...nodeTypes,
          dataset: (props: any) => {
            const DatasetNode = nodeTypes.dataset.type || nodeTypes.dataset;
            return (
              <DatasetNode
                {...props}
                data={{
                  ...props.data,
                  dataset: datasetNodeState[props.id]?.dataset || 'mnist',
                  onDatasetChange: (ds: string) => handleDatasetChange(props.id, ds),
                  onCsvUpload: (file: File) => handleCsvUpload(props.id, file),
                }}
              />
            );
          },
          databaseConfig: (props: any) => {
            // Find incoming edge from dataset node
            const incoming = edges.find(e => e.target === props.id && nodes.find(n => n.id === e.source && n.type === 'dataset'));
            let xColumns: string[] = [];
            let yColumns: string[] = [];
            if (incoming) {
              const datasetNodeId = incoming.source;
              const dsState = datasetNodeState[datasetNodeId];
              if (dsState) {
                if (dsState.dataset === 'csv' && Array.isArray(dsState.columns)) {
                  xColumns = dsState.columns;
                  yColumns = dsState.columns;
                } else if (dsState.dataset === 'mnist') {
                  xColumns = Array.from({ length: 784 }, (_, i) => `pixel${i}`);
                  yColumns = ['digit'];
                } else if (dsState.dataset === 'iris') {
                  xColumns = ['sepalLength', 'sepalWidth', 'petalLength', 'petalWidth'];
                  yColumns = ['species'];
                }
              }
            }
            const DatabaseConfigNode = nodeTypes.databaseConfig.type || nodeTypes.databaseConfig;
            return (
              <DatabaseConfigNode
                {...props}
                data={{
                  ...props.data,
                  xColumns,
                  yColumns,
                }}
              />
            );
          },
        }), [nodeTypes, datasetNodeState, handleDatasetChange, handleCsvUpload]);
        return (
          <ReactFlow
            fitView
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={{
              type: "smooth",
              animated: true,
            }}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            edges={edges.map(edge => {
              // If the edge is from a database_config node and has a sourceHandle, add a label
              const sourceNode = nodes.find(n => n.id === edge.source);
              if (sourceNode && sourceNode.type === 'database_config' && edge.sourceHandle) {
                return {
                  ...edge,
                  label: edge.sourceHandle === 'x' ? 'X' : edge.sourceHandle === 'y' ? 'y' : undefined,
                  labelStyle: { fill: '#059669', fontWeight: 700, fontSize: 13, background: '#fff' },
                  labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
                  labelShowBg: true,
                };
              }
              return edge;
            })}
            fitViewOptions={{ padding: 0.2 }}
            nodeTypes={customNodeTypes}
            nodes={nodes.map((node) => ({
              ...node,
              style: {
                ...node.style,
                ...(selectedNodeId === node.id || highlightedNode === node.id
                  ? {
                    boxShadow: "0 0 0 3px #f59e42",
                    border: "2px solid #f59e42",
                  }
                  : {}),
              },
            }))}
            selectNodesOnDrag={false}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => onNodeSelect(node)}
            onNodesChange={onNodesChange}
          >
            <Controls />
            <Background color="#aaa" gap={20} />
          </ReactFlow>
        );
      })()}

      {/* Collapsible Toolbar - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <FloatingToolbar
          currentProject={currentProject}
          edges={edges}
          nodes={nodes}
          showCodePanel={showPanel}
          onIssueSelect={handleIssueSelect}
          onLayout={onLayout}
          onLoadProject={handleLoadProject}
          onLoadTemplate={handleLoadTemplate}
          onSaveProject={handleSaveProject}
          onToggleCodePanel={() => setShowPanel((prev) => !prev)}
        />
      </div>

      {/* Help System - Positioned below toolbar */}
      <div className="absolute top-16 right-4 z-10">
        <HelpSystem />
      </div>

      {showPanel && (
        <Card
          ref={panelRef}
          className="shadow-lg border animate-in slide-in-from-right-4 fade-in-0 duration-200"
          style={{
            position: "absolute",
            top: 60,
            right: 20,
            width: generatedCode ? 600 : 360,
            maxHeight: "calc(100vh - 100px)",
            zIndex: 30, // Higher than toolbar
            maxWidth: "calc(100vw - 40px)",
          }}
        >
          <CardBody className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Generate Neural Network Code
              </h2>
              <Button
                isIconOnly
                aria-label="Close panel"
                className="text-foreground-400 hover:text-foreground-600 hover:bg-default-100"
                size="sm"
                variant="light"
                onClick={closePanel}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {!generatedCode && (
              <>
                <p className="text-foreground-500 mb-4">
                  Select your preferred framework to generate code for your
                  neural network.
                </p>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Icon
                      className="text-blue-600 text-xl mt-0.5"
                      icon="simple-icons:jupyter"
                    />
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        Ready for Google Colab!
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Get a complete Jupyter notebook with data loading,
                        training, and evaluation code. Perfect for uploading
                        directly to Google Colab to start training your model.
                      </p>
                    </div>
                  </div>
                </div>

                <RadioGroup
                  classNames={{
                    base: "gap-6",
                    label: "text-foreground-600 font-medium mb-3",
                  }}
                  label="Select Framework"
                  orientation="horizontal"
                  value={framework}
                  onValueChange={(value) =>
                    setFramework(value as "tensorflow" | "pytorch")
                  }
                >
                  <Radio value="tensorflow">
                    <div className="flex items-center gap-2">
                      <Icon className="text-xl" icon="logos:tensorflow" />
                      TensorFlow
                    </div>
                  </Radio>
                  <Radio value="pytorch">
                    <div className="flex items-center gap-2">
                      <Icon className="text-xl" icon="logos:pytorch-icon" />
                      PyTorch
                    </div>
                  </Radio>
                </RadioGroup>
              </>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {generatedCode && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Generated{" "}
                    {framework === "tensorflow" ? "TensorFlow" : "PyTorch"}{" "}
                    Code:
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      startContent={<Copy size={16} />}
                      variant="ghost"
                      onClick={copyToClipboard}
                    >
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      startContent={<Download size={16} />}
                      variant="ghost"
                      onClick={downloadCode}
                    >
                      Download .py
                    </Button>
                    <Button
                      color="primary"
                      size="sm"
                      startContent={<Icon icon="simple-icons:jupyter" />}
                      variant="ghost"
                      onClick={downloadNotebook}
                    >
                      Download .ipynb
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setGeneratedCode("");
                        setError("");
                      }}
                    >
                      Back
                    </Button>
                  </div>
                </div>
                <pre className=" p-4 rounded overflow-auto text-sm max-h-96 font-mono">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            )}
          </CardBody>

          {!generatedCode && (
            <CardFooter className="px-6 pb-6 pt-0">
              <div className="flex gap-2 w-full">
                <Button
                  className="flex-1"
                  color="primary"
                  isLoading={isGenerating}
                  startContent={!isGenerating && <Icon icon="lucide:code" />}
                  variant="solid"
                  onPress={handleGenerate}
                >
                  {isGenerating ? "Generating..." : "Generate Code"}
                </Button>
                <Button
                  className="flex-1"
                  color="secondary"
                  isLoading={isGenerating}
                  startContent={
                    !isGenerating && <Icon icon="simple-icons:jupyter" />
                  }
                  variant="solid"
                  onPress={downloadNotebook}
                >
                  {isGenerating ? "Generating..." : "Get Colab Notebook"}
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Save Project Modal */}
      <SaveProjectModal
        edges={edges}
        isOpen={showSaveModal}
        nodes={nodes}
        templateType={templateType || undefined}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveSuccess}
      />
    </div>
  );
};

export default FlowCanvas;
