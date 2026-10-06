# 成员 102401533（B） 模块

成员 B 的页面、脚本和专属样式已经按 `member-b-module-spec.md` 接入主项目结构。

成员 B 文件：

- `pages/publish.html`
- `pages/publish-success.html`
- `pages/profile.html`
- `pages/status.html`
- `css/publish.css`
- `css/profile.css`
- `js/publish.js`
- `js/profile.js`
- `js/status.js`

这些文件依赖队友主项目提供的 `js/data.js`、`css/common.css` 和 `css/design-system.css`，统一通过 `window.CampusData` 读写 `campus-lost-found-items`，不创建第二套数据存储。
## 软工第一次结对作业预告
之后，我们将在这里开展小程序原型的结对编程，共同完成代码实现与功能优化。
