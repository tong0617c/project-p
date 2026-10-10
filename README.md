# Project P Mobile 0.2 — Living Cottage

在 0.1 上增量加入 Phaser 3 单间小屋。React + TypeScript + Vite + PWA 保留；手账、信箱、消息、纪念册、工坊、展示柜和设置沿用原有共享状态。临时像素角色与家具为程序生成占位素材，个人非商业原型，非《星露谷物语》官方作品。

## 运行

需要 Node.js 22+ 与 pnpm：

```sh
pnpm install
pnpm dev
pnpm build
pnpm test
```

也可使用 `node node_modules/vite/bin/vite.js` 启动开发服务器。

使用和 0.1 相同的域名、协议与端口才能读取原有浏览器存档。开发默认 5173，生产预览默认 4173，两者存储彼此独立。构建输出在 `dist/`，请通过 HTTP 服务打开。iPhone PWA 安装需要 HTTPS；localhost 例外只适用于运行浏览器的本机。

## 验收路线

进入小屋 → 点击/长按方向键 → 点击写字桌，角色绕过障碍走到站位后进入原有工坊 → 回到小屋 → 点击潘妮（或菜单内“潘妮”）自动走近 → 对话 → 选择花色 → 潘妮走向窗边整理花束 → 确认留下回忆 → 窗边永久出现对应颜色的花 → 关闭、重启后查看。

- 点击地板自动寻路。四方向网格移动，不允许斜向穿角或穿过家具。
- 手动输入立即取消路径和待执行家具交互；轻点走一步，长按连续走。键盘支持方向键/WASD，空格互动。
- 玩家与潘妮互相占位。潘妮会待机、阅读和在房内短距离走动；走近互动时会等待玩家。
- 对话与演出期间关闭玩家移动；对话时 NPC 也停止，移动命令只在剧情移动阶段执行。
- 小屋菜单、页面切换、失焦或切到后台会暂停/销毁场景输入并清除按住状态。
- 方向键位于画布下方，不遮挡家具；剧情时改为优先显示对话和选项。

## 存档兼容与保护

原键 `project-p.save.v1` 不修改、不删除。0.2 优先读 `project-p.save.v2`，不存在时读取 v1 并在内存补充小屋默认值。首次成功操作才写入 v2；原纪念卡、稳定 ID、回复、事件和设置保留。可继续导入 0.1 JSON；v2 JSON 不能由旧版应用读取。

v2 新增 `cottage.player`、`cottage.penny`、`cottage.story` 和 `cottage.furniture`。坐标为安全格点；每完成一步即同步保存整份快照。退出时最多舍弃正在播放的部分步行动画，不依赖 unload 才写存档。单次 localStorage.setItem 原子替换，写入成功才更新共享状态。读存档失败不静默重置或回退覆盖，保留原始数据供导出。写入失败会提示并停止移动。

剧情使用稳定事件 `event.cottage.window-flowers`，按 invite → choice → walk → arrange → thanks → done 记录检查点。奖励事件、完成阶段及家具颜色在同次快照提交，重复互动不会再次领取。中途退出可继续演出。导入会校验可行走位置、角色不重叠、家具与剧情一致性，预览后明确确认才替换当前存档。无删除重要卡片的普通操作。

localStorage 仍可能被浏览器/系统主动清理，请保留导出备份。本版面向单窗口，不处理多标签页并发写入冲突。

## 模块与素材替换

- `src/state.ts`：共享 reducer、v1→v2 兼容读取、存档入口。
- `src/cottage/map.ts`：10×11 地图，每格32px；家具占格、可交互站位、四邻接最短路径。
- `src/cottage/model.ts`：小屋 schema 校验、剧情状态转换和演出命令数据。
- `src/cottage/controller.ts`：移动、NPC、碰撞预留、输入锁、剧情移动/动作控制。独立于 Phaser，便于测试和后续扩展。
- `src/cottage/scene.ts`：Phaser 3 Canvas 渲染、触摸命中及角色方向/步行动画。
- `src/cottage/CottageRoom.tsx`：React 生命周期、触摸方向键、菜单和对话，延迟初始化避免 StrictMode 重复 Canvas。
- `src/cottage/assets.ts`：正式素材替换入口。角色 spritesheet 默认每帧24×32，四行依次 down/left/right/up，三列依次 idle/step A/step B。配置 URL 后加载对应纹理，空 URL 使用生成素材；加载失败回退占位图。背景可配置320×352图片，碰撞数据独立保留。

尺寸与缩放参考 [Phaser Scale Manager](https://docs.phaser.io/phaser/concepts/scale-manager)，纹理机制参考 [Phaser Textures](https://docs.phaser.io/phaser/concepts/textures)。Phaser 懒加载，不阻塞原手账初始包；生产场景块约1.50MB（gzip约346KB），构建会提示大块体积，但在 PWA 预缓存上限内。

## 实际测试

- TypeScript 检查、Vite 生产构建通过，PWA 生成13项预缓存资源。
- Vitest 18项通过：含原6项，新增迁移、旧键保留、损坏拒绝、剧情检查点、一次性奖励、碰撞、寻路、输入取消/锁定、NPC及保存失败。
- `node tests/e2e.mjs`：先启动5173开发服务器；原纪念卡剧情、双入口信件、刷新、导入导出和布局回归通过。
- `node tests/living-e2e.mjs`：Edge 390×844触摸模拟通过；轻点移动、手动取消、菜单/对话锁、Canvas家具寻路、旧纪念卡保持、中途刷新继续、永久花束、防重复奖励及320/390/1024宽度检查通过。未捕获页面脚本错误。
- `node tests/pwa.mjs`：先启动4173生产预览；完成两段剧情，完全关闭再启动隔离的浏览器，完整快照保持；断网刷新后可查看原纪念卡、回信及带永久花束的 Phaser 小屋。
- 手机布局截图保留于 `tests/living-room-mobile.png` 与 `tests/living-story-mobile.png`，已人工检查。

尚未验证：iPhone 真机 Safari/WebKit、真实长按/滑出按钮/多点触摸、横竖屏动态切换、主屏幕安装与后台恢复、音效听感、设备性能和系统回收存储。Edge 的触摸模拟不能替代真机验收。

范围不包含 AI 聊天、秘密计划、多房间、复杂装修或云同步。没有设备照片、通讯录或位置访问。

## GitHub Pages

部署配置、公开检查、授权步骤与 iPhone 安装说明见 [DEPLOYMENT.md](DEPLOYMENT.md)。已推送至 tong0617c/project-p；云端测试通过，首次正式发布进行中。浏览器测试使用项目内 Playwright；首次可运行 pnpm exec playwright install chromium，或设置 BROWSER_CHANNEL=msedge 使用本机 Edge。

