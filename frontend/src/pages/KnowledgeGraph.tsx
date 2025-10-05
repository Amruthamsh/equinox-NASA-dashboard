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

const driver = neo4j.driver(
  import.meta.env.VITE_NEO4J_URI,
  neo4j.auth.basic(
    import.meta.env.VITE_NEO4J_USER,
    import.meta.env.VITE_NEO4J_PASSWORD
  )
);

const PRESET_QUERIES = {
  // Research Overview Queries
  "Topics Graph": {
    query: `
      MATCH (c:Cluster)-[r1:HAS_TOPIC]->(t:Topic)<-[r2:MENTIONS]-(p:Paper)
      RETURN c, r1, t, r2, p LIMIT 1000
    `,
    description: "Overview of research clusters, topics, and papers",
    category: "overview",
  },
  "Research Landscape": {
    query: `
      MATCH (n:Topic) RETURN n LIMIT 100;
    `,
    description: "All the topics covered by NASA research papers",
    category: "overview",
  },

  // Impact & Results Queries
  "Experimental Results Network": {
    query: `
      MATCH (p:Paper)-[r1:REPORTS]->(e:Entity)
      WHERE e.type IN ["Result", "Quantitative Result"]
      OPTIONAL MATCH (e)-[r2:RELATION]->(related:Entity)
      WHERE related.type IN ["Method", "Experimental Condition"]
      RETURN p, r1, e, r2, related LIMIT 200
    `,
    description: "Papers and their experimental results with methods",
    category: "results",
  },
  "Method-Result Chains": {
    query: `
      MATCH (method:Entity)-[r1:RELATION]->(result:Entity)
      WHERE method.type = "Method" AND result.type IN ["Result", "Quantitative Result"]
      OPTIONAL MATCH (p:Paper)-[r2:REPORTS]->(result)
      RETURN method, r1, result, r2, p LIMIT 150
    `,
    description: "Methods leading to specific results",
    category: "results",
  },
  "Impact Pathways": {
    query: `
      MATCH path = (e1:Entity)-[r:RELATION*1..3]->(e2:Entity)
      WHERE e1.type IN ["Method", "Experimental Condition"] 
      AND e2.type IN ["Result", "Psychological Impact"]
      WITH e1, e2, r, length(path) as pathLength
      ORDER BY pathLength LIMIT 100
      UNWIND r as rel
      MATCH (source)-[rel]->(target)
      RETURN source, rel, target
    `,
    description: "Causal chains from methods to impacts",
    category: "results",
  },

  // Study Design Queries
  "Study Environments": {
    query: `
      MATCH (p:Paper)-[r1:REPORTS]->(env:Entity)
      WHERE env.type = "Environment"
      OPTIONAL MATCH (env)-[r2:RELATION]->(cond:Entity)
      WHERE cond.type = "Experimental Condition"
      RETURN p, r1, env, r2, cond LIMIT 150
    `,
    description: "Study environments and experimental conditions",
    category: "study",
  },
  "Complete Study Design": {
    query: `
      MATCH (p:Paper)-[r1:REPORTS]->(study:Entity)
      WHERE study.type = "Study"
      OPTIONAL MATCH (study)-[r2:RELATION]->(comp:Entity)
      WHERE comp.type IN ["Method", "Environment", "Experimental Condition"]
      RETURN p, r1, study, r2, comp LIMIT 150
    `,
    description: "Full study designs with all components",
    category: "study",
  },

  // Biological & Scientific Queries
  "Gene-Microorganism Relations": {
    query: `
      MATCH (gene:Entity)-[r:RELATION]-(micro:Entity)
      WHERE gene.type = "Gene" AND micro.type = "Microorganism"
      OPTIONAL MATCH (p:Paper)-[r2:REPORTS]->(gene)
      RETURN gene, r, micro, r2, p LIMIT 150
    `,
    description: "Genetic and microbiological relationships",
    category: "biological",
  },
  "Biological Impact Network": {
    query: `
      MATCH (bio:Entity)-[r1:RELATION]->(impact:Entity)
      WHERE bio.type IN ["Gene", "Microorganism"] 
      AND impact.type IN ["Psychological Impact", "Result"]
      OPTIONAL MATCH (p:Paper)-[r2:REPORTS]->(bio)
      RETURN bio, r1, impact, r2, p LIMIT 150
    `,
    description: "How biological factors affect outcomes",
    category: "biological",
  },

  // Comparative Queries
  "Co-occurring Topics": {
    query: `
      MATCH (p:Paper)-[:MENTIONS]->(t1:Topic),
            (p)-[:MENTIONS]->(t2:Topic)
      WHERE t1 <> t2
      WITH t1, t2, COUNT(p) AS co_occurrence
      ORDER BY co_occurrence DESC LIMIT 50
      RETURN t1, t2, co_occurrence
    `,
    description: "Topics that appear together in papers",
    category: "comparison",
  },
  "Cross-Method Results": {
    query: `
      MATCH (m1:Entity)-[r1:RELATION]->(result:Entity)<-[r2:RELATION]-(m2:Entity)
      WHERE m1.type = "Method" AND m2.type = "Method" 
      AND result.type IN ["Result", "Quantitative Result"]
      AND m1 <> m2
      RETURN m1, r1, result, r2, m2 LIMIT 100
    `,
    description: "Results achieved by multiple methods",
    category: "comparison",
  },

  // Network Analysis
  "Highly Connected Entities": {
    query: `
      MATCH (e:Entity)-[r:RELATION]-(other:Entity)
      WITH e, COUNT(DISTINCT r) AS connections
      ORDER BY connections DESC LIMIT 50
      MATCH (e)-[r2:RELATION]-(connected:Entity)
      RETURN e, r2, connected LIMIT 200
    `,
    description: "Most influential entities in the network",
    category: "network",
  },
  "Entity Clusters": {
    query: `
      MATCH (e1:Entity)-[r:RELATION]-(e2:Entity)
      WHERE e1.type = e2.type
      RETURN e1, r, e2 LIMIT 200
    `,
    description: "Entities grouped by type relationships",
    category: "network",
  },
};

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
];

export default function KnowledgeGraphDashboard() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedQuery, setSelectedQuery] = useState(
    "Experimental Results Network"
  );
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ nodes: 0, links: 0, types: {} });

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
            `${node.label}\nType: ${node.type}${
              node.entityType ? `\nEntity: ${node.entityType}` : ""
            }`
          }
          onNodeClick={(node) => setSelectedNode(node)}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const fontSize = 12 / globalScale;
            const nodeSize = node.type === "Paper" ? 8 : 6;
            ctx.font = `${fontSize}px Sans-Serif`;

            const highlighted = isNodeHighlighted(node);
            ctx.shadowBlur = highlighted ? 15 : 5;
            ctx.shadowColor = highlighted ? getNodeColor(node) : "#333";

            ctx.fillStyle = highlighted ? getNodeColor(node) : "#222";
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (highlighted) {
              let label =
                node.label.length > 25
                  ? node.label.slice(0, 22) + "..."
                  : node.label;
              ctx.fillStyle = "#fff";
              ctx.fillText(label, node.x + nodeSize + 2, node.y + 4);
            }
          }}
          linkColor={(link) => {
            const sourceHighlight = isNodeHighlighted(link.source);
            const targetHighlight = isNodeHighlighted(link.target);
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
          linkWidth={(link) =>
            isNodeHighlighted(link.source) && isNodeHighlighted(link.target)
              ? 1.5
              : 0.5
          }
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
              onClick={() => setSelectedNode(null)}
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
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700 max-w-xs">
          <h4 className="text-sm font-semibold mb-2">Relationship Types</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
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
        </div>
      </div>
    </div>
  );
}
