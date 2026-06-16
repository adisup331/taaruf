/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimasi gambar
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dhmiarfgdyyuuntluzyp.supabase.co",
      },
    ],
    // Format modern & kecil
    formats: ["image/avif", "image/webp"],
  },
  // Matikan source maps di production (hemat bandwidth)
  productionBrowserSourceMaps: false,
  // Compress response
  compress: true,
  // Experimental: optimasi package imports
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tooltip",
    ],
  },
};

module.exports = nextConfig;
