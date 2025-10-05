import React, { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import neo4j from "neo4j-driver";
import {
  Search,
  Filter,
  Info,
  TrendingUp,
  Network,
  Beaker,
  FileText,
} from "lucide-react";

// ShadCN components
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRESET_QUERIES } from "@/data/PresetQueries";

const driver = neo4j.driver(
  import.meta.env.VITE_NEO4J_URI,
  neo4j.auth.basic(
    import.meta.env.VITE_NEO4J_USER,
    import.meta.env.VITE_NEO4J_PASSWORD
  )
);

const ENTITY_TYPES = [
  "Result",
  "Study",
  "Method",
  "Environment",
  "Experimental Condition",
  "Psychological Impact",
  "Gene",
  "Microorganism",
  "Quantitative Result",
  "Protein",
  "Chemical",
  "Biological Process",
  "Cell Type",
  "Organism",
  "Instrument",
  "Phenotype",
  "Experiment",
  "Pathway",
  "Stressor",
  "Condition",
  "Measurement",
  "Animal Model",
  "Mechanism",
  "Treatment",
  "Disease",
  "Symptom",
  "Therapy",
  "Drug",
  "Vaccine",
  "Tissue",
];

export default function KnowledgeGraphDashboard() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedQuery, setSelectedQuery] = useState("Research Landscape");
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ nodes: 0, links: 0, types: {} });
  const [focusedNode, setFocusedNode] = useState<any>(null);
  const [connectedNodes, setConnectedNodes] = useState<Set<string>>(new Set());

  // Filters
  const [highlightedTypes, setHighlightedTypes] = useState<string[]>([
    "Paper",
    "Topic",
    "Entity",
    "Cluster",
  ]);
  const [highlightedEntityTypes, setHighlightedEntityTypes] =
    useState<string[]>(ENTITY_TYPES);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const isNode = (obj: any) =>
    obj && obj.labels && obj.properties && obj.identity;
  const isRelationship = (obj: any) =>
    obj && obj.type && obj.start && obj.end && typeof obj.type === "string";
  const getNodeId = (node: any) => {
    if (neo4j.isInt(node.identity)) return node.identity.toString();
    return node.identity?.toString() || String(node.identity);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const session = driver.session();
      try {
        const queryData = PRESET_QUERIES[selectedQuery];
        const res = await session.run(queryData.query);
        const nodesMap: Record<string, any> = {};
        const links: any[] = [];

        res.records.forEach((rec) => {
          const nodes: any[] = [];
          const relationships: any[] = [];

          rec.forEach((value) => {
            if (isNode(value)) {
              nodes.push(value);
            } else if (isRelationship(value)) {
              relationships.push(value);
            }
          });

          nodes.forEach((node) => {
            const id = getNodeId(node);
            if (!nodesMap[id]) {
              const props = node.properties || {};
              nodesMap[id] = {
                id,
                label:
                  props.title ||
                  props.name ||
                  props.topic ||
                  props.label ||
                  `${node.labels[0]} ${id}`,
                type: node.labels[0] || "Unknown",
                entityType: props.type || null,
                props: props,
              };
            }
          });

          relationships.forEach((rel) => {
            const sourceId = getNodeId({ identity: rel.start });
            const targetId = getNodeId({ identity: rel.end });
            links.push({
              source: sourceId,
              target: targetId,
              type: rel.type,
              props: rel.properties || {},
            });
          });

          if (selectedQuery === "Co-occurring Topics") {
            if (nodes.length >= 2) {
              const [t1, t2] = nodes;
              const coOccurrence = rec.get("co_occurrence");
              links.push({
                source: getNodeId(t1),
                target: getNodeId(t2),
                type: "CO_OCCURS",
                weight: neo4j.isInt(coOccurrence)
                  ? coOccurrence.toNumber()
                  : coOccurrence,
              });
            }
          }
        });

        const nodeValues = Object.values(nodesMap);
        setGraphData({ nodes: nodeValues, links });

        // Calculate stats
        const typeCount = {};
        nodeValues.forEach((n: any) => {
          typeCount[n.type] = (typeCount[n.type] || 0) + 1;
        });
        setStats({
          nodes: nodeValues.length,
          links: links.length,
          types: typeCount,
        });
      } catch (err) {
        console.error("Neo4j fetch error:", err);
      } finally {
        session.close();
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedQuery]);

  const getNodeColor = (node: any) => {
    if (node.type === "Entity" && node.entityType) {
      const entityColors = {
        Result: "#00FF88",
        "Quantitative Result": "#00FFAA",
        Method: "#FF6B9D",
        Study: "#8B5CF6",
        Environment: "#3B82F6",
        "Experimental Condition": "#06B6D4",
        "Psychological Impact": "#F59E0B",
        Gene: "#10B981",
        Microorganism: "#84CC16",
      };
      return entityColors[node.entityType] || "#FFD700";
    }

    const typeColors = {
      Paper: "#00FFB3",
      Topic: "#FF6EC7",
      Entity: "#FFD700",
      Cluster: "#7F00FF",
    };
    return typeColors[node.type] || "#AAAAAA";
  };

  const isNodeHighlighted = (node: any) => {
    if (!highlightedTypes.includes(node.type)) return false;
    if (node.type === "Entity" && node.entityType) {
      return highlightedEntityTypes.includes(node.entityType);
    }
    return true;
  };

  // Handle node click for focus mode
  const handleNodeClick = (node: any) => {
    setSelectedNode(node);

    if (focusedNode && focusedNode.id === node.id) {
      // If clicking the same node, unfocus
      setFocusedNode(null);
      setConnectedNodes(new Set());
    } else {
      // Focus on this node and its connections
      setFocusedNode(node);
      const connected = new Set<string>();
      connected.add(node.id);

      // Find all directly connected nodes
      graphData.links.forEach((link: any) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;

        if (sourceId === node.id) {
          connected.add(targetId);
        }
        if (targetId === node.id) {
          connected.add(sourceId);
        }
      });

      setConnectedNodes(connected);
    }
  };

  // Check if node should be visible (bright) in focus mode
  const isNodeInFocus = (node: any) => {
    if (!focusedNode) return true;
    return connectedNodes.has(node.id);
  };

  // Check if link should be visible (bright) in focus mode
  const isLinkInFocus = (link: any) => {
    if (!focusedNode) return true;
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;
    return connectedNodes.has(sourceId) && connectedNodes.has(targetId);
  };

  const filteredNodes = graphData.nodes.filter((node: any) => {
    if (searchTerm) {
      return node.label.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const filteredCategories = Object.entries(PRESET_QUERIES).filter(
    ([_, data]: [string, any]) =>
      selectedCategory === "all" || data.category === selectedCategory
  );

  const categories = [
    { value: "all", label: "All Queries", icon: Network },
    { value: "overview", label: "Overview", icon: Info },
    { value: "results", label: "Results & Impact", icon: TrendingUp },
    { value: "study", label: "Study Design", icon: Beaker },
    { value: "biological", label: "Biological", icon: FileText },
    { value: "comparison", label: "Comparative", icon: Filter },
    { value: "network", label: "Network Analysis", icon: Network },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-80 p-4 border-r border-gray-800 flex flex-col gap-4 overflow-auto bg-black/50 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Research Knowledge Graph
          </h2>
          <p className="text-xs text-gray-400">
            Explore experimental impacts & results
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-2 gap-1 bg-gray-800">
            {categories.slice(0, 4).map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="text-xs"
              >
                <cat.icon className="w-3 h-3 mr-1" />
                {cat.label.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Query Selection */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Query</label>
          <Select
            onValueChange={(v) => setSelectedQuery(v)}
            value={selectedQuery}
          >
            <SelectTrigger className="w-full bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select Query" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map(([name, data]: [string, any]) => (
                <SelectItem key={name} value={name}>
                  <div className="flex flex-col">
                    <span>{name}</span>
                    <span className="text-xs text-gray-400">
                      {data.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400 mt-1">
            {PRESET_QUERIES[selectedQuery]?.description}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Nodes:</span>
            <span className="font-bold text-purple-400">{stats.nodes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Links:</span>
            <span className="font-bold text-pink-400">{stats.links}</span>
          </div>
        </div>

        {/* Node Type Filters */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Node Types</h3>
          <div className="space-y-1">
            {["Paper", "Topic", "Entity", "Cluster"].map((type) => (
              <label
                key={type}
                className="flex items-center p-2 rounded hover:bg-gray-800 cursor-pointer"
              >
                <Checkbox
                  checked={highlightedTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    setHighlightedTypes((prev) =>
                      checked ? [...prev, type] : prev.filter((t) => t !== type)
                    );
                  }}
                  className="mr-2"
                />
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getNodeColor({ type }) }}
                  ></div>
                  <span className="text-sm">{type}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {stats.types[type] || 0}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Entity Type Filters */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Entity Types</h3>
          <div className="space-y-1 max-h-64 overflow-auto">
            {ENTITY_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center p-2 rounded hover:bg-gray-800 cursor-pointer"
              >
                <Checkbox
                  checked={highlightedEntityTypes.includes(type)}
                  onCheckedChange={(checked) => {
                    setHighlightedEntityTypes((prev) =>
                      checked ? [...prev, type] : prev.filter((t) => t !== type)
                    );
                  }}
                  className="mr-2"
                />
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getNodeColor({
                        type: "Entity",
                        entityType: type,
                      }),
                    }}
                  ></div>
                  <span className="text-xs">{type}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-purple-400">
            <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <ForceGraph2D
          graphData={graphData}
          nodeLabel={(node) =>
            `${node.label}\n: ${node.type}${
              node.entityType ? `\nEntity: ${node.entityType}` : ""
            }`
          }
          onNodeClick={handleNodeClick}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const fontSize = 12 / globalScale;
            const nodeSize = node.type === "Paper" ? 8 : 6;
            ctx.font = `${fontSize}px Sans-Serif`;

            const highlighted = isNodeHighlighted(node);
            const inFocus = isNodeInFocus(node);
            const isFocused = focusedNode && focusedNode.id === node.id;

            // Adjust opacity and glow based on focus mode
            const opacity = inFocus ? 1 : 0.15;
            const glowIntensity = isFocused ? 20 : inFocus ? 15 : 5;

            ctx.shadowBlur = highlighted ? glowIntensity : 5;
            ctx.shadowColor = highlighted ? getNodeColor(node) : "#333";

            // Apply opacity to node color
            let nodeColor = highlighted ? getNodeColor(node) : "#222";
            if (!inFocus) {
              nodeColor = "#333";
            }

            ctx.globalAlpha = opacity;
            ctx.fillStyle = nodeColor;
            ctx.beginPath();
            ctx.arc(
              node.x,
              node.y,
              isFocused ? nodeSize * 1.3 : nodeSize,
              0,
              2 * Math.PI,
              false
            );
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw label only for focused node, connected nodes in focus mode, or all in normal mode
            if ((highlighted && inFocus) || isFocused) {
              let label =
                node.label.length > 25
                  ? node.label.slice(0, 22) + "..."
                  : node.label;
              ctx.globalAlpha = inFocus ? 1 : 0.3;
              ctx.fillStyle = inFocus ? "#fff" : "#666";
              ctx.fillText(label, node.x + nodeSize + 2, node.y + 4);
            }

            ctx.globalAlpha = 1;
          }}
          linkColor={(link) => {
            const sourceHighlight = isNodeHighlighted(link.source);
            const targetHighlight = isNodeHighlighted(link.target);
            const inFocus = isLinkInFocus(link);

            if (!inFocus) {
              return "rgba(100,100,100,0.05)";
            }

            if (sourceHighlight && targetHighlight) {
              const linkColors = {
                REPORTS: "#00FF88",
                MENTIONS: "#FF6EC7",
                RELATION: "#FFD700",
                HAS_TOPIC: "#7F00FF",
                CONTAINS: "#3B82F6",
                BELONGS_TO: "#06B6D4",
              };
              return linkColors[link.type] || "#999";
            }
            return "rgba(255,255,255,0.05)";
          }}
          linkWidth={(link) => {
            const inFocus = isLinkInFocus(link);
            const baseWidth =
              isNodeHighlighted(link.source) && isNodeHighlighted(link.target)
                ? 1.5
                : 0.5;
            return inFocus ? baseWidth : 0.3;
          }}
          linkDirectionalArrowLength={5}
          linkDirectionalArrowRelPos={1}
          linkLabel={(link) => link.type}
          backgroundColor="#0a0a0f"
          width={window.innerWidth - 320}
          height={window.innerHeight}
        />

        {/* Node Details Panel */}
        {selectedNode && (
          <div className="absolute right-0 top-0 w-96 h-full bg-gray-900/95 backdrop-blur-md border-l border-gray-700 shadow-2xl p-6 overflow-auto z-50">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => {
                setSelectedNode(null);
                setFocusedNode(null);
                setConnectedNodes(new Set());
              }}
            >
              ✕
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getNodeColor(selectedNode) }}
                ></div>
                <h3 className="text-lg font-bold">{selectedNode.label}</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                  {selectedNode.type}
                </span>
                {selectedNode.entityType && (
                  <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded">
                    {selectedNode.entityType}
                  </span>
                )}
              </div>
            </div>

            {focusedNode && focusedNode.id === selectedNode.id && (
              <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-purple-300">
                  🎯 Focus mode active - click node again to unfocus
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-400 mb-2">
                  Properties
                </h4>
                <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                  {selectedNode.props &&
                    Object.entries(selectedNode.props).map(([k, v]) => (
                      <div key={k} className="text-sm">
                        <span className="text-gray-400">{k}:</span>{" "}
                        <span className="text-white">{String(v)}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-400 mb-2">
                  Connections
                </h4>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-sm">
                    {
                      graphData.links.filter(
                        (l: any) =>
                          l.source.id === selectedNode.id ||
                          l.target.id === selectedNode.id
                      ).length
                    }{" "}
                    relationships
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-28 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700 max-w-xs">
          <h4 className="text-sm font-semibold mb-2">Relationship Types</h4>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            {[
              "REPORTS",
              "MENTIONS",
              "RELATION",
              "HAS_TOPIC",
              "CONTAINS",
              "BELONGS_TO",
            ].map((type) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className="w-3 h-0.5"
                  style={{
                    backgroundColor: {
                      REPORTS: "#00FF88",
                      MENTIONS: "#FF6EC7",
                      RELATION: "#FFD700",
                      HAS_TOPIC: "#7F00FF",
                      CONTAINS: "#3B82F6",
                      BELONGS_TO: "#06B6D4",
                    }[type],
                  }}
                ></div>
                <span className="text-gray-300">{type}</span>
              </div>
            ))}
          </div>
          {focusedNode && (
            <div className="pt-3 border-t border-gray-700">
              <p className="text-xs text-purple-300">
                🎯 Focus mode: Showing{" "}
                <span className="font-bold">{connectedNodes.size}</span>{" "}
                connected nodes
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Click focused node again to exit
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
