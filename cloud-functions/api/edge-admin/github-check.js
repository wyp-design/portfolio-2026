import {
  checkGithub,
  errorResponse,
  isAdminRequest,
  jsonResponse,
  unauthorized,
} from "../../_lib/admin-cms.js";

export async function onRequestGet(context) {
  if (!isAdminRequest(context)) return unauthorized();
  try {
    const result = await checkGithub(context.env);
    return jsonResponse({
      ok: true,
      message: `GitHub 已连接：${result.repository} / ${result.branch}`,
      ...result,
    });
  } catch (error) {
    return errorResponse("GitHub 检测失败", error);
  }
}

