import cv2
import numpy as np
from .encrypt import process_image


def uploaded_file_to_cv2_image(uploaded_file):
    # Read file into a numpy array
    file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
    # Decode into OpenCV image
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)  # or cv2.IMREAD_GRAYSCALE
    return img

def enc(file, key="password"): 
    
    return process_image(uploaded_file_to_cv2_image(file), key)