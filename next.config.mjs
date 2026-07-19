/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Client SSR must never pull jspdf.node (fflate Worker → Turbopack "Can't resolve <dynamic>")
  turbopack: {
    resolveAlias: {
      jspdf: "jspdf/dist/jspdf.es.min.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      jspdf: "jspdf/dist/jspdf.es.min.js",
    };
    return config;
  },
}

export default nextConfig
