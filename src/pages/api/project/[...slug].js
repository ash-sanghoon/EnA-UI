// pages/api/project/[...slug].js
export default async function handler(req, res) {
    const { slug } = req.query;
    const pathString = Array.isArray(slug) ? slug.join('/') : slug;
  
    try {
      // 동적으로 Spring Boot API 엔드포인트 호출
      const response = await fetch(`http://localhost:8080/api/project/${pathString}`, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
      });
  
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('API 호출 중 오류:', error);
      res.status(500).json({ error: '서버 요청 중 오류 발생' });
    }
  }