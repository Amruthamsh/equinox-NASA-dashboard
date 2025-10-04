import os
import json
import re
import pandas as pd
import numpy as np
from tqdm.auto import tqdm
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from neo4j import GraphDatabase
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

def extract_json_from_text(text: str):
    """Try to extract the first valid JSON object from a messy string."""
    try:
        # Direct parse first
        return json.loads(text)
    except json.JSONDecodeError:
        # Try regex extraction
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                return None
    return None

# ===============================
# CONFIG
# ===============================
DATA_DIR = "data"

DATA_FILE = os.path.join(DATA_DIR, "extracted_all_with_sections.csv")
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USERNAME")
NEO4J_PASS = os.getenv("NEO4J_PASSWORD")

NUM_CLUSTERS = 10  # adjust based on dataset size
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
# GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_MODEL = "qwen/qwen3-32b"

# ===============================
# 1. Load and Preprocess Data
# ===============================
print("📂 Loading data...")
df = pd.read_csv(DATA_FILE)

def clean_text(txt):
    if not isinstance(txt, str):
        return ""
    return " ".join(txt.replace("\n", " ").split())

df["clean_full_text"] = (
    df["Title"].fillna("") + ". " +
    df["abstract"].fillna("") + " " +
    df["conclusion"].fillna("")
).apply(clean_text)

print(f"Loaded {len(df)} papers ✅")

# ===============================
# 2. Embeddings & Clustering
# ===============================
print("🧠 Loading embedding model...")
embedding_model = SentenceTransformer(MODEL_NAME)

print("🔢 Encoding papers...")
text_embeddings = embedding_model.encode(df["clean_full_text"].tolist(), show_progress_bar=True)

print(f"📊 Clustering into {NUM_CLUSTERS} groups...")
kmeans = KMeans(n_clusters=NUM_CLUSTERS, random_state=42)
df["cluster"] = kmeans.fit_predict(text_embeddings)

# Compute cluster embeddings (mean of embeddings)
cluster_embeddings = []
for i in range(NUM_CLUSTERS):
    cluster_embeddings.append(text_embeddings[df["cluster"] == i].mean(axis=0))
cluster_embeddings = np.vstack(cluster_embeddings)

# ===============================
# 3. Summarize Each Cluster (LLM)
# ===============================
print("💬 Summarizing clusters via Groq LLM...")
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

cluster_outputs = {}

for cluster_id in tqdm(range(NUM_CLUSTERS)):
    subset = df[df["cluster"] == cluster_id].head(10)  # limit to first 10 papers
    cluster_text = "\n\n".join(subset["clean_full_text"].tolist())

    groq_input = f"""
You are a research knowledge graph extractor.
Given the following scientific abstracts and conclusions from related papers:

{cluster_text}

Identify:
1. Key research topics.
2. Major findings or impacts (quantitative or qualitative).
3. Important entities (methods, instruments, results, etc.).
4. Relationships between entities (e.g., "X improves Y", "Z correlates with W").

Return **only JSON** in this format:

{{
  "cluster_summary": "summary of this cluster",
  "topics": ["topic1", "topic2"],
  "entities": [
    {{"name": "EntityA", "type": "Method"}},
    {{"name": "EntityB", "type": "Result"}}
  ],
  "relations": [
    {{"source": "EntityA", "target": "EntityB", "type": "improves"}}
  ]
}}
    """

    try:
        response_summary = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": groq_input}],
        )
        result = response_summary.choices[0].message.content.strip()
        json_result = extract_json_from_text(result)

        if json_result:
            # If valid JSON is extracted, use it
            cluster_outputs[cluster_id] = json_result
        else:
            print(f"⚠️ Invalid JSON for cluster {cluster_id}: {result}")
    except Exception as e:
        print(f"⚠️ Error parsing cluster {cluster_id}: {e}")
        continue

# save cluster outputs for inspection
with open(os.path.join(DATA_DIR, "cluster_summaries.json"), "w") as f:
    json.dump(cluster_outputs, f, indent=2)
# ===============================
# 4. Push to Neo4j (Updated for Papers, Impacts, and Results)
# ===============================
print("🕸️ Connecting to Neo4j...")
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))

with driver.session() as session:
    for cid, summary in cluster_outputs.items():
        topics = summary.get("topics", [])
        entities = summary.get("entities", [])
        relations = summary.get("relations", [])
        cluster_summary = summary.get("cluster_summary", "")

        # 1️⃣ Create cluster
        session.run("""
            MERGE (c:Cluster {id:$cid})
            SET c.summary=$summary
        """, cid=cid, summary=cluster_summary)

        # 2️⃣ Create topics and link to cluster
        for t in topics:
            session.run("""
                MERGE (t:Topic {name:$name})
                MERGE (c:Cluster {id:$cid})-[:HAS_TOPIC]->(t)
            """, name=t, cid=cid)

        # 3️⃣ Create entities and link to cluster
        for e in entities:
            session.run("""
                MERGE (en:Entity {name:$name})
                SET en.type=$type
                MERGE (c:Cluster {id:$cid})-[:CONTAINS]->(en)
            """, name=e["name"], type=e.get("type", "Unknown"), cid=cid)

        # 4️⃣ Create relations between entities
        for r in relations:
            session.run("""
                MATCH (a:Entity {name:$src}), (b:Entity {name:$tgt})
                MERGE (a)-[rel:RELATION {type:$type}]->(b)
            """, src=r["source"], tgt=r["target"], type=r.get("type", "related_to"))

        # 5️⃣ Create Paper nodes and link to cluster, topics, entities
        papers_in_cluster = df[df["cluster"] == cid]
        for idx, paper in papers_in_cluster.iterrows():
            paper_id = f"PAPER_{idx}"
            session.run("""
                MERGE (p:Paper {id:$paper_id})
                SET p.title=$title, p.year=$year, p.abstract=$abstract
                MERGE (c:Cluster {id:$cid})
                MERGE (p)-[:BELONGS_TO]->(c)
            """, paper_id=paper_id,
                 title=paper['Title'],
                 year=int(paper.get('year', 0)),
                 abstract=paper.get('abstract', ''),
                 cid=cid)

            # Link papers to topics
            for t in topics:
                session.run("""
                    MATCH (p:Paper {id:$paper_id}), (t:Topic {name:$tname})
                    MERGE (p)-[:MENTIONS]->(t)
                """, paper_id=paper_id, tname=t)

            # Link papers to entities
            for e in entities:
                session.run("""
                    MATCH (p:Paper {id:$paper_id}), (en:Entity {name:$ename})
                    MERGE (p)-[:REPORTS]->(en)
                """, paper_id=paper_id, ename=e["name"])

print("✅ Papers, topics, entities, and relations pushed successfully!")
