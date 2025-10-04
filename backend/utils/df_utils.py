import pandas as pd
import re

def clean_text(text):
    if pd.isna(text) or not str(text).strip():
        return ""
    text = re.sub(r"[^\w\s]", " ", str(text))
    text = re.sub(r"\s+", " ", text)
    return text.lower().strip()


def generate_df_summary(df: pd.DataFrame, max_years: int = 5):
    """
    Generates a compact summary of the data for AI input using the original DataFrame.
    Only include recent years and aggregated counts per category.
    """
    # Drop rows without year or category
    df_clean = df.dropna(subset=['year', 'primary_category'])

    # Convert year to int
    df_clean['year'] = df_clean['year'].astype(int)

    # Recent years
    recent_years = sorted(df_clean['year'].unique())[-max_years:]
    df_recent = df_clean[df_clean['year'].isin(recent_years)]

    summary_lines = []
    for year in recent_years:
        year_data = df_recent[df_recent['year'] == year]
        # Count papers per category
        counts_per_category = (
            year_data.groupby('primary_category').size().to_dict()
        )
        # Include zero counts for missing categories
        all_categories = df_clean['primary_category'].unique()
        counts_str = ", ".join(
            f"{cat}: {counts_per_category.get(cat, 0)}" for cat in all_categories
        )
        summary_lines.append(f"{year} -> {counts_str}")

    return "\n".join(summary_lines)
