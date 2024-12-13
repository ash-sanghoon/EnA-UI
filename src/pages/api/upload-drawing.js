import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// API route config to disable body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DRAWINGS_DIR = path.join(DATA_DIR, 'drawings');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: path.join(DATA_DIR, 'temp'),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // Parse the form data
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const projectId = fields.projectId?.[0] || 'default';
    // Get the first file from the files object
    const uploadedFile = Object.values(files)[0]?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create project directories if they don't exist
    const projectDir = path.join(DRAWINGS_DIR, projectId);
    const originalDir = path.join(projectDir, 'original');
    
    [projectDir, originalDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Move file to the project's original directory
    const targetPath = path.join(originalDir, uploadedFile.originalFilename);
    await fs.promises.rename(uploadedFile.filepath, targetPath);

    res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        name: uploadedFile.originalFilename,
        path: targetPath,
        size: uploadedFile.size,
        type: uploadedFile.mimetype,
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
}