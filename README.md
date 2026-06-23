# UI/UX Portfolio

原创双语 UI/UX 作品集，使用 Next.js、Three.js、GSAP 和 Sanity 构建。

## 本地运行

```powershell
$env:Path = "$PWD\.tools\node;$env:Path"
npm install
npm run dev
```

打开 `http://localhost:3000`。Sanity 配置完成后，后台位于 `/studio`。

## Sanity

1. 在 Sanity 创建项目和 `production` dataset。
2. 将项目 ID 写入 `.env.local` 的 `NEXT_PUBLIC_SANITY_PROJECT_ID`。
3. 在 Sanity 项目设置中把本地地址和正式域名加入 CORS Origins。
4. 进入 `/studio` 创建 `Site settings`、`About` 和作品项目。

未配置 Sanity 时，网站自动使用 `content/demo.ts` 中的示例数据。

## 发布

将仓库推送到 GitHub，在 Vercel 导入仓库并复制 `.env.example` 中的环境变量。正式域名绑定后，把 `NEXT_PUBLIC_SITE_URL` 改为正式地址。

