from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import time
import random

app = FastAPI(title="SkyPal Drone Delivery API")

# Allow all origins for Expo Go testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active missions
MISSIONS = {}

class DeliveryRequest(BaseModel):
    pickup: str
    drop: str

@app.post("/api/request")
async def request_delivery(req: DeliveryRequest):
    if not req.pickup or not req.drop:
        raise HTTPException(status_code=400, detail="Missing pickup or drop location")
    
    # Generate mock cost and mission ID
    mission_id = str(uuid.uuid4())[:8]
    cost = f"₹{random.randint(30, 80)}"
    
    # Store mission state
    MISSIONS[mission_id] = {
        "mission_id": mission_id,
        "status": "PENDING", # Starts as pending (Checking weather/battery)
        "pickup": req.pickup,
        "drop": req.drop,
        "cost": cost,
        "created_at": time.time(),
        "battery_level": random.randint(80, 100),
        "eta": f"{random.randint(10, 20)} mins"
    }
    
    return {
        "mission_id": mission_id,
        "cost": cost,
        "message": "Waiting for Drone Traffic Control approval..."
    }

@app.get("/api/status/{mission_id}")
async def get_mission_status(mission_id: str):
    mission = MISSIONS.get(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    # Mock logic: after 3 seconds, the mission is APPROVED.
    # In a real system, this would happen via drone telemetry and traffic control algorithms.
    current_time = time.time()
    elapsed = current_time - mission["created_at"]
    
    if mission["status"] == "PENDING" and elapsed > 3:
        mission["status"] = "APPROVED"
        
    return {
        "mission_id": mission["mission_id"],
        "status": mission["status"],
        "eta": mission["eta"],
        "battery": f"{mission['battery_level']}%"
    }

@app.get("/")
def read_root():
    return {"message": "SkyPal Backend System is Online"}
