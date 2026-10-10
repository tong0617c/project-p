# GitHub Pages 部署与公开检查

状态：GitHub Pages 已正式发布。网站：https://tong0617c.github.io/project-p/ 。部署运行 38017949693 的 build 与 deploy 均成功，公网浏览器验收已通过。

## 公开检查结果

- Git：master 已连接 origin（https://github.com/tong0617c/project-p.git），首次推送已成功。使用 Git Credential Manager 登录及 GitHub 隐私邮箱提交。
- 扫描源码、配置、测试与 public：未发现 API Key、私钥、访问令牌、真实个人存档或私人聊天记录。浏览器个人数据未读取、未导出。
- README/测试中原有的本机用户路径已移除，测试改用项目内 Playwright。
- 测试 JSON 为编写测试时使用的合成数据；不是个人存档。
- PNG/SVG 图标来自项目生成脚本，房间与角色为代码占位图。没有发现官方游戏图片、音乐或外部下载素材。
- 现有 Penny/潘妮角色设定、游戏文本及非官方说明会出现在公开代码和网页中。发布前需由项目所有者明确确认按当前内容公开；本检查不等于第三方权利许可。
- 测试截图、个人存档/备份、环境文件、密钥文件、机器配置、node_modules、dist 已加入忽略规则。保留本地文件，不删除存档。
- GitHub 仓库将包含源码、测试、工作流、文档、依赖锁文件及 public 中四个生成图标。Pages 仅发布 dist；不发布源码、测试或 README。

新增任何素材、环境文件或存档后需重新检查。忽略规则并不能识别任意名称的私人文件，请在推送前检查暂存清单。

## 配置

- Vite base：本地默认为 `/`，Actions 根据 `GITHUB_REPOSITORY` 自动选择 `/<repo>/`；`<owner>.github.io` 仓库使用 `/`。
- 支持显式 `PAGES_BASE_PATH` 覆盖，要求首尾斜线。仅自定义域名等需要覆盖时设置仓库同名变量；普通项目仓库留空。
- Apple 图标使用 Vite 的 `%BASE_URL%`；Phaser 的后续素材路径通过 `assetUrl()` 适配 base。
- manifest 的 id、start_url、scope 以及 Service Worker 范围均绑定 base，离线导航回到该路径的 index.html。
- `.github/workflows/pages.yml` 使用固定引用的官方 Pages Actions。默认分支（main 或 master）推送及手动触发后执行锁文件安装、类型检查、单元测试、构建、浏览器验收，再上传 dist artifact。
- 部署 job 额外要求仓库变量 `PAGES_PUBLISH_APPROVED` 为 `true`。首次公开确认前不要设置。这个开关只控制网站发布，不能阻止已经授权的 git push 将源码上传到仓库。
- 工作流使用 GitHub 内置短期令牌，项目不需要 API Key、个人访问令牌或新增部署密钥。

## 等待确认后才能执行的步骤

1. 提供 GitHub 用户名、目标仓库名，并明确确认允许上传当前源码、生成图标和包含 Penny/潘妮设定的内容，以及公开网站。
2. 登录 GitHub，创建指定的**空仓库**；可在确认后选择 Public，不勾选初始化 README、gitignore 或许可证。若希望使用 GitHub 的隐私邮箱，在 Settings → Emails 查看自己的 noreply 邮箱，不要将令牌发到聊天或写进源码。
3. 在仓库 Settings → Pages → Build and deployment 中将 Source 设为 **GitHub Actions**。
4. 在 Settings → Secrets and variables → Actions → Variables 添加 `PAGES_PUBLISH_APPROVED` = `true`。不需要添加 Secrets。
5. 确认后连接远端并审查将提交的文件。以下为操作模板，用户名和仓库名必须替换为实际值，不能原样执行：

```powershell
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git add .github .gitignore README.md DEPLOYMENT.md index.html package.json pnpm-lock.yaml pnpm-workspace.yaml public scripts src tests tsconfig.json vite.config.ts
git diff --cached --name-only
# 先核对清单，并确认 Git 提交身份符合你的公开隐私偏好。
git commit -m "Prepare Project P Mobile 0.2 for GitHub Pages"
git push -u origin master
```

若 Git 提示身份未配置，先用 `git config user.name` 和 `git config user.email` 设置本仓库的公开身份。HTTPS 推送需要在 Git Credential Manager 的浏览器窗口完成 GitHub 登录，或使用 GitHub Desktop 添加现有仓库并登录。不要在终端命令、仓库 URL 或聊天里填写访问令牌。

6. 在 Actions 查看 `Validate and deploy GitHub Pages`。成功后使用 deployment 的 `page_url` 或 Settings → Pages 显示的地址作为准确网站 URL。未得到这个结果前不能宣称上线成功。
7. 如 deploy 显示 skipped，检查批准变量；如果 Pages 未启用，检查 Source；如果 Actions 被组织策略限制，管理员需允许工作流使用的官方 Actions。失败时修复后重跑，不需要强制推送或删除存档。

正式网址：https://tong0617c.github.io/project-p/ 。已验证 HTTPS 返回 200、图标与 manifest、Service Worker 作用域、两段剧情、完整浏览器重启后存档保留及断网加载 React/Phaser。

## 本地验收

```powershell
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm run test:pages-base
$env:PAGES_BASE_PATH='/project-p-mobile/'
pnpm build
# 首次安装测试浏览器：pnpm exec playwright install chromium
# 如使用本机 Edge：$env:BROWSER_CHANNEL='msedge'
pnpm run test:pages
```

`test:pages` 自行启动严格子路径的临时静态服务及隔离浏览器，不读取日常浏览器资料。测试：manifest、图标、Service Worker scope、无越界资源请求、两段剧情、完整浏览器重启存档、离线 React/Phaser、发布产物文件类型。

本次实际通过：TypeScript、18项游戏单元测试、3项base配置测试、子路径生产构建、上述浏览器验收。构建仍有 Phaser 大块体积提示（约1.50MB，gzip约346KB），未超出PWA预缓存上限。

尚未验证：iPhone Safari/主屏幕真机、真实触摸长按与后台恢复。云端 Actions 和正式网站验收已通过；公网浏览器测试使用隔离的 Edge 手机视口，不读取个人存档。

## 存档与 iPhone 安装

游戏存档格式及键保持不变，v1兼容读取与v2写入逻辑未修改。localhost 与 GitHub Pages 不同源，本机旧进度不会自动出现在线上：先在旧版设置导出，再在正式网站设置中主动选择并导入；不要将存档加入仓库。不同设备之间也不自动同步。同一 GitHub 用户名下的 Pages 项目共享 origin，本游戏仍使用原有存档键，不建议在同一域名并行放置多个独立副本。

正式网站上线后：在 iPhone Safari 打开确认后的 HTTPS URL → 分享 → 添加到主屏幕 → 如显示“作为网页 App 打开”则开启 → 添加。先联网打开一次、进入小屋，待资源缓存后再验证飞行模式可用。应在主屏幕版本中确认存档；如进度未出现，使用导入备份迁移，不假设浏览器与独立网页 App 总是共享存储。

参考：[GitHub Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Vite GitHub Pages 部署](https://vite.dev/guide/static-deploy.html#github-pages)、[Apple iPhone 网页 App](https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios)。

补充验收：根路径 / 的生产构建及同一套完整浏览器/离线/重启测试也通过；pnpm install --frozen-lockfile 已实际成功。工作流已在 GitHub 成功执行并完成发布。


