import React, { useState, useMemo } from "react";
import { Card, CardBody, Button, Input, Chip, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Search, Filter, X, ChevronDown, ChevronUp, Home } from "lucide-react";
import { useRouter } from "next/router";

// Refactored nodeTypesByCategory to match the modular node system
const nodeTypesByCategory = [
  {
    category: "Input/Output",
    nodes: [
      { type: "textInput", label: "Text Input", icon: "lucide:type", details: "Text Input Node", keywords: ["text", "input", "string"], popularity: 80 },
      { type: "textOutput", label: "Text Output", icon: "lucide:file-text", details: "Text Output Node", keywords: ["text", "output", "result"], popularity: 70 },
    ]
  }
  ,
  {
    category: "Dataset",
    nodes: [
      { type: "dataset", label: "Dataset", icon: "lucide:database", details: "Dataset Node", keywords: ["dataset", "data", "csv"], popularity: 90 },
    ],
  },

  {
    category: "Core Layers",
    nodes: [
      { type: "neuralLayer", label: "Neural Layer", icon: "lucide:grid", details: "Neural Network Layer", keywords: ["neural", "layer", "dense", "hidden"], popularity: 99 },
    ],
  },
  {
    category: "Config & Training",
    nodes: [
      { type: "databaseConfig", label: "Database Config", icon: "lucide:settings", details: "Database Config Node", keywords: ["database", "config", "preprocess"], popularity: 80 },
      { type: "dataPreprocessing", label: "Preprocessing", icon: "lucide:git-branch", details: "Data Preprocessing & Transformation", keywords: ["preprocessing", "scaling", "normalize", "encode", "transform"], popularity: 85 },
      { type: "trainingConfig", label: "Training Config", icon: "lucide:settings", details: "Training Configuration Hub", keywords: ["training", "config", "parameters"], popularity: 70 },
      { type: "metrics", label: "Metrics", icon: "lucide:bar-chart-3", details: "Training Metrics", keywords: ["metrics", "accuracy", "loss"], popularity: 70 },
    ],
  },
  {
    category: "Optimizers",
    nodes: [
      { type: "adam", label: "Adam", icon: "lucide:zap", details: "Adam Optimizer", keywords: ["adam", "optimizer", "adaptive", "momentum"], popularity: 90, params: { lr: 0.001, beta1: 0.9, beta2: 0.999, eps: 1e-8 } },
      { type: "sgd", label: "SGD", icon: "lucide:trending-up", details: "Stochastic Gradient Descent", keywords: ["sgd", "gradient", "descent", "stochastic"], popularity: 80, params: { lr: 0.01, momentum: 0.9, dampening: 0, weight_decay: 0 } },
      { type: "rmsprop", label: "RMSprop", icon: "lucide:activity", details: "RMSprop Optimizer", keywords: ["rmsprop", "optimizer", "root", "mean", "square"], popularity: 70, params: { lr: 0.01, alpha: 0.99, eps: 1e-8, weight_decay: 0 } },
      { type: "adagrad", label: "AdaGrad", icon: "lucide:target", details: "Adaptive Gradient Algorithm", keywords: ["adagrad", "adaptive", "gradient", "learning", "rate"], popularity: 60, params: { lr: 0.01, lr_decay: 0, weight_decay: 0, eps: 1e-10 } },
      { type: "adamw", label: "AdamW", icon: "lucide:zap", details: "Adam with Weight Decay", keywords: ["adamw", "adam", "weight", "decay", "regularization"], popularity: 75, params: { lr: 0.001, beta1: 0.9, beta2: 0.999, eps: 1e-8, weight_decay: 0.01 } },
    ],
  },
  {
    category: "Algorithms",
    nodes: [
      { type: "cnn", label: "CNN", icon: "lucide:image", details: "Convolutional Neural Network", keywords: ["cnn", "convolutional", "vision", "image"], popularity: 85, params: { layers: 3, filters: [32, 64, 128], kernel_size: 3, pool_size: 2 } },
      { type: "rnn", label: "RNN", icon: "lucide:repeat", details: "Recurrent Neural Network", keywords: ["rnn", "recurrent", "sequence", "temporal"], popularity: 70, params: { hidden_size: 128, num_layers: 2, bidirectional: false } },
      { type: "lstm", label: "LSTM", icon: "lucide:repeat-2", details: "Long Short-Term Memory", keywords: ["lstm", "memory", "sequence", "temporal"], popularity: 65, params: { hidden_size: 128, num_layers: 2, dropout: 0.2, bidirectional: false } },
      { type: "transformer", label: "Transformer", icon: "lucide:cpu", details: "Transformer Architecture", keywords: ["transformer", "attention", "bert", "gpt", "nlp"], popularity: 95, params: { d_model: 512, nhead: 8, num_layers: 6, dim_feedforward: 2048, dropout: 0.1 } },
      { type: "autoencoder", label: "AutoEncoder", icon: "lucide:workflow", details: "Autoencoder Network", keywords: ["autoencoder", "encoder", "decoder", "compression"], popularity: 65, params: { encoding_dim: 128, layers: [512, 256, 128], activation: "relu" } },
      { type: "gan", label: "GAN", icon: "lucide:shuffle", details: "Generative Adversarial Network", keywords: ["gan", "generative", "adversarial", "generate"], popularity: 70, params: { latent_dim: 100, generator_layers: [256, 512, 1024], discriminator_layers: [1024, 512, 256] } },
      { type: "resnet", label: "ResNet", icon: "lucide:layers-2", details: "Residual Network", keywords: ["resnet", "residual", "skip", "connection", "deep"], popularity: 80, params: { depth: 50, num_classes: 1000, block_type: "bottleneck" } },
      { type: "vae", label: "VAE", icon: "lucide:shuffle", details: "Variational Autoencoder", keywords: ["vae", "variational", "autoencoder", "latent"], popularity: 60, params: { latent_dim: 64, encoder_layers: [512, 256], decoder_layers: [256, 512] } },
    ],
  },
  {
    category: "Loss Functions",
    nodes: [
      { type: "crossentropy", label: "CrossEntropy", icon: "lucide:target", details: "Cross Entropy Loss", keywords: ["crossentropy", "loss", "classification", "entropy"], popularity: 90, params: {} },
      { type: "mse", label: "MSE", icon: "lucide:square", details: "Mean Squared Error", keywords: ["mse", "mean", "squared", "error", "regression"], popularity: 85, params: {} },
      { type: "mae", label: "MAE", icon: "lucide:triangle", details: "Mean Absolute Error", keywords: ["mae", "mean", "absolute", "error", "regression"], popularity: 70, params: {} },
      { type: "bce", label: "BCE", icon: "lucide:binary", details: "Binary Cross Entropy", keywords: ["bce", "binary", "cross", "entropy", "sigmoid"], popularity: 80, params: {} },
    ],
  },
  {
    category: "Schedulers",
    nodes: [
      { type: "steplr", label: "StepLR", icon: "lucide:network", details: "Step Learning Rate Scheduler", keywords: ["steplr", "step", "learning", "rate", "scheduler"], popularity: 70, params: { step_size: 30, gamma: 0.1 } },
      { type: "exponentiallr", label: "ExponentialLR", icon: "lucide:trending-down", details: "Exponential LR Decay", keywords: ["exponential", "decay", "learning", "rate"], popularity: 60, params: { gamma: 0.95 } },
      { type: "cosineannealinglr", label: "CosineAnnealingLR", icon: "lucide:waves", details: "Cosine Annealing LR", keywords: ["cosine", "annealing", "learning", "rate", "warm"], popularity: 75, params: { T_max: 50, eta_min: 0 } },
      { type: "reducelronplateau", label: "ReduceLROnPlateau", icon: "lucide:trending-down", details: "Reduce LR on Plateau", keywords: ["reduce", "plateau", "learning", "rate", "adaptive"], popularity: 80, params: { mode: "min", factor: 0.1, patience: 10, threshold: 1e-4 } },
    ],
  }
];

interface EnhancedSidebarProps {
  onNodeAdd?: (nodeType: string) => void;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ onNodeAdd }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Flatten all nodes for easier searching
  const allNodes = useMemo(() => {
    return nodeTypesByCategory.flatMap((category) =>
      category.nodes.map((node) => ({ ...node, category: category.category })),
    );
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [
      "all",
      ...nodeTypesByCategory.map((cat) => cat.category.toLowerCase()),
    ];

    return cats;
  }, []);

  // Show limited categories by default, all when expanded
  const displayedCategories = useMemo(() => {
    if (showAllCategories) return categories;

    return categories.slice(0, 6); // Show first 6 categories
  }, [categories, showAllCategories]);

  // Filter nodes based on search, category, and favorites
  const filteredNodes = useMemo(() => {
    let filtered = allNodes;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter(
        (node) =>
          node.label.toLowerCase().includes(query) ||
          node.details.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query) ||
          node.keywords.some((keyword) =>
            keyword.toLowerCase().includes(query),
          ),
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (node) => node.category.toLowerCase() === selectedCategory,
      );
    }

    // Sort by popularity and favorites
    return filtered.sort((a, b) => {
      // Favorites first
      const aIsFav = favorites.has(a.type);
      const bIsFav = favorites.has(b.type);

      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;

      // Then by popularity
      return b.popularity - a.popularity;
    });
  }, [searchQuery, selectedCategory, showOnlyFavorites, favorites, allNodes]);

  // Group filtered nodes by category for display
  const groupedFilteredNodes = useMemo(() => {
    const groups: { [key: string]: typeof allNodes } = {};

    filteredNodes.forEach((node) => {
      if (!groups[node.category]) {
        groups[node.category] = [];
      }
      groups[node.category].push(node);
    });

    return groups;
  }, [filteredNodes]);

  const onDragStart = (event: React.DragEvent, node: (typeof allNodes)[0]) => {
    // If optimizer node, always use type 'optimizer' and pass optimizerType in data
    // For optimizer nodes, pass optimizerType only in drag data, not in sidebar node object
    let dragNode = node;
    if (["adam", "sgd", "rmsprop", "adagrad", "adamw"].includes(node.type)) {
      dragNode = {
        ...node,
        type: "optimizer",
        optimizerType: node.type,
      } as any; // Cast to any to avoid type error, only for drag data
      onNodeAdd?.(node.type); // Call with original type for sidebar logic
    } else {
      onNodeAdd?.(dragNode.type);
    }
    event.dataTransfer.setData("application/reactflow", JSON.stringify(dragNode));
    event.dataTransfer.effectAllowed = "move";

    // Add to recently used
    setRecentlyUsed((prev) => {
      const updated = [node.type, ...prev.filter((t) => t !== node.type)].slice(
        0,
        5,
      );

      return updated;
    });

    onNodeAdd?.(dragNode.type);
  };

  const toggleFavorite = (nodeType: string) => {
    setFavorites((prev) => {
      const updated = new Set(prev);

      if (updated.has(nodeType)) {
        updated.delete(nodeType);
      } else {
        updated.add(nodeType);
      }

      return updated;
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setShowOnlyFavorites(false);
  };

  return (
    <Card className="w-80 m-4 h-screen max-h-[calc(100vh-2rem)] overflow-hidden">
      <CardBody className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                className="text-default-500 hover:text-primary"
                size="sm"
                variant="light"
                onPress={() => router.push("/dashboard")}
              >
                <Home className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold">Node Library</h2>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="Show only favorites">
                {/* <Button
                  isIconOnly
                  size="sm"
                  variant={showOnlyFavorites ? "solid" : "light"}
                  color={showOnlyFavorites ? "warning" : "default"}
                  onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
                >
                  <Star className="w-4 h-4" />
                </Button> */}
              </Tooltip>
              <Chip size="sm" variant="flat">
                {filteredNodes.length}
              </Chip>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Input
              classNames={{
                input: "text-sm",
              }}
              endContent={
                (searchQuery ||
                  selectedCategory !== "all" ||
                  showOnlyFavorites) && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={clearSearch}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )
              }
              placeholder="Search nodes..."
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {displayedCategories.map((category) => (
                <Chip
                  key={category}
                  className="cursor-pointer capitalize"
                  color={selectedCategory === category ? "primary" : "default"}
                  size="sm"
                  variant={selectedCategory === category ? "solid" : "flat"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all"
                    ? "All"
                    : category.replace(/([A-Z])/g, " $1").trim()}
                </Chip>
              ))}
            </div>

            {categories.length > 6 && (
              <Button
                className="h-6 text-xs"
                size="sm"
                startContent={
                  showAllCategories ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )
                }
                variant="light"
                onPress={() => setShowAllCategories(!showAllCategories)}
              >
                {showAllCategories
                  ? "Show Less"
                  : `Show ${categories.length - 6} More`}
              </Button>
            )}
          </div>

          {/* Recently Used
          {recentlyUsed.length > 0 && !searchQuery && selectedCategory === "all" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-default-500" />
                <span className="text-sm font-medium text-default-700">Recently Used</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {recentlyUsed.map((nodeType) => {
                  const node = allNodes.find(n => n.type === nodeType);
                  if (!node) return null;
                  
                  return (
                    <Button
                      key={nodeType}
                      size="sm"
                      variant="flat"
                      draggable
                      onDragStart={(event) => onDragStart(event, node)}
                      startContent={<Icon icon={node.icon} className="w-3 h-3" />}
                    >
                      {node.label}
                    </Button>
                  );
                })}
              </div>
              <Divider className="my-3" />
            </div>
          )} */}

          {/* Nodes List */}
          <div className="space-y-4 overflow-y-auto max-h-fit">
            {Object.entries(groupedFilteredNodes).map(([category, nodes]) => (
              <div key={category} className="space-y-2">
                <div className="text-xs font-bold text-default-500 uppercase tracking-wide">
                  {category}
                </div>
                <div className="space-y-1">
                  {nodes.map((node) => (
                    <div key={node.type} className="flex items-center gap-2">
                      <Button
                        draggable
                        className="justify-start flex-1 h-auto py-2"
                        variant="flat"
                        onDragStart={(event) => onDragStart(event, node)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <Icon
                            className="w-4 h-4 flex-shrink-0"
                            icon={node.icon}
                          />
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium">
                              {node.label}
                            </div>
                            <div className="text-xs text-default-500 truncate">
                              {node.details}
                            </div>
                          </div>
                        </div>
                      </Button>
                      {/* <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => toggleFavorite(node.type)}
                      >
                        {favorites.has(node.type) ? (
                          <Star className="w-4 h-4 text-warning fill-warning" />
                        ) : (
                          <StarOff className="w-4 h-4 text-default-400" />
                        )}
                      </Button> */}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredNodes.length === 0 && (
              <div className="text-center py-8">
                <Filter className="w-8 h-8 text-default-300 mx-auto mb-2" />
                <p className="text-sm text-default-500">
                  No nodes match your criteria.
                </p>
                <Button
                  className="mt-2"
                  size="sm"
                  variant="flat"
                  onPress={clearSearch}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default EnhancedSidebar;
