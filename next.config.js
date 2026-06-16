/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dhmiarfgdyyuuntluzyp.supabase.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Ukuran device yang paling sering dipakai mobile
    deviceSizes: [375, 430, 768, 1280],
    imageSizes: [64, 128, 256],
    // Minimumkan TTL cache gambar di server (Vercel)
    minimumCacheTTL: 86400,
  },

  // Source maps off di production
  productionBrowserSourceMaps: false,

  // Compress
  compress: true,

  // Headers cache untuk static assets
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Keamanan dasar
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        // Cache API foto lebih lama di edge
        source: "/api/photo",
        headers: [
          { key: "Cache-Control", value: "private, max-age=86400" },
        ],
      },
    ];
  },

  experimental: {
    // Tree-shake icon libraries — besar sekali tanpa ini
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-avatar",
      "@radix-ui/react-badge",
      "sonner",
    ],
    // Optimasi server rendering
    serverComponentsExternalPackages: [],
  },

  // Lebih cepat restart dev
  poweredByHeader: false,
};

module.exports = nextConfig;
