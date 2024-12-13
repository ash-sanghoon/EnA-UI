import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DRAWINGS_DIR = path.join(DATA_DIR, 'drawings');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DRAWINGS_DIR)) {
  fs.mkdirSync(DRAWINGS_DIR, { recursive: true });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { detections, projectId = 'default' } = req.body;
    
    // Create project directories if they don't exist
    const projectDir = path.join(DRAWINGS_DIR, projectId);
    const originalDir = path.join(projectDir, 'original');
    const processedDir = path.join(projectDir, 'processed');
    
    [projectDir, originalDir, processedDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Save detection results
    const detectionsPath = path.join(processedDir, 'detection_results.json');
    const currentData = fs.existsSync(detectionsPath) 
      ? JSON.parse(fs.readFileSync(detectionsPath, 'utf8'))
      : { detections: [], class_colors: {} };
    
    // Update detections while preserving class colors
    currentData.detections = detections;
    
    // Write back to file
    fs.writeFileSync(detectionsPath, JSON.stringify(currentData, null, 2));
    
    res.status(200).json({ 
      message: 'Detections saved successfully',
      path: detectionsPath
    });
  } catch (error) {
    console.error('Error saving detections:', error);
    res.status(500).json({ message: 'Error saving detections', error: error.message });
  }
}