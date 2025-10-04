import os
import json
import numpy as np
import pandas as pd
import requests
import re
from tqdm.auto import tqdm
from dotenv import load_dotenv

load_dotenv()

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

INPUT_FILE = os.path.join(DATA_DIR, "SB_publication_PMC.csv")
OUTPUT_FILE = os.path.join(DATA_DIR, "extracted_all_with_sections.csv")

df = pd.read_csv(INPUT_FILE, header=None, names=["Title", "Link"])
df = df.dropna(subset=["Title"]).reset_index(drop=True)
minimized_df = df[1:]  # Skip header row if present

def extract_pmc_id(url):
    if not isinstance(url, str):
        return None
    url = url.strip()
    if "ncbi.nlm.nih.gov/pmc/articles" in url:
        parts = url.rstrip("/").split("/")
        pmc_part = parts[-1]
        if pmc_part.upper().startswith("PMC"):
            return pmc_part.upper()
    return None

def clean_text(raw_text):
    text = re.sub(r"<.*?>", " ", raw_text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def fetch_pmc_sections(pmc_id):
    if not pmc_id.startswith("PMC"):
        pmc_id = "PMC" + str(pmc_id)

    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    params = {"db": "pmc", "id": pmc_id, "retmode": "xml"}

    try:
        r = requests.get(url, params=params, timeout=10)
        r.raise_for_status()
        xml = r.text

        # Extract abstract
        abstract = ""
        match = re.search(r"<abstract[^>]*>(.*?)</abstract>", xml, re.DOTALL | re.IGNORECASE)
        if match:
            abstract = clean_text(match.group(1))

        # Extract conclusion
        conclusion = ""
        conc_match = re.search(r'<sec[^>]*sec-type="conclusion"[^>]*>(.*?)</sec>', xml, re.DOTALL | re.IGNORECASE)
        if conc_match:
            conclusion = clean_text(conc_match.group(1))
        else:
            conc_match2 = re.search(r"<sec[^>]*>.*?<title> *Conclusion[s]* *</title>(.*?)</sec>", xml, re.DOTALL | re.IGNORECASE)
            if conc_match2:
                conclusion = clean_text(conc_match2.group(1))

        # Extract publication and history dates
        pub_dates = []
        for tag, dtype in [
            (r'<pub-date pub-type="epub">(.*?)</pub-date>', "epub"),
            (r'<pub-date pub-type="collection">(.*?)</pub-date>', "collection"),
        ]:
            match = re.search(tag, xml, re.DOTALL | re.IGNORECASE)
            if match:
                date_block = match.group(1)
                year = re.search(r"<year>(\d+)</year>", date_block)
                month = re.search(r"<month>(\d+)</month>", date_block)
                day = re.search(r"<day>(\d+)</day>", date_block)
                pub_dates.append({
                    "type": dtype,
                    "year": year.group(1) if year else "",
                    "month": month.group(1).zfill(2) if month else "01",
                    "day": day.group(1).zfill(2) if day else "01",
                })

        history_dates = []
        match = re.search(r'<date date-type="accepted">(.*?)</date>', xml, re.DOTALL | re.IGNORECASE)
        if match:
            block = match.group(1)
            year = re.search(r"<year>(\d+)</year>", block)
            month = re.search(r"<month>(\d+)</month>", block)
            day = re.search(r"<day>(\d+)</day>", block)
            history_dates.append({
                "type": "accepted",
                "year": year.group(1) if year else "",
                "month": month.group(1).zfill(2) if month else "01",
                "day": day.group(1).zfill(2) if day else "01",
            })

        def get_best_pub_date(pub_dates, history_dates):
            for d in pub_dates:
                if d["type"] == "epub":
                    return f"{d['year']}-{d['month']}-{d['day']}"
            for d in pub_dates:
                if d["type"] == "collection":
                    return f"{d['year']}-{d['month']}-{d['day']}"
            for d in history_dates:
                if d["type"] == "accepted":
                    return f"{d['year']}-{d['month']}-{d['day']}"
            return ""

        best_date = get_best_pub_date(pub_dates, history_dates)

        return {
            "abstract": abstract or "",
            "conclusion": conclusion or "",
            "best_date": best_date,
        }

    except Exception as e:
        print("Error fetching", pmc_id, e)
        return {"abstract": "", "conclusion": "", "best_date": ""}

print("Fetching abstracts, conclusions & dates...")
abstracts, conclusions, dates = [], [], []

for idx, row in tqdm(minimized_df.iterrows(), total=len(minimized_df)):
    pmc_id = extract_pmc_id(row["Link"])
    if pmc_id:
        sections = fetch_pmc_sections(pmc_id)
        abstract = sections["abstract"]
        conclusion = sections["conclusion"]
        best_date = sections["best_date"]
    else:
        abstract, conclusion, best_date = "", "", ""

    abstracts.append(abstract if len(abstract) > 50 else "")
    conclusions.append(conclusion if len(conclusion) > 20 else "")
    dates.append(best_date)

minimized_df = minimized_df.copy()
minimized_df["abstract"] = abstracts
minimized_df["conclusion"] = conclusions
minimized_df["date"] = dates

minimized_df.to_csv(OUTPUT_FILE, index=False)

print(f"✅ Saved CSV to {OUTPUT_FILE}")
