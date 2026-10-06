(function () {
  "use strict";

  var USER_ID = "current-user";
  var PROFILE_KEY = "campus-lost-found-profile";
  var DEFAULT_AVATAR = "../assets/default-profile-avatar.png";
  var DEFAULT_PROFILE = { name: "小同学", university: "福州大学", college: "计算机与大数据学院", grade: "2024级" };

  function readProfile() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || "{}");
      var profile = Object.assign({}, DEFAULT_PROFILE, saved);
      if (!profile.college || profile.college === "信息学院") {
        profile.college = DEFAULT_PROFILE.college;
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      }
      return profile;
    } catch (error) {
      return Object.assign({}, DEFAULT_PROFILE);
    }
  }

  function renderProfileHeader() {
    var profile = readProfile();
    var avatar = document.querySelector("[data-profile-avatar]");
    var name = document.querySelector("[data-profile-name]");
    var university = document.querySelector("[data-profile-university]");
    var college = document.querySelector("[data-profile-college]");
    var grade = document.querySelector("[data-profile-grade]");
    if (avatar) {
      avatar.src = profile.avatar || DEFAULT_AVATAR;
      avatar.alt = profile.name ? profile.name + "的头像" : "默认头像";
    }
    if (name) name.textContent = profile.name || DEFAULT_PROFILE.name;
    if (university) university.textContent = profile.university || DEFAULT_PROFILE.university;
    if (college) college.textContent = profile.college || DEFAULT_PROFILE.college;
    if (grade) grade.textContent = profile.grade || DEFAULT_PROFILE.grade;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function getItems() {
    if (!window.CampusData) return [];
    if (typeof CampusData.getMyItems === "function") return CampusData.getMyItems(USER_ID) || [];
    if (typeof CampusData.readItems !== "function") return [];
    return CampusData.readItems().filter(function (item) {
      return item && item.publisher === "校园用户";
    });
  }

  function resolveItems(values) {
    return (values || []).map(function (value) {
      return typeof value === "string" && typeof CampusData.getItemById === "function" ? CampusData.getItemById(value) : value;
    }).filter(Boolean);
  }

  function typeLabel(item) {
    return CampusData.getTypeLabel(item.type);
  }

  function statusLabel(item) {
    return CampusData.getStatusLabel(item);
  }

  function viewedCount() {
    try {
      var saved = window.localStorage.getItem("campus-lost-found-viewed-items");
      var ids = saved ? JSON.parse(saved) : [];
      return Array.isArray(ids) ? ids.length : 0;
    } catch (error) {
      return 0;
    }
  }

  function card(item, withAction) {
    var detailHref = "./detail.html?id=" + encodeURIComponent(item.id);
    var action = withAction ? "<div class=\"post-actions\"><a class=\"post-action\" href=\"./status.html?id=" + encodeURIComponent(item.id) + "\">修改状态</a><a class=\"post-edit\" href=\"./edit-post.html?id=" + encodeURIComponent(item.id) + "\">编辑</a><button class=\"post-delete\" type=\"button\" data-delete-item=\"" + escapeHtml(item.id) + "\">删除</button></div>" : "";
    var statusClass = item.status === "completed" ? "completed" : "active";
    var firstImage = Array.isArray(item.images) && item.images.length ? item.images[0] : "";
    var firstImageUrl = CampusData.getImageUrl(firstImage);
    var displayDate = CampusData.formatItemDate(item);
    var visual = firstImageUrl
      ? "<img class=\"post-icon-image\" src=\"" + escapeHtml(firstImageUrl) + "\" alt=\"" + escapeHtml(item.name) + "图片\">"
      : "<svg class=\"default-item-cube\" viewBox=\"0 0 48 48\" aria-hidden=\"true\"><path d=\"m24 6 16 9-16 9-16-9 16-9Z\"/><path d=\"M8 15v18l16 9 16-9V15\"/><path d=\"M24 24v18\"/></svg>";
    return "<article class=\"post-card\"><a class=\"post-detail-link\" href=\"" + detailHref + "\"><div class=\"post-icon " + escapeHtml(item.imageClass || "icon-blue") + "\" aria-hidden=\"true\">" + visual + "</div><div class=\"post-copy\"><div class=\"post-meta\"><span>" + typeLabel(item) + "</span><strong class=\"" + statusClass + "\">" + statusLabel(item) + "</strong></div><h3>" + escapeHtml(item.name) + "</h3><p>" + escapeHtml(displayDate) + " · " + escapeHtml(item.location) + "</p></div></a>" + action + "</article>";
  }

  function ensureDeleteDialog() {
    var dialog = document.querySelector("[data-delete-dialog]");
    if (dialog) return dialog;
    dialog = document.createElement("div");
    dialog.className = "delete-dialog-backdrop";
    dialog.setAttribute("data-delete-dialog", "");
    dialog.hidden = true;
    dialog.innerHTML = "<div class=\"delete-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"delete-dialog-title\"><h2 id=\"delete-dialog-title\">是否要删除</h2><p>删除后该帖子及其相关信息将从列表中移除。</p><div class=\"delete-dialog-actions\"><button type=\"button\" data-delete-cancel>取消</button><button type=\"button\" class=\"confirm-delete\" data-delete-confirm>确认删除</button></div></div>";
    document.body.appendChild(dialog);
    return dialog;
  }

  function bindDeleteActions() {
    var dialog = ensureDeleteDialog();
    var pendingId = "";
    document.querySelectorAll("[data-delete-item]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        pendingId = button.getAttribute("data-delete-item") || "";
        dialog.hidden = false;
      });
    });
    var cancel = dialog.querySelector("[data-delete-cancel]");
    var confirm = dialog.querySelector("[data-delete-confirm]");
    cancel.onclick = function () { pendingId = ""; dialog.hidden = true; };
    confirm.onclick = function () {
      if (!pendingId) return;
      if (!window.CampusData || typeof CampusData.deleteItem !== "function") {
        dialog.querySelector("p").textContent = "共享数据模块暂未提供删除接口，请先同步公共数据模块。";
        return;
      }
      var deleted = CampusData.deleteItem(pendingId, USER_ID);
      if (!deleted) {
        dialog.querySelector("p").textContent = "删除失败，该信息可能已不存在。";
        return;
      }
      dialog.hidden = true;
      pendingId = "";
      renderProfile();
      renderMyPosts();
    };
    dialog.addEventListener("click", function (event) { if (event.target === dialog) cancel.click(); });
  }

  function commentCard(comment, items) {
    var item = items.find(function (entry) { return entry.id === comment.itemId; });
    return "<article class=\"comment-card\"><strong>" + escapeHtml(item ? item.name : "失物信息") + "</strong><p>" + escapeHtml(comment.text) + "</p></article>";
  }

  function updateStats(items, favorites, comments) {
    var completed = items.filter(function (item) { return item.status === "completed"; }).length;
    var active = items.length - completed;
    var stats = { all: items.length, active: active, completed: completed };
    Object.keys(stats).forEach(function (key) { var element = document.querySelector('[data-stat="' + key + '"]'); if (element) element.textContent = stats[key]; });
    var counts = { posts: items.length, favorites: favorites.length, comments: comments.length, history: items.filter(function (item) { return item.status === "completed" && item.type === "found"; }).length, viewed: viewedCount() };
    Object.keys(counts).forEach(function (key) { var element = document.querySelector('[data-count="' + key + '"]'); if (element) element.textContent = counts[key] + " 条"; });
  }

  function renderProfile() {
    renderProfileHeader();
    var list = document.querySelector("[data-profile-list]");
    if (!list || !window.CampusData) return;
    var items = getItems();
    var favorites = typeof CampusData.getMyFavorites === "function" ? resolveItems(CampusData.getMyFavorites(USER_ID)) : [];
    var comments = typeof CampusData.getMyComments === "function" ? CampusData.getMyComments(USER_ID) : [];
    var tab = document.body.getAttribute("data-profile-view") || "posts";
    var completedFound = items.filter(function (item) { return item.status === "completed" && item.type === "found"; });
    var selected = tab === "favorites" ? favorites : (tab === "history" ? completedFound : items);
    var titleElement = document.querySelector("[data-list-title]");
    var title = tab === "favorites" ? "我的收藏" : (tab === "history" ? "归还记录" : "我的发布");
    if (titleElement) titleElement.textContent = title;
    var countElement = document.querySelector("[data-filter-count]");
    if (countElement) countElement.textContent = selected.length + " 条";
    updateStats(items, favorites, comments);
    list.innerHTML = selected.map(function (item) { return card(item, tab === "posts"); }).join("") || "<p class=\"empty-state\">暂无内容</p>";
    bindDeleteActions();
  }

  function renderMyPosts() {
    var list = document.querySelector("[data-my-posts-list]");
    if (!list || !window.CampusData) return;
    var items = getItems();
    var count = document.querySelector("[data-post-count]");
    if (count) count.textContent = items.length + " 条";
    list.innerHTML = items.map(function (item) { return card(item, true); }).join("") || "<p class=\"empty-state\">还没有发布信息</p>";
    bindDeleteActions();
  }

  window.MemberBProfile = { renderProfile: renderProfile, renderMyPosts: renderMyPosts };
  renderProfile();
  renderMyPosts();
})();
