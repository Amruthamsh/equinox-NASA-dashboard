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

def generate_budget_summary_with_trends(df: pd.DataFrame, max_years: int = 5):
    """
    Generates a compact summary of NASA budget data for AI input.
    Includes the recent years, budget allocation per program, and simple trend indicators.
    """
    # Clean column names
    df_clean = df.copy()
    df_clean = df_clean.rename(columns=lambda x: x.strip())

    # Convert year to numeric
    def extract_year(y):
        try:
            return int(str(y).split()[0])
        except:
            return None

    df_clean['year_numeric'] = df_clean['Year'].apply(extract_year)
    df_clean = df_clean.dropna(subset=['year_numeric']).sort_values('year_numeric')

    # Programs columns (exclude Total Budget, Milestone, Description)
    program_cols = [
        c for c in df_clean.columns
        if c not in ['Year', 'Total Budget', 'Key Milestone', 'Description']
    ]

    recent_years = sorted(df_clean['year_numeric'].unique())[-max_years:]
    df_recent = df_clean[df_clean['year_numeric'].isin(recent_years)]

    summary_lines = []

    # Track previous year's values for trend
    prev_values = None
    for year in recent_years:
        year_data = df_recent[df_recent['year_numeric'] == year]
        budget_per_program = {col: float(year_data[col].sum()) for col in program_cols}

        # Add simple trend: ↑ increase, ↓ decrease, → no change
        trend_strs = []
        if prev_values is not None:
            for prog in program_cols:
                diff = budget_per_program[prog] - prev_values.get(prog, 0)
                if diff > 0:
                    trend = "↑"
                elif diff < 0:
                    trend = "↓"
                else:
                    trend = "→"
                trend_strs.append(f"{prog}: {budget_per_program[prog]} ({trend})")
        else:
            trend_strs = [f"{prog}: {budget_per_program[prog]} (→)" for prog in program_cols]

        summary_lines.append(f"{year} -> " + ", ".join(trend_strs))
        prev_values = budget_per_program

    return "\n".join(summary_lines)
