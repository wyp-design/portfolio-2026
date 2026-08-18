import { isAdminRequest, jsonResponse, unauthorized } from "../../_lib/admin-cms.js";

export function onRequestGet(context) {
  if (!isAdminRequest(context)) return unauthorized();
  return jsonResponse({ ok: true, runtime: "edgeone-cloud-function" });
}

