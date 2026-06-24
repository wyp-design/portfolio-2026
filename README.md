# UI/UX Portfolio

原创双语 UI/UX 作品集网站，使用 Next.js、Three.js、GSAP 构建。

## 本地运行

```powershell
$env:Path = "$PWD\.tools\node;$env:Path"
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 后台管理

后台地址：`/admin`

当前后台采用 GitHub 提交作为内容发布方式：

1. 后台保存作品集内容到 `content/portfolio-content.json`
2. 上传文件保存到 `public/uploads`
3. GitHub 收到提交后触发 EdgeOne Makers 自动重新部署
4. 部署完成后前台内容更新

需要配置环境变量：

```env
ADMIN_PASSWORD=your-admin-password
GITHUB_TOKEN=your-github-token
GITHUB_REPO_OWNER=wyp-design
GITHUB_REPO_NAME=portfolio-2026
GITHUB_BRANCH=main
```

GitHub Token 建议使用 Fine-grained personal access token，只授权当前仓库：

- Repository：`wyp-design/portfolio-2026`
- Contents：Read and write
- Metadata：Read

## 发布

代码推送到 GitHub 后，EdgeOne Makers 会自动构建部署。  
如果后台保存了内容，也会自动提交到 GitHub 并触发下一次部署。
