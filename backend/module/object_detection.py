from inference.models.utils import get_roboflow_model
import cv2
import os
import json
import random

HOME = os.getcwd()
for image in os.listdir(os.path.join(HOME, 'uploaded_data')):
    if image.endswith('.png') or image.endswith('jpeg') or image.endswith('jpeg'):
        image_path = os.path.join(HOME, 'uploaded_data', image)
    elif image.endswith('.pdf'):
        pdf_path = os.path.join(HOME, 'uploaded_data', image)

# Roboflow model setup
model_name = "all-symbols"
model_version = "5"
model = get_roboflow_model(
    model_id="{}/{}".format(model_name, model_version),
    api_key="0pvALuXz1mCC5gHn0T9O"
)

# Load image
frame = cv2.imread(image_path)

# Get predictions
results = model.infer(image=frame,
                     confidence=0.5,
                     iou_threshold=0.5)

# Dictionary to store class colors
class_colors = {}
detection_results = {
    "detections": [],
    "class_colors": {}
}

if results[0].predictions:
    for prediction in results[0].predictions:
        class_name = prediction.class_name
        confidence = prediction.confidence
        
        # 클래스별 색상 할당 (처음 나오는 클래스만)
        if class_name not in class_colors:
            color = (
                random.randint(0, 255),
                random.randint(0, 255),
                random.randint(0, 255)
            )
            class_colors[class_name] = color
            detection_results["class_colors"][class_name] = {
                "rgb": [int(c) for c in color[::-1]]  # BGR to RGB
            }

        x_center = int(prediction.x)
        y_center = int(prediction.y)
        width = int(prediction.width)
        height = int(prediction.height)
        
        # 박스 좌표 계산
        x0 = x_center - width // 2
        y0 = y_center - height // 2
        x1 = x_center + width // 2
        y1 = y_center + height // 2
        
        # bbox만 그리기 (텍스트 제외)
        color = class_colors[class_name]
        cv2.rectangle(frame, (x0, y0), (x1, y1), color, 3)
        
        # detection 정보 저장
        detection_results["detections"].append({
            "class_name": class_name,
            "confidence": float(confidence),
            "bbox": {
                "x_center": x_center,
                "y_center": y_center,
                "width": width,
                "height": height,
                "x0": x0,  
                "y0": y0,
                "x1": x1,
                "y1": y1
            }
        })

# 이미지 저장
output_path = os.path.join(HOME, 'test_data', 'output_flow.png')
cv2.imwrite(output_path, frame)
print(f"Image saved to: {output_path}")

# JSON 파일 저장
json_path = os.path.join(HOME, 'test_data', 'detection_results.json')
with open(json_path, 'w') as f:
    json.dump(detection_results, f, indent=4)
print(f"Results saved to: {json_path}")