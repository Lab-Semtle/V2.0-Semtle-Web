import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kclorpqcnpisnlgdckju.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // 캐시 TTL 설정
    minimumCacheTTL: 60,
    // SVG 허용 (필요한 경우)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // 이미지 형식 최적화
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
