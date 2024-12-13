import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DRAWINGS_DIR = path.join(DATA_DIR, 'drawings');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const projects = [];
      const projectDirs = fs.readdirSync(DRAWINGS_DIR);

      for (const projectDir of projectDirs) {
        const metadataPath = path.join(DRAWINGS_DIR, projectDir, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          projects.push({
            ...metadata,
            lastUpdated: fs.statSync(metadataPath).mtime.toISOString().split('T')[0]
          });
        }
      }

      res.status(200).json(projects);
    } catch (error) {
      console.error('Error reading projects:', error);
      res.status(500).json({ message: 'Error reading projects' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
