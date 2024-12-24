// pages/api/files/[...slug].js
export default async function handler(req, res) {
  const { slug } = req.query;
  const pathString = Array.isArray(slug) ? slug.join('/') : slug;

  try {
    // Spring Boot API 엔드포인트 호출
    const response = await fetch(`http://localhost:8081/api/files/${pathString}`, {
//      const response = await fetch(`http://192.168.0.89:8080/api/files/${pathString}`, {
      method: req.method,
      headers: req.method !== 'GET' 
        ? { 'Content-Type': req.headers['content-type'] || 'application/json' }
        : {},
      body: req.method !== 'GET' ? req.body : undefined
    });

    // 모든 헤더 복사
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // 응답 본문을 그대로 전달
    const buffer = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(buffer));

  } catch (error) {
    console.error('API 호출 중 오류:', error);
    res.status(500).json({ error: '서버 요청 중 오류 발생' });
  }
}

// 중요: 파일 업로드를 위해 body parser 비활성화
export const config = {
  api: {
    bodyParser: false
  }
};