/** @type {import('next').NextConfig} */
const nextConfig = {
  // للتأكد من عمل PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
  
  // لضمان عمل الروابط بشكل صحيح
  trailingSlash: false,
  
  // للتأكد من تصدير الملفات الثابتة
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;