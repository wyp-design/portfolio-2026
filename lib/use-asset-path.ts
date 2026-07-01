"use client";

import { useCallback, useEffect, useState } from "react";
import { assetPath } from "./paths";

const EDGEONE_PREVIEW_KEY = "portfolio-edgeone-preview-query";

export function useAssetPath() {
  const [previewQuery, setPreviewQuery] = useState("");

  useEffect(() => {
    try {
      const current = new URLSearchParams(window.location.search);
      const token = current.get("eo_token");
      const time = current.get("eo_time");

      if (token && time) {
        const query = new URLSearchParams({ eo_token: token, eo_time: time }).toString();
        window.sessionStorage.setItem(EDGEONE_PREVIEW_KEY, query);
        setPreviewQuery(query);
        return;
      }

      setPreviewQuery(window.sessionStorage.getItem(EDGEONE_PREVIEW_KEY) || "");
    } catch {
      setPreviewQuery("");
    }
  }, []);

  return useCallback(
    (path: string) => {
      const resolved = assetPath(path);
      if (!previewQuery || /^(https?:|mailto:|tel:|#)/.test(resolved)) return resolved;

      const hashIndex = resolved.indexOf("#");
      const pathname = hashIndex >= 0 ? resolved.slice(0, hashIndex) : resolved;
      const hash = hashIndex >= 0 ? resolved.slice(hashIndex) : "";
      return `${pathname}${pathname.includes("?") ? "&" : "?"}${previewQuery}${hash}`;
    },
    [previewQuery],
  );
}
