import { getStore } from "@edgeone/pages-blob";

export const PORTFOLIO_STORE_NAME = "portfolio-cms";
export const PORTFOLIO_CONTENT_KEY = "content/site-content.json";

export function getPortfolioStore() {
  return getStore(PORTFOLIO_STORE_NAME);
}
