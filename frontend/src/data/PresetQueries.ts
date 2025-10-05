export const PRESET_QUERIES = {
  // Research Overview Queries
  "Topics Graph": {
    query: `
      MATCH (c:Cluster)-[r1:HAS_TOPIC]->(t:Topic)<-[r2:MENTIONS]-(p:Paper)
      RETURN c, r1, t, r2, p LIMIT 2000
    `,
    description: "Overview of research clusters, topics, and papers",
    category: "overview",
  },
  "Research Landscape": {
    query: `
      MATCH (n:Topic) RETURN n LIMIT 100; 
    `,
    description:
      "High-level view of research topics covered by NASA publications",
    category: "overview",
  },
  "Paper Report": {
    query: `
      MATCH (p:Paper)-[r:REPORTS]->(e:Entity)
      RETURN p, r, e LIMIT 2000
    `,
    description: "Papers and their reported entities",
    category: "overview",
  },
  // Impact & Results Queries
  //   "Experimental Results Network": {
  //     query: `
  //       MATCH (p:Paper)-[r1:REPORTS]->(e:Entity)
  //       WHERE e.type IN ["Result", "Quantitative Result"]
  //       OPTIONAL MATCH (e)-[r2:RELATION]->(related:Entity)
  //       WHERE related.type IN ["Method", "Experimental Condition"]
  //       RETURN p, r1, e, r2, related LIMIT 200
  //     `,
  //     description: "Papers and their experimental results with methods",
  //     category: "results",
  //   },
  // "Method-Result Chains": {
  //   query: `
  //       MATCH path = (m:Entity)-[r:RELATION*1..3]->(res:Entity)
  //       WHERE m.type = "Method"
  //       AND res.type IN ["Result", "Quantitative Result"]
  //       WITH m, res, r, length(path) as pathLength
  //       ORDER BY pathLength LIMIT 100
  //       UNWIND r as rel
  //       MATCH (source)-[rel]->(target)
  //       RETURN source, rel, target
  //     `,
  //   description: "Methods leading to specific results",
  //   category: "results",
  // },
  //   "Impact Pathways": {
  //     query: `
  //       MATCH path = (e1:Entity)-[r:RELATION*1..3]->(e2:Entity)
  //       WHERE e1.type IN ["Method", "Experimental Condition"]
  //       AND e2.type IN ["Result", "Psychological Impact"]
  //       WITH e1, e2, r, length(path) as pathLength
  //       ORDER BY pathLength LIMIT 100
  //       UNWIND r as rel
  //       MATCH (source)-[rel]->(target)
  //       RETURN source, rel, target
  //     `,
  //     description: "Causal chains from methods to impacts",
  //     category: "results",
  //   },

  // Study Design Queries
  "Study Environments": {
    query: `
      MATCH (p:Paper)-[r1:REPORTS]->(env:Entity)
      WHERE env.type = "Environment"
      OPTIONAL MATCH (env)-[r2:RELATION]->(cond:Entity)
      WHERE cond.type = "Experimental Condition"
      RETURN p, r1, env, r2, cond LIMIT 2000
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
      RETURN p, r1, study, r2, comp LIMIT 5000
    `,
    description: "Full study designs with all components",
    category: "study",
  },

  "Papers and Results": {
    query: `
    MATCH (p:Paper)-[r:REPORTS]->(e:Entity)
    WHERE e.type = "Result"
    RETURN p, r, e LIMIT 2000
    `,
    description: "Papers and their reported Results",
    category: "study",
  },

  // Biological & Scientific Queries
  //   "Gene-Microorganism Relations": {
  //     query: `
  //       MATCH (gene:Entity)-[r:RELATION]-(micro:Entity)
  //       WHERE gene.type = "Gene" AND micro.type = "Microorganism"
  //       OPTIONAL MATCH (p:Paper)-[r2:REPORTS]->(gene)
  //       RETURN gene, r, micro, r2, p LIMIT 150
  //     `,
  //     description: "Genetic and microbiological relationships",
  //     category: "biological",
  //   },
  //   "Biological Impact Network": {
  //     query: `
  //       MATCH (bio:Entity)-[r1:RELATION]->(impact:Entity)
  //       WHERE bio.type IN ["Gene", "Microorganism"]
  //       AND impact.type IN ["Psychological Impact", "Result"]
  //       OPTIONAL MATCH (p:Paper)-[r2:REPORTS]->(bio)
  //       RETURN bio, r1, impact, r2, p LIMIT 150
  //     `,
  //     description: "How biological factors affect outcomes",
  //     category: "biological",
  //   },

  // Comparative Queries
  "Co-occurring Topics": {
    query: `
      MATCH (p:Paper)-[:MENTIONS]->(t1:Topic),
            (p)-[:MENTIONS]->(t2:Topic)
      WHERE t1 <> t2
      WITH t1, t2, COUNT(p) AS co_occurrence
      ORDER BY co_occurrence DESC LIMIT 2000
      RETURN t1, t2, co_occurrence
    `,
    description: "Topics that appear together in papers",
    category: "comparison",
  },
  //   "Cross-Method Results": {
  //     query: `
  //       MATCH (m1:Entity)-[r1:RELATION]->(result:Entity)<-[r2:RELATION]-(m2:Entity)
  //       WHERE m1.type = "Method" AND m2.type = "Method"
  //       AND result.type IN ["Result", "Quantitative Result"]
  //       AND m1 <> m2
  //       RETURN m1, r1, result, r2, m2 LIMIT 100
  //     `,
  //     description: "Results achieved by multiple methods",
  //     category: "comparison",
  //   },

  // Network Analysis
  "Highly Connected Entities": {
    query: `
    // Step 1: Find top 500 most connected entities
    MATCH (e:Entity)-[r:RELATION]-(other:Entity)
    WITH e, COUNT(DISTINCT r) AS connections
    ORDER BY connections DESC
    LIMIT 500

    // Step 2: Get all connections of these top entities
    MATCH (e)-[r2:RELATION]-(connected:Entity)
    RETURN e, r2, connected
    ORDER BY e.id, connections DESC
  `,
    description:
      "Top 500 most connected entities and their direct relationships",
    category: "network",
  },
  // Result
  Results: {
    query: `
    // Start from Entity nodes
    MATCH (e:Entity)-[r:RELATION]-(related:Entity)
    WHERE e.type = "Result" OR related.type = "Result"
    RETURN e, r, related LIMIT 2000
    `,
    description: "Entities connected to Results",
    category: "network",
  },
  //Relations
  Relations: {
    query: `
    MATCH (e1:Entity)-[r:RELATION]-(e2:Entity)
    RETURN e1, r, e2 LIMIT 2000
    `,
    description: "All RELATION relationships between entities",
    category: "network",
  },

  //   "Entity Clusters": {
  //     query: `
  //       MATCH (e1:Entity)-[r:RELATION]-(e2:Entity)
  //       WHERE e1.type = e2.type
  //       RETURN e1, r, e2 LIMIT 200
  //     `,
  //     description: "Entities grouped by type relationships",
  //     category: "network",
  //   },
};
