require('dns').setServers(['8.8.8.8', '1.1.1.1']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8000/api/auth/:path*',
      },
      {
        source: '/api/students/:path*',
        destination: 'http://localhost:8000/api/students/:path*',
      },
      {
        source: '/api/teachers/:path*',
        destination: 'http://localhost:8000/api/teachers/:path*',
      },
      {
        source: '/api/classes/:path*',
        destination: 'http://localhost:8000/api/classes/:path*',
      },
      {
        source: '/api/subjects/:path*',
        destination: 'http://localhost:8000/api/subjects/:path*',
      },
      {
        source: '/api/academics/:path*',
        destination: 'http://localhost:8000/api/academics/:path*',
      },
      {
        source: '/api/fees/:path*',
        destination: 'http://localhost:8000/api/fees/:path*',
      },
      {
        source: '/api/results/:path*',
        destination: 'http://localhost:8000/api/results/:path*',
      },
      {
        source: '/api/news/:path*',
        destination: 'http://localhost:8000/api/news/:path*',
      },
      {
        source: '/api/dashboard/:path*',
        destination: 'http://localhost:8000/api/dashboard/:path*',
      },
      {
        source: '/api/chat/:path*',
        destination: 'http://localhost:8000/api/chat/:path*',
      },
      {
        source: '/api/admissions/:path*',
        destination: 'http://localhost:8000/api/admissions/:path*',
      },
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:8000/api/users/:path*',
      },
      {
        source: '/api/memos/:path*',
        destination: 'http://localhost:8000/api/memos/:path*',
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
