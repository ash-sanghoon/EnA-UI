/** @type {import('next').NextConfig} */
const nextConfig = {  
   // webpack 추가 설정
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  reactStrictMode: false,
}

module.exports = nextConfig
