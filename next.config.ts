import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Server actions cap request bodies at 1 MB by default, which silently
      // failed any lesson attachment or cover photo above that. Vercel refuses
      // function payloads over 4.5 MB regardless, so this stays under that and
      // uploads are validated to 3 MB — leaving room for multipart overhead.
      bodySizeLimit: "4mb",
    },
  },
  async redirects() {
    // Tracks became courses in v2. Anything already linked or bookmarked —
    // a lesson URL in a chat, the student's open tab — keeps working.
    // Deliberately temporary rather than permanent: a 308 gets cached hard by
    // browsers, and there's no cost to keeping these cheap and reversible.
    return [
      { source: "/tracks/:path*", destination: "/courses/:path*", permanent: false },
      { source: "/tutor/tracks/:path*", destination: "/tutor/courses/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
