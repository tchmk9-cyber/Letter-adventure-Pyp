"""
Reference FastAPI Backend for Letter Adventure — IB PYP Edition.
Note: The upgraded frontend runs 100% offline using localStorage persistence
so no external server or paid subscription is required. This FastAPI backend
is included as a reference implementation of the original REST endpoints.
"""
from datetime import datetime
from typing import Dict, List, Optional
import uuid
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Letter Adventure IB PYP API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHILDREN: Dict[str, dict] = {
    "mia": {
        "id": "mia",
        "name": "Mia",
        "avatar": "bunny",
        "theme": "princess",
        "difficulty": "medium",
        "stars": 35,
        "points": 560,
        "last_active": datetime.utcnow().isoformat(),
        "activities": [],
    }
}
SETTINGS = {
    "reminders_enabled": True,
    "reminder_time": "16:00",
    "reminder_days": ["Mon", "Wed", "Fri"],
}
PARENT_PIN: Optional[str] = None
VOICES: Dict[str, str] = {}


class ChildCreate(BaseModel):
    name: str
    avatar: str = "fox"
    theme: str = "princess"
    difficulty: str = "medium"


class ActivityIn(BaseModel):
    type: str
    detail: str = ""
    points: int = 0
    stars: int = 0
    accuracy: int = 100
    duration: int = 30
    pypTheme: Optional[str] = None


class SpendIn(BaseModel):
    game: str
    cost: int


@app.get("/api/auth/me")
def get_me():
    return {"id": "teacher-1", "email": "mustafa@school.qa", "name": "Mustafa Teacher"}


@app.get("/api/children")
def list_children():
    return list(CHILDREN.values())


@app.post("/api/children")
def create_child(body: ChildCreate):
    cid = str(uuid.uuid4())[:8]
    child = {
        "id": cid,
        "name": body.name,
        "avatar": body.avatar,
        "theme": body.theme,
        "difficulty": body.difficulty,
        "stars": 0,
        "points": 50,
        "last_active": datetime.utcnow().isoformat(),
        "activities": [],
    }
    CHILDREN[cid] = child
    return child


@app.post("/api/children/{child_id}/activity")
def log_activity(child_id: str, body: ActivityIn):
    c = CHILDREN.get(child_id)
    if not c:
        raise HTTPException(404, "Child not found")
    c["points"] = max(0, c.get("points", 0) + body.points)
    c["stars"] = max(0, c.get("stars", 0) + body.stars)
    c["last_active"] = datetime.utcnow().isoformat()
    c.setdefault("activities", []).append({**body.dict(), "ts": c["last_active"]})
    return c


@app.post("/api/children/{child_id}/spend")
def spend_points(child_id: str, body: SpendIn):
    c = CHILDREN.get(child_id)
    if not c:
        raise HTTPException(404, "Child not found")
    if c.get("points", 0) < body.cost:
        raise HTTPException(400, "Not enough coins")
    c["points"] -= body.cost
    return c


@app.get("/api/parent/settings")
def get_settings():
    return SETTINGS


@app.put("/api/parent/settings")
def update_settings(body: dict):
    SETTINGS.update(body)
    return SETTINGS


@app.get("/api/voice")
def get_voices():
    return VOICES
