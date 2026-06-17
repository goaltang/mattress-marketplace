# Restored — 优质二手床垫循环平台

> 透明、卫生、无摩擦的寝具循环体验。发现经过深度紫外真空净化的优质二手大牌床垫，支持 15 天卫生安心审核，楼宇电梯托运直配。

**技术栈**：Next.js 14 (App Router) · TypeScript · Supabase (PostgreSQL + Storage) · Tailwind CSS
**当前阶段**：MVP 已完成，核心功能闭环，生产构建通过（18 路由）

---

## 功能一览

- **落地首页** — Hero / 信任数据 / 流程说明 / 材质网格 / 用户评价 / CTA
- **城市浏览** — 50+ 城市、IP 自动定位（H5 优先 + 高德兜底）、动态路由、SEO
- **搜索与筛选** — 关键词、价格区间滑块、尺寸 / 材质 / 成色多维筛选、排序、骨架屏、空态
- **商品发布** — 完整表单、图片上传（Supabase Storage，兜底 base64）、Server Action 写入
- **商品详情** — 图片画廊、规格参数、联系方式按需获取（防隐私泄露）
- **卖家管理** — 编辑 / 删除 / 上下架 / 一键降价（触发收藏用户通知）
- **收藏管理** — localStorage + Supabase 双端同步
- **消息通知** — 联络申请、降价通知、全部标已读
- **鉴权** — HttpOnly Cookie (device_id) + Supabase RLS 行级安全
- **暗色模式** — class 策略、Header 主题切换、全组件 `dark:` 适配
- **图片优化** — 全量 `next/image` 迁移
- **降级策略** — Supabase ↔ localStorage 三层降级，断网/超时仍可用

## 快速开始

### 1. 环境要求

- Node.js ≥ 18.17
- npm
- 一个 [Supabase](https://supabase.com) 项目（提供数据库与对象存储）
- 高德开放平台 Web 服务 Key（用于 IP 定位与逆地理编码）

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制示例文件并填入真实凭据：

```bash
cp .env.example .env.local
```

然后在 `.env.local` 中填入以下配置（各项说明见 `.env.example`）：

| 变量 | 必填 | 用途 |
|------|:---:|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名密钥（前端可见，配合 RLS） |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase 服务端密钥（绕过 RLS，仅服务端；城市同步/seed 用） |
| `GAODE_IP_KEY` | ✅ | 高德 Web 服务 Key，IP 定位 + 逆地理编码 |
| `APP_URL` | ✅ | 应用主域名，用于回调与自引用链接 |
| `ADMIN_SYNC_KEY` | ✅ | 保护 `/api/cities/sync` 的管理员密钥 |
| `GEMINI_API_KEY` | ○ | Gemini AI（按需，未启用可留空） |

### 4. 初始化数据库

1. 打开 Supabase Dashboard → **SQL Editor**
2. 执行建表脚本：[`src/utils/supabase/schema.sql`](src/utils/supabase/schema.sql)（首次部署）
3. 执行增量迁移：[`supabase/migrations/20260617000001_add_listings_missing_columns.sql`](supabase/migrations/20260617000001_add_listings_missing_columns.sql)（补齐 `listings` 表的 `isActive`/`updatedAt`/`sellerDeviceId` 列）

### 5. 录入城市数据

```bash
npm run seed:cities
```

该脚本将全国 358 个城市写入 `cities` 表。也可改用管理后台 `/admin/cities` 在线维护。

### 6. 启动开发

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器（需先 build） |
| `npm run lint` | ESLint 检查 |
| `npm run seed:cities` | 城市数据种子脚本（写入 Supabase） |

## 项目结构

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 落地首页
│   ├── [city]/               # 城市浏览页（动态路由 + generateMetadata）
│   ├── listing/[id]/         # 商品详情页
│   ├── post/                 # 商品发布页
│   ├── me/                   # 个人中心（收藏/我的发布/消息）
│   ├── admin/cities/         # 城市管理后台
│   ├── about/ safety/ terms/ # 静态页
│   ├── api/                  # API 路由
│   └── actions.ts            # Server Actions（发布/更新/删除商品）
├── components/               # React 组件
│   └── home/                 # 首页区块组件
├── config/                   # 配置（城市映射、默认数据、床垫规格）
├── context/                  # 全局 Context（城市/收藏/通知）
├── hooks/                    # 自定义 Hooks
├── lib/                      # 城市数据访问层
├── utils/
│   ├── supabase/             # Supabase 客户端（server/client/public/service-role）
│   ├── db.ts                 # 数据访问（含降级策略）
│   ├── auth.ts geo.ts upload.ts
│   └── geo/                  # 地理位置工具
├── middleware.ts             # Supabase session 刷新 + device_id cookie
└── types.ts                  # TypeScript 类型定义

supabase/
└── migrations/               # 增量迁移 SQL（幂等）

scripts/
└── seed-cities.ts            # 城市种子脚本

docs/                         # 设计文档与需求分析
```

## 文档导航

完整设计文档位于 `docs/`：

- **[项目主页](docs/项目主页.md)** — 功能完成状态与路线图
- **需求分析** — [用户故事](docs/02-需求分析/用户故事.md) · [功能需求规格说明书](docs/02-需求分析/功能需求规格说明书.md)
- **系统设计** — [架构](docs/03-系统设计/系统架构设计.md) · [数据库](docs/03-系统设计/数据库设计.md) · [API](docs/03-系统设计/API设计.md) · [UI/UX](docs/03-系统设计/UI_UX设计.md) · [鉴权](docs/03-系统设计/鉴权设计.md) · [数据流与降级](docs/03-系统设计/数据流与降级策略.md) · [城市定位改进](docs/03-系统设计/城市定位系统改进方案.md)
- **技术选型** — [开发环境搭建](docs/04-技术选型/开发环境搭建.md) · [编码规范](docs/04-技术选型/编码规范.md)

## 架构要点

### 数据流与降级

所有数据访问走 `src/utils/db.ts`，三层降级保证可用性：

```
Supabase（主）─超时/报错─→ 默认 mock 数据（DEFAULT_LISTINGS）
```

- 服务端查询带 5s 超时（`withTimeout`），失败自动降级
- 图片上传优先 Supabase Storage，失败降级 base64 + localStorage（含配额保护）
- 收藏/通知 localStorage 与 Supabase 双端同步

### 鉴权与安全

- 设备标识 `device_id` 存于 HttpOnly Cookie，中间件统一注入
- Supabase RLS 通过 `get_device_id()` 读取请求头 `x-device-id` 做行级权限校验
- 卖家仅能更新/删除自己的商品（`sellerDeviceId` 比对）
- 联系方式（微信/手机）按需获取，不在列表/详情直接暴露

## 部署

推荐部署到 [Vercel](https://vercel.com)：

1. 导入 GitHub 仓库
2. 在项目设置中配置全部环境变量（同 `.env.example`）
3. 部署前确保已执行数据库建表与迁移脚本
4. 将 `APP_URL` 改为生产域名

> 数据库初始化脚本（schema.sql / migrations）需在 Supabase Dashboard 手动执行；Vercel 不会自动运行 SQL。

## 路线图

| 优先级 | 方向 |
|--------|------|
| P1 | 真实用户认证（微信 / 手机号登录替代 device_id 匿名追踪） |
| P1 | 图片存储全面迁移至 Supabase Storage（淘汰 base64 兜底） |
| P2 | 测试覆盖（单元测试 + E2E） |
| P2 | CI/CD 流程 |

详见 [docs/项目主页.md](docs/项目主页.md)。
