/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Réactiver l'optimisation d'images
    unoptimized: false,
    
    // Formats modernes supportés
    formats: ['image/webp', 'image/avif'],
    
    // Tailles d'images générées automatiquement
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Domaines autorisés pour les images externes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https', 
        hostname: 'xrvafxvowvoxpxcefktx.supabase.co',
      }
    ],
    
    // Cache images pendant 7 jours
    minimumCacheTTL: 604800,
    
    // Qualité par défaut (80% pour un bon compromis taille/qualité)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  
  // Configuration expérimentale pour de meilleures performances
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query']
  }
};

module.exports = nextConfig;
