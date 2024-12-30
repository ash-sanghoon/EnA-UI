// pages/api/files/upload.js
import { createRouter } from 'next-connect';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

// Multer 설정
const upload = multer({
  storage: multer.memoryStorage(),
});

const apiRoute = createRouter({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

// Multer 미들웨어 추가 
apiRoute.use(upload.array('uploadFiles'));

apiRoute.post(async (req, res) => {
  try {
    // FormData 생성
    const formData = new FormData();
    
    // 파일 추가
    req.files.forEach((file) => {
      formData.append('uploadFiles', 
        file.buffer, 
        {
          filename: file.originalname,
          contentType: file.mimetype
        }
      );
    });

    // 추가 폼 필드가 있다면 추가
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        formData.append(key, req.body[key]);
      });
    }

    const response = await axios.post('http://localhost:8081/api/files/upload', formData, {
      // Spring Boot로 요청 전송
  //  const response = await axios.post('http://192.168.0.89:8081/api/files/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        // 필요하다면 추가 헤더 설정
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    // Spring Boot 응답 그대로 전달
    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('Upload error:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: '업로드 중 오류 발생' });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle FormData
  },
};

export default apiRoute.handler();