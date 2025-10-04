from config.config import groq_client, tooltips
import re

def generate_mission_summary(mission_data):
    """
    Use Groq to create a concise, semantically rich summary of a mission.
    """
    prompt = f"""
    You are given a mission described with the following fields:

    Mission Data:
    {mission_data}

    Field Descriptions (tooltips for context):
    {tooltips}

    Task:
    - Summarize the mission into a single, coherent paragraph.
    - Include the following key elements where available: type of celestial body, mission phase, mission objective, technical context, and any additional context.
    - Extrapolate meaningful, search-relevant sentences from numeric or categorical values (e.g., deltaV, duration, crew, power requirements, coordinates, radiation dose) to enhance semantic representation.
    - Highlight mission intent, goals, constraints, and operational characteristics in natural language, so that the resulting summary can be used effectively for semantic search and similarity matching.
    - Do not include disclaimers or unrelated commentary. 
    - Return only the summary text, as a single paragraph.
    """

    response_summary = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
    content = response_summary.choices[0].message.content.strip()
    return content

def clean_groq_summary(summary: str) -> str:
    """
    Cleans the Groq RAG output for frontend display:
    - Fixes line breaks inside words
    - Removes excessive spaces
    - Converts numbered lists into clean lines
    """
    # Remove line breaks inside words (like 'Lab\non\nChip')
    summary = re.sub(r'(?<=\w)\n(?=\w)', ' ', summary)
    # Remove extra consecutive newlines
    summary = re.sub(r'\n+', '\n', summary)
    # Remove spaces around bullet points/numbers
    summary = re.sub(r'\s*([0-9]+\.|•)\s*', r'\1 ', summary)
    # Strip leading/trailing whitespace
    summary = summary.strip()
    return summary
