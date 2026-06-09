# API 设计

## API 概览

所有 API 端点位于 `/api/` 路径下，采用 RESTful 风格设计。

**认证方式**：基于 `device_id` Cookie 的设备认证，无需用户登录。

### 端点列表

| 端点 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/favorites` | GET | 获取收藏列表 | ✅ |
| `/api/favorites` | POST | 添加收藏 | ✅ |
| `/api/favorites` | DELETE | 取消收藏 | ✅ |
| `/api/locate` | GET | IP 定位获取城市 | ✅ |
| `/api/notifications` | GET | 获取通知列表 | ✅ |
| `/api/notifications` | POST | 创建通知 | ✅ |
| `/api/notifications` | PATCH | 更新通知 | ✅ |
| `/api/notifications` | DELETE | 删除通知 | ✅ |
| `/api/listings` | PATCH | 更新商品价格 | ✅ |
| `/api/listings/[id]/contact` | GET | 获取卖家联系方式 | ⚠️ 前端调用但后端未实现 |

---

## 1. 收藏管理 API

**端点**：`/api/favorites`

### 1.1 获取收藏列表

**方法**：`GET`

**描述**：获取指定设备的收藏商品 ID 列表。

**请求参数**：

| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| device_id | Query | string | 否 | 设备 ID（优先使用 Cookie） |

**响应**：

```json
{
  "success": true,
  "favorites": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**错误响应**：

| 状态码 | 错误信息 | 说明 |
|--------|----------|------|
| 400 | Missing device_id | 未提供设备 ID |
| 503 | Supabase not configured | 数据库未配置 |
| 500 | Database connection failed | 数据库连接失败 |

---

### 1.2 添加收藏

**方法**：`POST`

**描述**：将商品添加到收藏列表。

**请求体**：

```json
{
  "device_id": "uuid",
  "listing_id": "uuid"
}
```

**响应**：

```json
{
  "success": true
}
```

**错误响应**：

| 状态码 | 错误信息 | 说明 |
|--------|----------|------|
| 400 | Missing listing_id | 未提供商品 ID |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden: device_id mismatch | 设备 ID 不匹配 |
| 500 | Database connection failed | 数据库连接失败 |

---

### 1.3 取消收藏

**方法**：`DELETE`

**描述**：从收藏列表中移除商品。

**请求体**：

```json
{
  "device_id": "uuid",
  "listing_id": "uuid"
}
```

**响应**：

```json
{
  "success": true
}
```

---

## 2. IP 定位 API

**端点**：`/api/locate`

### 2.1 获取用户位置

**方法**：`GET`

**描述**：通过客户端 IP 地址获取用户所在城市。

**请求参数**：无（自动从请求头获取 IP）

**响应**：

```json
{
  "success": true,
  "city": "杭州市",
  "province": "浙江省",
  "ip": "1.2.3.4"
}
```

**错误响应**：

```json
{
  "success": false,
  "city": "",
  "province": ""
}
```

**说明**：
- 使用太平洋网络 IP 定位服务
- 支持代理转发，正确识别客户端真实 IP
- 本地开发时使用服务器出口 IP
- 超时 5 秒，自动重试 1 次

---

## 3. 通知管理 API

**端点**：`/api/notifications`

### 3.1 获取通知列表

**方法**：`GET`

**描述**：获取指定设备的通知列表。

**请求参数**：

| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| device_id | Query | string | 否 | 设备 ID |

**响应**：

```json
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "type": "contact_request",
      "title": "新的联系请求",
      "timestamp": "2026-06-09T10:00:00Z",
      "message": "买家张三想联系您",
      "detailUrl": "/listing/uuid",
      "unread": true,
      "actionState": "pending",
      "buyerName": "张三",
      "listingTitle": "席梦思床垫",
      "listingId": "uuid"
    }
  ]
}
```

**通知类型**：

| 类型 | 说明 |
|------|------|
| contact_request | 联系请求 |
| insight | 洞察/建议 |
| verification | 验证通知 |
| completed | 完成通知 |

---

### 3.2 创建通知

**方法**：`POST`

**描述**：创建一条新通知。

**请求体**：

```json
{
  "device_id": "uuid",
  "type": "contact_request",
  "title": "新的联系请求",
  "message": "买家张三想联系您",
  "detail_url": "/listing/uuid",
  "action_state": "pending",
  "buyer_name": "张三",
  "listing_title": "席梦思床垫",
  "listing_id": "uuid"
}
```

**必填字段**：`device_id`, `type`, `title`, `message`

**响应**：

```json
{
  "success": true,
  "id": "uuid"
}
```

---

### 3.3 更新通知

**方法**：`PATCH`

**描述**：更新通知状态（标记已读、更新操作状态等）。

**请求体**：

```json
{
  "id": "uuid",
  "device_id": "uuid",
  "unread": false,
  "action_state": "accepted",
  "message": "更新后的消息"
}
```

**说明**：
- 提供 `id` 时更新单条通知
- 不提供 `id` 时批量更新所有未读通知

**响应**：

```json
{
  "success": true
}
```

---

### 3.4 删除通知

**方法**：`DELETE`

**描述**：删除通知。

**请求体**：

```json
{
  "id": "uuid",
  "device_id": "uuid"
}
```

**说明**：
- 提供 `id` 时删除单条通知
- 不提供 `id` 时批量删除所有已读通知

**响应**：

```json
{
  "success": true
}
```

---

## 4. 商品管理 API

**端点**：`/api/listings`

### 4.1 更新商品价格

**方法**：`PATCH`

**描述**：更新商品价格（仅卖家本人可操作）。

**请求体**：

```json
{
  "id": "uuid",
  "price": 2900
}
```

**响应**：

```json
{
  "success": true
}
```

**错误响应**：

| 状态码 | 错误信息 | 说明 |
|--------|----------|------|
| 400 | Missing id or price | 缺少必要参数 |
| 403 | Forbidden: not the listing owner | 非商品所有者 |
| 503 | Supabase not configured | 数据库未配置 |
| 500 | Database connection failed | 数据库连接失败 |

**权限校验**：
1. 查询 `sellerDeviceId` 与 cookie `device_id` 比对
2. 不匹配时返回 403

---

## 5. Server Actions

**文件**：`src/app/actions.ts`

### 5.1 publishListing

**描述**：发布新的商品列表。

**参数**：

```typescript
interface MattressListing {
  id: string;
  title: string;
  brand: string;
  price: number;
  // ... 完整字段见 types.ts
}
```

**响应**：

```typescript
{
  success: boolean;
  error?: string;
}
```

**说明**：
- 写入 Supabase `listings` 表
- 自动刷新城市页面缓存
- 超时 8 秒

---

## 错误处理

### 统一错误格式

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

### 常见错误码

| HTTP 状态码 | 说明 |
|-------------|------|
| 400 | 请求参数错误 |
| 401 | 未认证（缺少 device_id） |
| 403 | 权限不足（设备 ID 不匹配/非商品所有者） |
| 500 | 服务器内部错误 |
| 503 | 服务不可用（Supabase 未配置） |

---

## 超时控制

所有 Supabase 查询均设置超时：

| 操作 | 超时时间 |
|------|----------|
| 收藏查询/写入 | 8 秒 |
| 通知查询/写入 | 8 秒 |
| 商品查询 | 5 秒 |
| 商品更新（降价） | 8 秒 |
| 数据写入（publishListing） | 8 秒 |
| IP 定位 | 5 秒（重试 1 次） |

---

*最后更新：2026-06-09*
