import cv2
import redis
import numpy as np
import time
import logging
import threading

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

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

# Define a frame buffer to store frames temporarily
frame_buffer = []

# This function will run in a separate thread and retrieve frames from Redis
def retrieve_frames():
    global frame_buffer
    while True:
        jpg_as_text = r.get('camera:frame')
        if jpg_as_text:
            # Decode the image
            nparr = np.frombuffer(jpg_as_text, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            frame_buffer.append(frame)

# Start the frame retrieval thread
frame_thread = threading.Thread(target=retrieve_frames)
frame_thread.daemon = True  # Make sure this thread dies when the main program exits
frame_thread.start()

try:
    while True:
        if frame_buffer:
            # Get the latest frame from the buffer
            frame = frame_buffer.pop(0)

            # Calculate FPS
            frames_received += 1
            current_time = time.time()
            if current_time - last_frame_time >= 1.0:  # Update FPS every second
                fps = frames_received / (current_time - last_frame_time)
                frames_received = 0
                last_frame_time = current_time

            # Display FPS on frame
            cv2.putText(frame, f"FPS: {fps:.1f}", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            # Display the frame
            cv2.imshow('RTSP Stream', frame)

        # Break loop on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        # Small delay to reduce CPU usage
        time.sleep(0.01)

except KeyboardInterrupt:
    logging.info("Stopped by user")
except Exception as e:
    logging.error(f"Error: {str(e)}")
finally:
    cv2.destroyAllWindows()
    logging.info("Stream viewer closed")
