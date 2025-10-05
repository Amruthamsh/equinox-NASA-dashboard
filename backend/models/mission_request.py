from pydantic import BaseModel
from typing import Any, List, Dict, Optional
from fastapi import FastAPI

class MissionRequest(BaseModel):
    mission: dict

class Paper(BaseModel):
    title: str
    link: Optional[str]
    similarity: float

class MissionData(BaseModel):
    mission: Dict[str, Any]        
    insights: Dict[str, Optional[str]]
    topPapers: List[Paper] = []
    tooltips: Dict[str, str] = {}