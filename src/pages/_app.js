// pages/_app.js
import App from '../App';
import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // 'wheel' 이벤트 리스너 추가
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();  // Ctrl + 휠 확대/축소 방지
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('wheel', handleWheel, { passive: false });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <App>
        <Component {...pageProps} />
      </App>
    </>
  );
}
