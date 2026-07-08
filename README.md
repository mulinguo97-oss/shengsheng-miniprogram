# 生生微信小程序

生生微信小程序一期工程，使用原生微信小程序 + TypeScript + TDesign Miniprogram。

## 本地开发

```powershell
pnpm install
pnpm run typecheck
```

在微信开发者工具中导入本目录，然后执行：

```text
工具 -> 构建 npm
```

如果开发者工具提示 `NPM packages not found`，说明工具没有在小程序根目录识别到需要构建的 npm 包。本项目已在 `project.config.json` 中开启 `packNpmManually`，并指定从根目录 `package.json` 构建到根目录 `miniprogram_npm`；确认已执行 `pnpm install` 后，重新点击“工具 -> 构建 npm”即可。

注意不要在 `pnpm install` 尚未完成时点击“构建 npm”。微信开发者工具对 pnpm 的 junction/软链接依赖结构识别不稳定；如果仍报错，先关闭开发者工具项目，确认 `node_modules/tdesign-miniprogram/package.json` 存在，再重新打开项目并构建 npm。

默认开发、体验和正式环境都请求线上服务器：

```text
https://shengshengcorp.com
```

如需临时调试本机后端，可在 `config/env.ts` 中把 `useLocalApiInDevelop` 改为 `true`。本地接口调试时，需在微信开发者工具中打开：

```text
详情 -> 本地设置 -> 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
```

## 接口依赖

开发、体验、正式环境默认请求：

```text
https://shengshengcorp.com
```

当前已接入：

- `GET /api/parent-run/events`
- `POST /api/parent-run/events/:id/guest-signup`
- `GET /api/activities`
- `GET /api/book-club/courses`
- `GET /api/profile/me`
- `PUT /api/profile/me`
- `PUT /api/profile/messages/:id/read`
- `POST /api/agents/chat`

`config/env.ts` 中 `develop`、`trial` 和 `release` 均已指向 `https://shengshengcorp.com`。默认不再静默回退 mock，接口失败会展示错误提示，确保小程序和网页共用服务器 PostgreSQL 数据源；`data/mock.ts` 仅保留为手动开启 `enableMockFallbackInDevelop` 时的开发兜底，且内容已按网页线上接口口径同步。

## 仓库边界

本仓库只维护微信小程序工程。后端、Web 管理端和 OpenSpec 规划位于主仓库：

```text
mulinguo97-oss/shengsheng
```
