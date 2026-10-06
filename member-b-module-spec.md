# 成员 B 模块实现与协作规范

本文档只规定成员 B 负责的“发布、个人中心、状态管理”模块，不包含成员 A 的首页浏览、搜索、筛选和信息详情实现。

## 1. 成员 B 分工

根据分工表，成员 B 负责“发布、个人中心与状态管理模块”：

- 设计失物招领数据结构。
- 实现统一的 `localStorage` 数据存储。
- 实现发布信息页面、表单校验和发布成功页面。
- 实现“我的”页面及其中的完整发布列表。
- 实现信息状态修改。
- 将寻物信息标记为“已找到”。
- 将招领信息标记为“已归还”。
- 编写存储、发布和状态相关单元测试。当前阶段可以暂缓测试，但后续接口必须保持不变。

成员 A 负责首页、搜索、筛选、详情和联系方式展示。成员 B 不得在自己的分支中重新实现或覆盖这些功能。

## 2. 项目结构

成员 B 的代码必须直接放入主项目，不再创建独立的 `member-b-only` 项目、第二套 `index.html` 或第二套公共样式。

```text
112401237-102401533/
├── index.html
├── pages/
│   ├── publish.html
│   ├── publish-success.html
│   ├── profile.html
│   └── status.html
├── css/
│   ├── common.css
│   ├── design-system.css
│   ├── publish.css
│   └── profile.css
├── js/
│   ├── data.js
│   ├── publish.js
│   ├── profile.js
│   └── status.js
├── tests/
└── README.md
```

成员 B 新增或主要负责：

```text
pages/publish.html
pages/publish-success.html
pages/profile.html
pages/status.html
css/publish.css
css/profile.css
js/publish.js
js/profile.js
js/status.js
```

不得新增第二个 `data.js`、`common.css`、`design-system.css`、`index.html`、手机框或独立的 `localStorage` key。

## 3. 技术和脚本要求

- 使用原生 HTML、CSS 和 JavaScript。
- 不使用 React、Vue、Vite、CDN 或联网资源。
- 下载项目后可以直接用 Chrome 打开根目录 `index.html`。
- 页面之间使用相对路径跳转。
- 每个页面必须加载 `data.js` 后再加载自己的脚本。

页面脚本示例：

```html
<script src="../js/data.js"></script>
<script src="../js/publish.js"></script>
```

根目录 `index.html` 使用对应的 `./js/` 路径。

## 4. 统一数据存储

所有页面只能通过 `window.CampusData` 读写数据，页面脚本禁止直接调用 `localStorage`。

唯一允许的存储键：

```js
localStorage["campus-lost-found-items"]
```

建议由 `CampusData` 在该 key 内部统一管理：

```js
{
  items: [],
  favorites: { "current-user": [] },
  comments: []
}
```

如果检测到旧数据是数组，`CampusData` 应兼容读取并迁移。页面不得依赖这个内部结构，只能调用公共接口。

## 5. CampusData 公共接口

`js/data.js` 是团队共享文件。成员 B 不得直接覆盖，修改前必须和成员 A 沟通。

必须提供：

```js
CampusData.readItems()
CampusData.getItemById(id)
CampusData.createItem(formData)
CampusData.updateStatus(id, "completed")
CampusData.getMyItems("current-user")
CampusData.getTypeLabel(type)
CampusData.getStatusLabel(item)
CampusData.getCampusLocations()
```

“我的”页面还需要：

```js
CampusData.getMyFavorites("current-user")
CampusData.toggleFavorite(itemId, "current-user")
CampusData.getMyComments("current-user")
CampusData.addComment(itemId, text, "current-user")
```

接口约定：

- `readItems()` 返回物品数组。
- `getItemById(id)` 找不到时返回 `null`。
- `createItem(formData)` 负责创建、保存并返回新物品。
- `updateStatus()` 只能修改当前用户自己的信息，成功返回物品，失败返回 `null`。
- `getMyItems(userId)` 按 `publisherId` 筛选。
- `getTypeLabel()` 将 `lost` 转为“寻物”，将 `found` 转为“招领”。
- `getStatusLabel(item)` 根据 `type` 和 `status` 返回中文显示文字。
- `getCampusLocations()` 返回校园地图中约定的地点。
- 收藏和评论也必须由 `CampusData` 统一读写，不能新建其他 key。

## 6. 统一物品数据结构

每条物品信息必须使用以下字段：

```js
{
  id: "lost-1728057600000",
  type: "lost",
  name: "校园卡",
  category: "证件",
  location: "图书馆二楼",
  date: "今天 10:24",
  description: "蓝色卡套，背面有贴纸。",
  contact: "手机：138****2716",
  imageClass: "icon-blue",
  icon: "card",
  status: "active",
  publisher: "林同学",
  publisherId: "current-user",
  views: 0,
  createdAt: "2026-10-04T10:24:00"
}
```

字段取值：

```text
type: lost = 寻物，found = 招领
status: active = 进行中，completed = 已完成
```

页面显示规则：

```text
lost + active       = 寻找中
lost + completed    = 已找到
found + active      = 待认领
found + completed   = 已归还
```

数据中只能保存 `active`、`completed`，不能保存“寻找中”“已找到”等中文状态。

表单字段映射必须统一：

```text
title -> name
type -> type
category -> category
location -> location
date -> date
description -> description
contact -> contact
```

图片不能把 `File` 对象直接存入 `localStorage`。没有约定 Base64 字段前，使用 `imageClass` 和 `icon` 显示占位图标。地点必须来自校园地图已有名称，不得虚构“南区宿舍”“东二食堂”等地点。

## 7. 页面路径和跳转

```text
index.html                              首页
pages/search.html?keyword=校园卡          搜索结果
pages/detail.html?id=物品ID               信息详情
pages/publish.html                       发布信息
pages/publish-success.html?id=ID         发布成功
pages/profile.html                      我的
pages/status.html?id=ID                 修改状态
```

成员 B 页面跳转：

```js
location.href = `./publish-success.html?id=${item.id}`;
location.href = `./detail.html?id=${item.id}`;
location.href = `./status.html?id=${item.id}`;
```

从 `pages/` 返回首页必须写：

```html
<a href="../index.html">首页</a>
```

## 8. 页面公共结构和视觉规范

每个页面只能有一层手机画布：

```html
<link rel="stylesheet" href="../css/common.css">
<link rel="stylesheet" href="../css/design-system.css">
<link rel="stylesheet" href="../css/publish.css">

<body>
  <div class="phone-screen publish-screen">
    <!-- 页面内容 -->
  </div>
</body>
```

`profile.html` 和 `status.html` 使用 `profile.css`。CSS 顺序统一为：公共样式、设计变量、页面专属样式。

手机画布统一按 `390 × 844` 设计，在桌面 Chrome 中居中显示。必须使用现有变量：

```css
var(--ui-blue)
var(--ui-blue-soft)
var(--ui-green)
var(--ui-green-soft)
var(--ui-orange)
var(--ui-orange-soft)
var(--ui-ink)
var(--ui-text)
var(--ui-muted)
var(--ui-page)
var(--ui-radius)
var(--ui-card-shadow)
```

规则：

- 主按钮统一蓝底白字。
- 寻物使用蓝色，招领使用绿色。
- 进行中使用橙色，已完成使用绿色。
- 图标使用内联 SVG，不使用 emoji、`⌂`、`♟` 等字符。
- 不自行创建另一套绿色、灰色或手机框主题。
- 文字、按钮和卡片不能互相重叠。

## 9. 发布信息页

文件：`pages/publish.html`、`js/publish.js`、`css/publish.css`。

页面按照原型图实现：

- 顶部标题“发布信息”。
- “寻物 / 招领”分段切换。
- 物品名称、分类、物品图片、特征描述、时间、地点、联系方式。
- 图片最多选择 3 张；不能把 File 对象直接持久化。
- 时间不能选择今天之后的日期。
- 地点使用校园地图的分级选择器：`##` 作为一级分组，`-` 作为展开后的二级地点；列表底部提供自定义地点输入。
- 表单不完整时停留当前页并显示提示。
- 成功后调用 `CampusData.createItem(formData)`。
- 底部固定蓝底白字“发布信息”按钮。
- 显示统一底部导航：首页 / 发布 / 我的。

## 10. 发布成功页

文件：`pages/publish-success.html`。

通过 URL 的 `id` 调用 `CampusData.getItemById(id)`，显示真实的发布类型、物品名称和状态，不得写死“校园卡”。页面包括：

- 绿色成功 SVG 图标。
- “发布成功”标题和提示文字。
- 发布类型、物品名称、当前状态摘要卡。
- “查看详情”按钮：`./detail.html?id=物品ID`。
- “返回首页”按钮：`../index.html`。
- 不显示底部导航。

## 11. 我的和状态页

文件：`pages/profile.html`、`pages/status.html`、`js/profile.js`、`js/status.js`、`css/profile.css`。

`profile.html` 按原型实现：

- 用户头像和基本信息。
- 全部、进行中、已完成数量统计。
- 我的发布、我的收藏、我的评论、归还记录入口。
- 按发布时间从新到旧展示当前用户的全部发布信息。
- 统一底部导航：首页 / 发布 / 我的。

数据调用：

```js
CampusData.getMyItems("current-user")
CampusData.getMyFavorites("current-user")
CampusData.getMyComments("current-user")
```

`status.html` 只允许当前用户修改自己的信息：

```text
寻物：active -> completed，页面显示“已找到”
招领：active -> completed，页面显示“已归还”
```

提交时调用：

```js
CampusData.updateStatus(id, "completed");
```

成功后跳转 `./profile.html`。是否允许从 `completed` 恢复 `active`，需要团队提前约定；默认不提供恢复操作。

## 12. 底部导航

显示底部导航：

```text
index.html
pages/publish.html
pages/profile.html
pages/status.html
```

不显示底部导航：

```text
pages/search.html
pages/detail.html
pages/publish-success.html
```

从 `pages/` 目录引用导航：

```html
<a href="../index.html">首页</a>
<a href="./publish.html">发布</a>
<a href="./profile.html">我的</a>
```

## 13. 错误、空状态和权限

必须处理：

- 物品 ID 不存在。
- 当前用户没有发布、收藏或评论。
- 状态对象不是当前用户发布的内容。
- `localStorage` 为空、损坏或格式不正确。
- 表单不完整或日期为未来日期。

以上情况不能产生未处理 JavaScript 异常。只有 `publisherId === "current-user"` 的信息可以由成员 B 修改状态。

## 14. Git 协作规则

成员 B 从最新 `main` 创建自己的功能分支，例如：

```text
feature/member-b-publish-profile-status
```

PR 只提交成员 B 的页面、脚本和专属样式，不得擅自覆盖：

```text
index.html
js/data.js
css/common.css
css/design-system.css
```

必须修改共享文件时，先和成员 A 沟通并在 PR 中说明原因。PR 目标为：

```text
成员 B 功能分支 -> 队友仓库 main
```

## 15. 合并前验收清单

- [ ] 发布页能切换寻物和招领。
- [ ] 必填项、地点和未来日期校验正常。
- [ ] 发布后跳转 `publish-success.html?id=ID`。
- [ ] 成功页显示真实数据并能跳转详情、首页。
- [ ] “我的”页面显示发布、收藏、评论和归还记录入口。
- [ ] “我的发布”只显示 `current-user` 的数据。
- [ ] 寻物可以标记为已找到，招领可以标记为已归还。
- [ ] 状态修改后 A 的首页和详情可以读取相同数据。
- [ ] 所有页面共享 `CampusData` 和同一个存储 key。
- [ ] 没有第二套手机框、公共样式、数据脚本或页面入口。
- [ ] 没有使用 emoji 或字符代替图标。
- [ ] 单元测试按团队进度补充，接口保持不变。
