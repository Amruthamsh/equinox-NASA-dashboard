from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.responses import JSONResponse
import os
from itertools import product

app = FastAPI(title="NASA Bioscience API - Semantic Categorization")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CATEGORIES = {
    'Microgravity Effects': 'Experiments on gravity, weightlessness, and their effects on biological systems including physiological, cellular, and molecular responses to altered gravity.',
    'Radiation Biology': 'Studies of cosmic radiation, particle exposure, and radiation effects on cells, organisms, and humans in space environments.',
    'Plant & Microbial Biology': 'Plant growth, seeds, germination, agriculture, and microbial biology in space including microbiome studies and microbial adaptation to space conditions.',
    'Human Physiology & Behavior': 'Human health and physiological studies, including cardiovascular, musculoskeletal, cognitive, and behavioral experiments on astronauts and crew.',
    'Molecular & Cell Biology': 'Molecular, cellular, proteomic, genomic, and omics studies, covering gene expression, proteins, DNA, RNA, and cellular mechanisms in space.',
    'Space Medicine': 'Medical interventions, therapies, treatments, and countermeasures for health risks associated with spaceflight and prolonged exposure to microgravity or radiation.',
    'Life Support & Environment': 'Studies on air, water, waste management, and environmental control systems for sustaining life in spacecraft or habitats.',
    'Space Systems & Instrumentation': 'Development and testing of devices, instruments, hardware, and experimental technologies used in space research and bioscience experiments.',
    'Synthetic Biology & Tissue Engineering': 'Tissue growth and synthetic biology in space Engineering tissues, organoids, or synthetic biological systems, including growth and manipulation of biological samples in space.'
}

category_names = list(CATEGORIES.keys())
category_texts = [CATEGORIES[c] for c in category_names]

DATA_DIR = "data"

INPUT_FILE = os.path.join(DATA_DIR, "extracted_all_with_sections.csv")
df = pd.read_csv(INPUT_FILE)

def clean_text(text):
    if pd.isna(text) or not str(text).strip():
        return ""
    text = re.sub(r"[^\w\s]", " ", str(text))
    text = re.sub(r"\s+", " ", text)
    return text.lower().strip()

df["clean_full_text"] = (
    df["Title"].fillna("")
    + " "
    + df["abstract"].fillna("")
    + " "
    + df["conclusion"].fillna("")
).apply(clean_text)

df["date"] = pd.to_datetime(df["date"], errors="coerce")
df["year"] = df["date"].dt.year
df['date'] = df['date'].astype(str)

print("🚀 Loading SentenceTransformer model...")
embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

print("🔬 Generating category embeddings...")
category_embeddings = embedding_model.encode(category_texts, convert_to_numpy=True)

print("🧠 Generating paper embeddings...")
text_embeddings = embedding_model.encode(df["clean_full_text"].tolist(), convert_to_numpy=True)

print("🪐 Performing semantic categorization...")
similarities = cosine_similarity(text_embeddings, category_embeddings)
best_idxs = np.argmax(similarities, axis=1)
df["primary_category"] = [category_names[i] for i in best_idxs]

@app.get("/health")
def read_root():
    return {"message": "Welcome to the NASA Bioscience API"}

@app.get("/papers")
def get_all_papers():
    """Return all paper data."""
    clean_df = df.replace({np.nan: None})
    clean_df = clean_df.drop(columns=["clean_full_text"])
    return JSONResponse(content=clean_df.to_dict(orient="records"))


@app.get("/research-evolution")
def get_research_evolution():
    """Return category evolution over time with zero-filled missing categories."""
    evolution = df.groupby(["year", "primary_category"]).size().reset_index(name="count")

    all_years = df['year'].dropna().unique()
    all_categories = df['primary_category'].unique()

    # Create all possible year-category combinations
    full_index = pd.DataFrame(list(product(all_years, all_categories)), columns=['year', 'primary_category'])

    # Merge with actual counts, missing combinations will have NaN
    merged = pd.merge(full_index, evolution, on=['year', 'primary_category'], how='left')
    merged['count'] = merged['count'].fillna(0).astype(int)

    # Pivot so each row is a year, each column is a category
    pivot_df = merged.pivot(index="year", columns="primary_category", values="count").reset_index()

    return JSONResponse(content=pivot_df.to_dict(orient="records"))


