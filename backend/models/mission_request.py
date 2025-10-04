from pydantic import BaseModel
from fastapi import FastAPI

class MissionRequest(BaseModel):
    mission: dict