import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { detections } = req.body;
    
    // Update the detection results JSON file
    const jsonPath = path.join(process.cwd(), 'test_data', 'detection_results.json');
    const currentData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Update detections while preserving class colors
    currentData.detections = detections;
    
    // Write back to file
    fs.writeFileSync(jsonPath, JSON.stringify(currentData, null, 2));
    
    res.status(200).json({ message: 'Detections saved successfully' });
  } catch (error) {
    console.error('Error saving detections:', error);
    res.status(500).json({ message: 'Error saving detections', error: error.message });
  }
}