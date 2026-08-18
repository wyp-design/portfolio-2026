import {
  commitBuffer,
  errorResponse,
  isAdminRequest,
  jsonResponse,
  unauthorized,
} from "../../_lib/admin-cms.js";

export async function onRequestPost(context) {
  if (!isAdminRequest(context)) return unauthorized();
  try {
    const body = await context.request.json();
    if (!body || !Array.isArray(body.projects) || typeof body.site !== "object") {
      return jsonResponse({ message: "作品集内容格式不正确。" }, 400);
    }
    const content = { ...body, updatedAt: new Date().toISOString() };
    const encoded = new TextEncoder().encode(`${JSON.stringify(content, null, 2)}\n`);
    await commitBuffer(context.env, "content/portfolio-content.json", encoded, "Update portfolio content from admin");
    return jsonResponse({
      ...content,
      publishMode: "github",
      message: "已提交到 GitHub，等待 EdgeOne 自动重新部署后生效。",
    });
  } catch (error) {
    return errorResponse("保存到 GitHub 失败", error);
  }
}

