import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
