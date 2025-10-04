import React, { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import neo4j from "neo4j-driver";

// ShadCN Select + Checkbox components
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; // assuming you have a checkbox component

const driver = neo4j.driver(
  import.meta.env.VITE_NEO4J_URI,
  neo4j.auth.basic(
    import.meta.env.VITE_NEO4J_USER,
    import.meta.env.VITE_NEO4J_PASSWORD
  )
);

const PRESET_QUERIES = {
  "Topics Graph": `
    MATCH (c:Cluster)-[:HAS_TOPIC]->(t:Topic)<-[:MENTIONS]-(p:Paper)
    RETURN c, t, p LIMIT 200
  `,
  "Top Results": `
    MATCH (p:Paper)-[:REPORTS]->(e:Entity)
    WHERE e.type="Result"
    RETURN p, e LIMIT 200
  `,
  "Entity Relations": `
    MATCH (a:Entity)-[r:RELATION]->(b:Entity)
    RETURN a, b, r LIMIT 200
  `,
  "Co-occurring Topics": `
    MATCH (p:Paper)-[:MENTIONS]->(t1:Topic),
          (p)-[:MENTIONS]->(t2:Topic)
    WHERE t1 <> t2
    RETURN t1, t2, COUNT(p) AS co_occurrence
    ORDER BY co_occurrence DESC LIMIT 50
  `,
  "Top Entities by Relations": `
    MATCH (a:Entity)-[r:RELATION]->(b:Entity)
    RETURN a, COUNT(r) AS rel_count
    ORDER BY rel_count DESC LIMIT 50
  `,
};

export default function KnowledgeGraphDashboard() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedQuery, setSelectedQuery] = useState("Topics Graph");
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Filters
  const [highlightedTypes, setHighlightedTypes] = useState<string[]>([
    "Paper",
    "Topic",
    "Entity",
    "Cluster",
  ]);

  // ---------------- Fetch Neo4j data ----------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const session = driver.session();
      try {
        const res = await session.run(PRESET_QUERIES[selectedQuery]);
        const nodesMap: Record<string, any> = {};
        const links: any[] = [];

        res.records.forEach((rec) => {
          const nodeIds: string[] = [];

          rec.forEach((v) => {
            if (!v) return;
            let node: any = null;
            if (typeof v.toObject === "function") node = v;
            else if (v.identity) node = v;
            else if (v.properties) node = v;
            else return;

            const id =
              node.identity?.toString() || node.id || Math.random().toString();
            if (!nodesMap[id]) {
              nodesMap[id] = {
                id,
                label:
                  node.properties?.title ||
                  node.properties?.name ||
                  `Node ${id}`,
                type: node.labels ? node.labels[0] : "Unknown",
                props: node.properties || {},
              };
            }
            nodeIds.push(id);
          });

          if (selectedQuery === "Entity Relations" && rec.length === 3) {
            const [a, b, r] = rec;
            links.push({
              source: a.identity?.toString(),
              target: b.identity?.toString(),
              type: r?.properties?.type || "related_to",
            });
          } else if (nodeIds.length >= 2) {
            for (let i = 0; i < nodeIds.length - 1; i++) {
              links.push({ source: nodeIds[i], target: nodeIds[i + 1] });
            }
          }
        });

        setGraphData({ nodes: Object.values(nodesMap), links });
      } catch (err) {
        console.error("Neo4j fetch error:", err);
      } finally {
        session.close();
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedQuery]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "Paper":
        return "#4ADE80";
      case "Topic":
        return "#60A5FA";
      case "Entity":
        return "#FACC15";
      case "Cluster":
        return "#F87171";
      default:
        return "#D1D5DB";
    }
  };

  // ---------------- Highlight logic ----------------
  const isNodeHighlighted = (node: any) => highlightedTypes.includes(node.type);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-72 p-4 border-r border-gray-800 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Knowledge Graph</h2>

        <Select
          onValueChange={(v) => setSelectedQuery(v)}
          value={selectedQuery}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Query" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(PRESET_QUERIES).map((q) => (
              <SelectItem key={q} value={q}>
                {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <h3 className="mt-4 font-semibold">Highlight Types</h3>
        <div>
          {["Paper", "Topic", "Entity", "Cluster"].map((type) => (
            <label key={type} className="flex items-center mb-2">
              <Checkbox
                checked={highlightedTypes.includes(type)}
                onCheckedChange={(checked) => {
                  setHighlightedTypes((prev) =>
                    checked ? [...prev, type] : prev.filter((t) => t !== type)
                  );
                }}
                className="mr-2"
              />
              {type}
            </label>
          ))}
        </div>

        {loading && <p className="text-gray-400 mt-2">Loading...</p>}
      </div>

      {/* Graph */}
      <div className="flex-1 relative">
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="label"
          nodeAutoColorBy="type"
          onNodeClick={(node) => setSelectedNode(node)}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = isNodeHighlighted(node)
              ? getNodeColor(node.type)
              : "#555";
            ctx.beginPath();
            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.fillStyle = isNodeHighlighted(node) ? "#fff" : "#999";
            ctx.fillText(node.label, node.x + 6, node.y + 3);
          }}
          linkColor={(link) =>
            isNodeHighlighted(link.source) && isNodeHighlighted(link.target)
              ? "#999"
              : "rgba(255,255,255,0.05)"
          }
          linkWidth={(link) =>
            isNodeHighlighted(link.source) && isNodeHighlighted(link.target)
              ? 1
              : 0.5
          }
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          backgroundColor="#0f0f1f"
          width={window.innerWidth - 288}
          height={window.innerHeight}
        />

        {/* Node details panel */}
        {selectedNode && (
          <div className="absolute right-0 top-0 w-80 h-full bg-gray-900 border-l border-gray-700 shadow-lg p-4 overflow-auto z-50">
            <h3 className="text-lg font-bold mb-2">{selectedNode.label}</h3>
            <p className="text-sm text-gray-400 mb-2">
              Type: {selectedNode.type}
            </p>
            <h4 className="font-semibold mb-1">Properties:</h4>
            <ul className="list-disc pl-5 text-sm">
              {selectedNode.props &&
                Object.entries(selectedNode.props).map(([k, v]) => (
                  <li key={k}>
                    <strong>{k}:</strong> {v.toString()}
                  </li>
                ))}
            </ul>
            <button
              className="mt-4 px-2 py-1 bg-red-500 text-white rounded"
              onClick={() => setSelectedNode(null)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
