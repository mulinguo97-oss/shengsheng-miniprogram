# 小程序任务记录

## 2026-07-07 追平网页活动正文模块

- [x] 现象：网页管理端活动正文已升级为模块化 `contentBlocks`，小程序详情页仍主要依赖 `contentHtml` 富文本兜底，遇到图片、列表、提示等模块时展示不够稳定。
- [x] 正确期望：小程序以网页和服务器 API 为主，优先按服务器返回的 `contentBlocks` 原生渲染活动正文，`contentHtml` 仅作为旧数据兜底。
- [x] 修复方式：活动服务层统一规整标题、正文、图片、引用、列表、分割线、提示模块，并将 `/uploads/...` 服务器相对路径补全为服务器地址。
- [x] 验收：`npm.cmd run typecheck` 通过，活动详情页保留旧正文兜底，不影响首页活动列表和既有服务器数据源。

## 2026-07-08 默认头像统一

- [x] 现象：网页端已有默认头像资源引用，小程序个人中心已有 `avatarUrl` 字段但未渲染头像，缺少默认头像展示入口。
- [x] 正确期望：网页和小程序使用同一张绿色默认头像；服务器返回真实用户头像时优先展示真实头像，缺省时展示默认头像。
- [x] 修复方式：网页替换 `src/assets/default-avatar.png`；小程序新增 `assets/default-avatar.png`，并在个人中心通过 `avatarSrc` 统一真实头像与默认头像兜底。
- [x] 验收：`pnpm run build` 与 `npm.cmd run typecheck` 均通过；微信开发者工具个人中心头像展示仍需真机或模拟器视觉确认。

## 2026-07-08 小程序安全边界收紧

- [x] 现象：小程序代码未发现数据库连接串、AppSecret、DeepSeek Key、管理员凭据或私钥，但 `config/env.ts` 仍保留本机 API 地址和开发兜底开关，文档也保留旧的本地联调说明。
- [x] 正确期望：小程序只知道 `https://shengshengcorp.com` API 域名；身份、权限、参数、名额、安全规则、多智能体编排和 PostgreSQL 连接均由服务器后端负责。
- [x] 修复方式：移除小程序本机 API 地址、开发环境切换开关和 mock 兜底开关，`develop`、`trial`、`release` 统一指向线上 API；同步 README 和详细说明文档。
- [x] 验收：敏感关键词扫描未发现源码/配置中存在 `DATABASE_URL`、PostgreSQL 用户名密码、微信 AppSecret、DeepSeek API Key、管理员账号密码、服务器私钥或上传密钥；`pnpm run typecheck` 通过，微信开发者工具真机验证仍需上线前执行。
