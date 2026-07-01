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

本地接口调试时，需在微信开发者工具中打开：

```text
详情 -> 本地设置 -> 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
```

## 接口依赖

开发环境默认请求：

```text
http://127.0.0.1:3001
```

当前已接入：

- `GET /api/parent-run/events`
- `POST /api/parent-run/events/:id/guest-signup`
- `POST /api/shengsheng-skill/chat`

活动动态和读书会仍使用本地 mock，待后端统一数据源完成后继续接入。

## 仓库边界

本仓库只维护微信小程序工程。后端、Web 管理端和 OpenSpec 规划位于主仓库：

```text
mulinguo97-oss/shengsheng
```
