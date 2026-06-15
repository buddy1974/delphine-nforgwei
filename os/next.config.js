/** @type {import('next').NextConfig} */
const nextConfig = {
  // The OS is served at delphine-nforgwei.com/os (Owner decision, ADR-005).
  basePath: "/os",
  reactStrictMode: true,
  poweredByHeader: false,

  // Expose basePath to client so iframe srcs can be prefixed correctly.
  // Without this, iframe src="/pages/..." resolves without the /os prefix → 404.
  env: {
    NEXT_PUBLIC_BASE_PATH: "/os",
  },

  async headers() {
    return [
      {
        source: "/api/preview/delphine",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          // SAMEORIGIN (not DENY): the page editor embeds the draft preview
          // in a same-origin iframe. DENY would block it. SAMEORIGIN allows
          // same-origin frames while still preventing any external site from
          // embedding the OS in their pages.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
