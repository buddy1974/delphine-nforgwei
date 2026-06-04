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
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
