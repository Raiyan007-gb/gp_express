# import cv2
# import redis
# import numpy as np
# import time
# import logging
# import threading
# from collections import defaultdict
# from ultralytics import YOLO

# # Setup logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

# # Load YOLO model
# logging.info("Loading YOLO model...")
# person_model = YOLO("yolo11n.pt")
# device = 'cuda'  # Use GPU for inference

# # Track history for detected persons
# person_track_history = defaultdict(list)
# current_count = 0
# male_count = 0
# female_count = 0  # This would require gender detection model

# # Replace with your Raspberry Pi's Tailscale IP
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
#     logging.info("Successfully connected to Redis")
# except Exception as e:
#     logging.error(f"Failed to connect to Redis: {str(e)}")
#     exit(1)

# # Subscribe to updates
# pubsub = r.pubsub()
# pubsub.subscribe('camera:updates')

# # Create display window
# cv2.namedWindow('RTSP Stream', cv2.WINDOW_NORMAL)
# frames_received = 0
# last_frame_time = time.time()
# fps = 0

# # Define a frame buffer to store frames temporarily
# frame_buffer = []
# processed_frames_buffer = []

# # Detection settings
# detection_interval = 3  # Process every 3rd frame for detection to improve performance
# frame_count = 0

# # This function will run in a separate thread and retrieve frames from Redis
# def retrieve_frames():
#     global frame_buffer
#     while True:
#         try:
#             jpg_as_text = r.get('camera:frame')
#             if jpg_as_text:
#                 # Decode the image
#                 nparr = np.frombuffer(jpg_as_text, np.uint8)
#                 frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
#                 if len(frame_buffer) < 10:  # Limit buffer size
#                     frame_buffer.append(frame.copy())
#         except Exception as e:
#             logging.error(f"Error retrieving frame: {str(e)}")
#         time.sleep(0.01)  # Small delay to reduce CPU usage

# # This function will process frames with YOLO in a separate thread
# def process_frames():
#     global frame_buffer, processed_frames_buffer, current_count
#     while True:
#         if frame_buffer:
#             # Get a frame from the buffer
#             frame = frame_buffer.pop(0)
            
#             global frame_count
#             frame_count += 1
            
#             # Only process every few frames to improve performance
#             if frame_count % detection_interval == 0:
#                 try:
#                     # Run YOLO detection
#                     results_person = person_model.track(
#                         frame,
#                         persist=True,
#                         device=device,
#                         # classes=[0]  # Person class (uncomment if needed)
#                     )
                    
#                     # Process tracking results
#                     annotated_frame = results_person[0].plot()
                    
#                     if results_person[0].boxes.id is not None:
#                         boxes = results_person[0].boxes.xywh.cpu().numpy()
#                         track_ids = results_person[0].boxes.id.int().cpu().tolist()
                        
#                         # Update current count
#                         current_count = len(track_ids)
                        
#                         for box, track_id in zip(boxes, track_ids):
#                             x, y, w, h = box.astype(int)
#                             track = person_track_history[track_id]
#                             track.append((int(x + w // 2), int(y + h // 2)))
#                             if len(track) > 30:
#                                 track.pop(0)
                    
#                     # Add counts to the frame
#                     cv2.putText(annotated_frame, f"People: {current_count}", (20, 40),
#                                 cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    
#                     # Store processed frame
#                     processed_frames_buffer.append(annotated_frame)
                    
#                     # Save stats to Redis for other applications to use
#                     stats = {
#                         "personCount": current_count,
#                         "maleCount": male_count,
#                         "femaleCount": female_count,
#                         "timestamp": time.time()
#                     }
#                     r.set("camera:stats", str(stats))
                    
#                 except Exception as e:
#                     logging.error(f"Error processing frame with YOLO: {str(e)}")
#                     # If processing fails, use the original frame
#                     processed_frames_buffer.append(frame)
#             else:
#                 # For frames we skip detection on, just copy the original
#                 processed_frames_buffer.append(frame)
        
#         time.sleep(0.01)  # Small delay to reduce CPU usage

# # Start the frame retrieval thread
# frame_thread = threading.Thread(target=retrieve_frames)
# frame_thread.daemon = True
# frame_thread.start()

# # Start the frame processing thread
# process_thread = threading.Thread(target=process_frames)
# process_thread.daemon = True
# process_thread.start()

# # Main display loop
# try:
#     while True:
#         if processed_frames_buffer:
#             # Get the latest processed frame
#             frame = processed_frames_buffer.pop(0)
            
#             # Calculate FPS
#             frames_received += 1
#             current_time = time.time()
#             if current_time - last_frame_time >= 1.0:  # Update FPS every second
#                 fps = frames_received / (current_time - last_frame_time)
#                 frames_received = 0
#                 last_frame_time = current_time
            
#             # Display FPS on frame
#             cv2.putText(frame, f"FPS: {fps:.1f}", (20, 80),
#                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
#             # Display the frame
#             cv2.imshow('RTSP Stream', frame)
        
#         # Break loop on 'q' key press
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
        
#         # Small delay to reduce CPU usage
#         time.sleep(0.01)

# except KeyboardInterrupt:
#     logging.info("Stopped by user")
# except Exception as e:
#     logging.error(f"Error: {str(e)}")
# finally:
#     cv2.destroyAllWindows()
#     logging.info("Stream viewer closed")
import cv2
import redis
import numpy as np
import time
import logging
import threading
from ultralytics import YOLO

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

# Load YOLO model
logging.info("Loading YOLO model...")
person_model = YOLO("yolo11n.pt")
device = 'cuda'  # Use GPU for inference

# Replace with your Raspberry Pi's Tailscale IP
ubuntu = "100.104.12.47"

# Connect to Redis on Raspberry Pi
try:
    r = redis.Redis(
        host=ubuntu,
        port=6379,
        password='tdiexpress007',
        socket_timeout=5
    )
    r.ping()  # Test connection
    logging.info("Successfully connected to Redis")
except Exception as e:
    logging.error(f"Failed to connect to Redis: {str(e)}")
    exit(1)

# Subscribe to updates
pubsub = r.pubsub()
pubsub.subscribe('camera:updates')

# Create display window
cv2.namedWindow('RTSP Stream', cv2.WINDOW_NORMAL)
frames_received = 0
last_frame_time = time.time()
fps = 0

# Frame buffers
frame_buffer = []
processed_frames_buffer = []

# Detection settings
detection_interval = 3  # Process every 3rd frame
frame_count = 0
current_in_frame = 0

# Frame retrieval thread
def retrieve_frames():
    global frame_buffer
    while True:
        try:
            jpg_as_text = r.get('camera:frame')
            if jpg_as_text:
                nparr = np.frombuffer(jpg_as_text, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if len(frame_buffer) < 10:
                    frame_buffer.append(frame.copy())
        except Exception as e:
            logging.error(f"Error retrieving frame: {str(e)}")
        time.sleep(0.01)

# Frame processing thread
def process_frames():
    global frame_buffer, processed_frames_buffer, current_in_frame
    while True:
        if frame_buffer:
            frame = frame_buffer.pop(0)
            global frame_count
            frame_count += 1
            if frame_count % detection_interval == 0:
                try:
                    results_person = person_model.track(
                        frame, persist=True, device=device
                    )
                    annotated_frame = frame.copy()
                    
                    if results_person[0].boxes.id is not None:
                        track_ids = results_person[0].boxes.id.int().cpu().tolist()
                        current_in_frame = len(track_ids)
                    else:
                        current_in_frame = 0  # No person detected
                    
                    # Add counts to the frame
                    cv2.putText(annotated_frame, f"People in Frame: {current_in_frame}", (20, 40),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    
                    processed_frames_buffer.append(annotated_frame)
                    
                    stats = {
                        "currentInFrame": current_in_frame,
                        "timestamp": time.time()
                    }
                    r.set("camera:stats", str(stats))
                except Exception as e:
                    logging.error(f"Error processing frame with YOLO: {str(e)}")
                    processed_frames_buffer.append(frame)
            else:
                processed_frames_buffer.append(frame)
        time.sleep(0.01)

# Start threads
frame_thread = threading.Thread(target=retrieve_frames, daemon=True)
frame_thread.start()
process_thread = threading.Thread(target=process_frames, daemon=True)
process_thread.start()

# Main display loop
try:
    while True:
        if processed_frames_buffer:
            frame = processed_frames_buffer.pop(0)
            frames_received += 1
            current_time = time.time()
            if current_time - last_frame_time >= 1.0:
                fps = frames_received / (current_time - last_frame_time)
                frames_received = 0
                last_frame_time = current_time
            cv2.putText(frame, f"FPS: {fps:.1f}", (20, 80),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow('RTSP Stream', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        time.sleep(0.01)
except KeyboardInterrupt:
    logging.info("Stopped by user")
except Exception as e:
    logging.error(f"Error: {str(e)}")
finally:
    cv2.destroyAllWindows()
    logging.info("Stream viewer closed")
