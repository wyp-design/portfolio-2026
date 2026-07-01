"use client";

import { useEffect, useMemo, useState, type ImgHTMLAttributes } from "react";
import { useAssetPath } from "@/lib/use-asset-path";

const VERCEL_ASSET_ORIGIN = "https://project-sdy58.vercel.app";
const GITHUB_CDN_ORIGIN = "https://cdn.jsdelivr.net/gh/wyp-design/portfolio-2026@main/public";

type ResilientImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
};

export function ResilientImage({ src, alt, onError, ...props }: ResilientImageProps) {
  const resolveAssetPath = useAssetPath();
  const candidates = useMemo(() => {
    const sources = [resolveAssetPath(src)];
    if (src.startsWith("/uploads/")) {
      sources.push(`${VERCEL_ASSET_ORIGIN}${src}`, `${GITHUB_CDN_ORIGIN}${src}`);
    }
    return [...new Set(sources)];
  }, [resolveAssetPath, src]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => setSourceIndex(0), [src, candidates]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={candidates[Math.min(sourceIndex, candidates.length - 1)]}
      alt={alt}
      onError={(event) => {
        if (sourceIndex < candidates.length - 1) {
          setSourceIndex((current) => current + 1);
          return;
        }
        onError?.(event);
      }}
    />
  );
}
