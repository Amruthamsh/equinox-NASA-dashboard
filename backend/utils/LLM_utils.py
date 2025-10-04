from config.config import groq_client, tooltips

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
