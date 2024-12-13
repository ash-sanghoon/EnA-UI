// import formidable from 'formidable';
// import fs from 'fs';
// import path from 'path';
// import { spawn } from 'child_process';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const DATA_DIR = path.join(process.cwd(), 'data');
// const DRAWINGS_DIR = path.join(DATA_DIR, 'drawings');
// const TEMP_DIR = path.join(DATA_DIR, 'temp');

// // Ensure all required directories exist
// [DATA_DIR, DRAWINGS_DIR, TEMP_DIR].forEach(dir => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// });

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     const form = formidable({
//       uploadDir: TEMP_DIR,
//       keepExtensions: true,
//       multiples: true,
//       maxFileSize: 10 * 1024 * 1024, // 10MB
//     });

//     // Parse the form data
//     const [fields, files] = await new Promise((resolve, reject) => {
//       form.parse(req, (err, fields, files) => {
//         if (err) reject(err);
//         resolve([fields, files]);
//       });
//     });

//     const { country, company, projectName, standard } = fields;
    
//     // Create project ID (you might want to make this more sophisticated)
//     const projectId = `${company}-${projectName}`.toLowerCase().replace(/\s+/g, '-');
    
//     // Create project directories
//     const projectDir = path.join(DRAWINGS_DIR, projectId);
//     const originalDir = path.join(projectDir, 'original');
//     const processedDir = path.join(projectDir, 'processed');
    
//     [projectDir, originalDir, processedDir].forEach(dir => {
//       if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//       }
//     });

//     // Save project metadata
//     const metadata = {
//       id: projectId,
//       country,
//       company,
//       projectName,
//       standard,
//       createdAt: new Date().toISOString(),
//     };
    
//     fs.writeFileSync(
//       path.join(projectDir, 'metadata.json'),
//       JSON.stringify(metadata, null, 2)
//     );

//     // Handle uploaded files
//     const uploadedFiles = files.files ? (Array.isArray(files.files) ? files.files : [files.files]) : [];
//     const processedFiles = [];

//     for (const file of uploadedFiles) {
//       if (!file) continue;
      
//       const targetPath = path.join(originalDir, file.originalFilename);
      
//       // Move file from temp to project directory
//       try {
//         await fs.promises.rename(file.filepath, targetPath);
//       } catch (error) {
//         console.error(`Error moving file ${file.originalFilename}:`, error);
//         continue;
//       }

//       processedFiles.push({
//         name: file.originalFilename,
//         path: targetPath,
//       });

//       // Start object detection process
//       const pythonProcess = spawn('python', [
//         path.join(process.cwd(), 'backend', 'module', 'object_detection.py'),
//         '--input', targetPath,
//         '--output', processedDir,
//         '--project', projectId
//       ]);

//       pythonProcess.stderr.on('data', (data) => {
//         console.error(`Object detection error: ${data}`);
//       });

//       pythonProcess.stdout.on('data', (data) => {
//         console.log(`Object detection output: ${data}`);
//       });
//     }

//     res.status(200).json({
//       message: 'Project created successfully',
//       project: {
//         ...metadata,
//         files: processedFiles,
//       }
//     });
//   } catch (error) {
//     console.error('Error creating project:', error);
//     res.status(500).json({ message: 'Error creating project', error: error.message });
//   }
// }

// pages/api/create-project.js
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid'; // uuid 패키지 추가 필요

export const config = {
  api: {
    bodyParser: false,
  },
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DRAWINGS_DIR = path.join(DATA_DIR, 'drawings');
const TEMP_DIR = path.join(DATA_DIR, 'temp');

// 필요한 디렉토리 생성
[DATA_DIR, DRAWINGS_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: TEMP_DIR,
      keepExtensions: true,
      multiples: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // 폼 데이터 파싱
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const { country, company, projectName, standard } = fields;
    
    // 고유한 프로젝트 ID 생성
    const projectId = uuidv4();
    
    // 프로젝트 디렉토리 생성
    const projectDir = path.join(DRAWINGS_DIR, projectId);
    const originalDir = path.join(projectDir, 'original');
    const processedDir = path.join(projectDir, 'processed');
    
    [projectDir, originalDir, processedDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // 프로젝트 메타데이터 저장
    const metadata = {
      id: projectId,
      country: Array.isArray(country) ? country[0] : country,
      company: Array.isArray(company) ? company[0] : company,
      name: Array.isArray(projectName) ? projectName[0] : projectName,
      standard: Array.isArray(standard) ? standard[0] : standard,
      createdAt: new Date().toISOString(),
      status: 'active',
      progress: 0
    };
    
    fs.writeFileSync(
      path.join(projectDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // 업로드된 파일 처리
    const uploadedFiles = files.files ? (Array.isArray(files.files) ? files.files : [files.files]) : [];
    const processedFiles = [];

    for (const file of uploadedFiles) {
      if (!file) continue;
      
      const targetPath = path.join(originalDir, file.originalFilename);
      
      try {
        await fs.promises.rename(file.filepath, targetPath);
      } catch (error) {
        console.error(`Error moving file ${file.originalFilename}:`, error);
        continue;
      }

      processedFiles.push({
        name: file.originalFilename,
        path: targetPath,
      });

      // 객체 인식 프로세스 시작
      const pythonProcess = spawn('python', [
        path.join(process.cwd(), 'backend', 'module', 'object_detection.py'),
        '--input', targetPath,
        '--output', processedDir,
        '--project', projectId
      ]);

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Object detection error: ${data}`);
      });

      pythonProcess.stdout.on('data', (data) => {
        console.log(`Object detection output: ${data}`);
      });
    }

    res.status(200).json({
      message: 'Project created successfully',
      project: {
        ...metadata,
        files: processedFiles,
      }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
}