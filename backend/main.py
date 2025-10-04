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
from fastapi import FastAPI, HTTPException
from groq import Groq
from config.config import groq_client, TAB_PROMPTS, category_names, category_texts
from models.request_models import AskAIRequest
from utils.df_utils import clean_text, generate_df_summary
from dotenv import load_dotenv
load_dotenv()


app = FastAPI(title="NASA Bioscience API - Semantic Categorization")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = "data"

INPUT_FILE = os.path.join(DATA_DIR, "extracted_all_with_sections.csv")
df = pd.read_csv(INPUT_FILE)

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

@app.get("/ai-tabs")
def get_ai_tabs():
    df_summary = generate_df_summary(df)
    tab_results = {}
    for tab, prompt in TAB_PROMPTS.items():
        full_prompt = f"""
                Answer the following question based on the data:
                {prompt}
                Here is the recent NASA bioscience data:
                {df_summary} 
                The count of publications in each category for the recent years is given.

                Provide answer within 100 words. Return only the answer, no other text. 
                Do not mention the data source. 
                Don't add any disclaimers or commentary.
                """
        try:
            response_summary = groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "user", "content": full_prompt}
                    ]
                )
            content = response_summary.choices[0].message.content.strip()

            tab_results[tab] = content
        except Exception as e:
            tab_results[tab] = f"Error fetching AI content: {str(e)}"
    return JSONResponse(content=tab_results)

@app.post("/ask-ai")
def ask_ai(request: AskAIRequest):
    df_summary = generate_df_summary(df)
    user_question = request.question
    full_prompt = f"""
        Answer the following question based on the data:
        {user_question}
        Here is the recent NASA bioscience data:
        {df_summary} 
        The count of publications in each category for the recent years is given. But explain the trend, don't just repeat the numbers.

        Provide answer within 100 words. Return only the answer, no other text. 
        Do not mention the data source. 
        Don't add any disclaimers or commentary.
        """
    try:
        response_summary = groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "user", "content": full_prompt}
                    ]
                )
        content = response_summary.choices[0].message.content.strip()
        return JSONResponse(content={"answer": content})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI request failed: {str(e)}")


