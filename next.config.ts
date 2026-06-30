import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const githubPagesRepo = process.env.GITHUB_PAGES_REPO || "portfolio-2026";
const githubPagesBasePath = `/${githubPagesRepo}`;

const nextConfig: NextConfig = {
  compress: true,
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? githubPagesBasePath : undefined,
  assetPrefix: isGithubPages ? `${githubPagesBasePath}/` : undefined,
  trailingSlash: isGithubPages ? true : undefined,
  images: {
    unoptimized: isGithubPages,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? githubPagesBasePath : "",
  },
  ...(isGithubPages ? {} : {
    async headers() {
      return [
        {
          source: "/uploads/:path*",
          headers: [
            { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          ],
        },
        {
          source: "/images/:path*",
          headers: [
            { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;

