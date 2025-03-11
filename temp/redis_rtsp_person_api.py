# import redis
# import numpy as np
# import time
# from fastapi import FastAPI
# from pydantic import BaseModel
# from fastapi.responses import JSONResponse
# from ultralytics import YOLO
# import threading
# import logging
# import cv2
# from fastapi.middleware.cors import CORSMiddleware

# # Disable logging completely
# # logging.disable(logging.CRITICAL)
# logging.getLogger("ultralytics").setLevel(logging.ERROR)
# # Initialize FastAPI app
# app = FastAPI()
# # Enable CORS for your frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allow all origins (or restrict to specific domains like http://localhost:3000)
#     allow_credentials=True,
#     allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
#     allow_headers=["*"],  # Allow all headers
# )

# # Load YOLO model
# person_model = YOLO("best.pt")
# device = 'cuda'  # Use GPU for inference

# # Replace with your Raspberry Pi's Tailscale IP
# raspberrypi = "100.117.70.128"
# ubuntu = "100.104.12.47"

# # Connect to Redis on Raspberry Pi
# try:
#     r = redis.Redis(
#         host=ubuntu,
#         port=6379,
#         password='tdiexpress007',
#         socket_timeout=5
#     )
#     r.ping()  # Test connection
# except Exception as e:
#     print(f"Failed to connect to Redis: {str(e)}")
#     exit(1)

# # Subscribe to updates
# pubsub = r.pubsub()
# pubsub.subscribe('camera:updates')

# # Frame buffer
# frame_buffer = []

# # Detection settings
# detection_interval = 3  # Process every 3rd frame
# frame_count = 0
# current_in_frame = 0

# # Frame retrieval thread
# def retrieve_frames():
#     global frame_buffer
#     while True:
#         try:
#             jpg_as_text = r.get('camera:frame')
#             if jpg_as_text:
#                 nparr = np.frombuffer(jpg_as_text, np.uint8)
#                 frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#                 if len(frame_buffer) < 10:
#                     frame_buffer.append(frame.copy())
#         except Exception as e:
#             print(f"Error retrieving frame: {str(e)}")
#         time.sleep(0.01)

# # Frame processing thread
# def process_frames():
#     global frame_buffer, current_in_frame
#     while True:
#         if frame_buffer:
#             frame = frame_buffer.pop(0)
#             global frame_count
#             frame_count += 1
#             if frame_count % detection_interval == 0:
#                 try:
#                     results_person = person_model.track(
#                         frame, persist=True, device=device
#                     )
#                     if results_person[0].boxes.id is not None:
#                         track_ids = results_person[0].boxes.id.int().cpu().tolist()
#                         current_in_frame = len(track_ids)
#                     else:
#                         current_in_frame = 0  # No person detected
                    
#                     stats = {
#                         "currentInFrame": current_in_frame,
#                         "timestamp": time.time()
#                     }
#                     r.set("camera:stats", str(stats))
#                 except Exception as e:
#                     print(f"Error processing frame with YOLO: {str(e)}")
#         time.sleep(0.01)

# # Start threads
# frame_thread = threading.Thread(target=retrieve_frames, daemon=True)
# frame_thread.start()
# process_thread = threading.Thread(target=process_frames, daemon=True)
# process_thread.start()

# # Pydantic model for the API response
# class AnalyticsResponse(BaseModel):
#     currentInFrame: int
#     timestamp: float

# @app.get("/analytics")
# def get_analytics():
#     try:
#         stats = r.get("camera:stats")
#         if stats:
#             data = eval(stats.decode())  # Convert string to dictionary
#             return {"currentInFrame": data["currentInFrame"]}  # Return only the person count
#         else:
#             return {"error": "No data available"}
#     except Exception as e:
#         print(f"Error fetching analytics: {str(e)}")
#         return {"error": "Failed to retrieve analytics"}

# import uvicorn

# if __name__ == "__main__":
#     uvicorn.run("redis_rtsp_person_api:app", host="0.0.0.0", port=5000, reload=True)
import redis
import numpy as np
import time
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import threading
import logging
import cv2
from fastapi.middleware.cors import CORSMiddleware

# Disable logging completely
logging.getLogger("ultralytics").setLevel(logging.ERROR)

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (or restrict to specific domains like http://localhost:3000)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Load YOLO model
person_model = YOLO("best.pt")
device = 'cuda'  # Use GPU for inference

# Replace with your Raspberry Pi's Tailscale IP
raspberrypi = "100.117.70.128"
ubuntu = "100.104.12.47"

# Global Redis connection
r = None
connected = False

def connect_redis():
    """Try connecting to Redis, and retry if it fails."""
    global r, connected
    while True:
        try:
            r = redis.Redis(
                host=raspberrypi,
                port=6379,
                password='tdiexpress007',
                socket_timeout=5
            )
            r.ping()  # Test connection
            connected = True
            print("[INFO] Connected to Redis.")
            break
        except Exception as e:
            connected = False
            print(f"[WARNING] Redis connection failed: {str(e)}. Retrying in 5s...")
            time.sleep(5)  # Wait before retrying

# Start Redis connection attempt
redis_thread = threading.Thread(target=connect_redis, daemon=True)
redis_thread.start()

# Frame buffer
frame_buffer = []

# Detection settings
detection_interval = 3  # Process every 3rd frame
frame_count = 0
current_in_frame = 0

# Frame retrieval thread
def retrieve_frames():
    global frame_buffer
    while True:
        if connected:  # Check if Redis is available
            try:
                jpg_as_text = r.get('camera:frame')
                if jpg_as_text:
                    nparr = np.frombuffer(jpg_as_text, np.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    if len(frame_buffer) < 10:
                        frame_buffer.append(frame.copy())
            except Exception as e:
                print(f"[ERROR] Retrieving frame: {str(e)}")
        time.sleep(0.01)

# Frame processing thread
def process_frames():
    global frame_buffer, current_in_frame
    while True:
        if frame_buffer:
            frame = frame_buffer.pop(0)
            global frame_count
            frame_count += 1
            if frame_count % detection_interval == 0:
                try:
                    results_person = person_model.track(frame, persist=True, device=device)
                    if results_person[0].boxes.id is not None:
                        track_ids = results_person[0].boxes.id.int().cpu().tolist()
                        current_in_frame = len(track_ids)
                    else:
                        current_in_frame = 0  # No person detected
                    
                    stats = {
                        "currentInFrame": current_in_frame,
                        "timestamp": time.time()
                    }

                    if connected:  # Only set Redis data if connected
                        r.set("camera:stats", str(stats))

                except Exception as e:
                    print(f"[ERROR] Processing frame with YOLO: {str(e)}")
        time.sleep(0.01)

# Start threads
frame_thread = threading.Thread(target=retrieve_frames, daemon=True)
frame_thread.start()
process_thread = threading.Thread(target=process_frames, daemon=True)
process_thread.start()

# Redis reconnect thread
def reconnect_redis():
    """Continuously check if Redis is disconnected and attempt to reconnect."""
    global connected
    while True:
        if not connected:
            print("[INFO] Trying to reconnect to Redis...")
            connect_redis()
        time.sleep(5)

reconnect_thread = threading.Thread(target=reconnect_redis, daemon=True)
reconnect_thread.start()

# Pydantic model for the API response
class AnalyticsResponse(BaseModel):
    currentInFrame: int
    timestamp: float

@app.get("/analytics")
def get_analytics():
    try:
        if connected:
            stats = r.get("camera:stats")
            if stats:
                data = eval(stats.decode())  # Convert string to dictionary
                return {"currentInFrame": data["currentInFrame"]}  # Return only the person count
            else:
                return {"error": "No data available"}
        else:
            return {"warning": "Redis not connected. Data may be outdated."}
    except Exception as e:
        print(f"[ERROR] Fetching analytics: {str(e)}")
        return {"error": "Failed to retrieve analytics"}

import uvicorn

if __name__ == "__main__":
    uvicorn.run("redis_rtsp_person_api:app", host="0.0.0.0", port=5000, reload=True)
