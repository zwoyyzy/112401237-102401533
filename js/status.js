(function () {
  "use strict";

  var USER_ID = "current-user";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  }

  function init() {
    var form = document.getElementById("status-form");
    if (!form || !window.CampusData) return;
    var id = new URLSearchParams(window.location.search).get("id");
    var item = typeof CampusData.getItemById === "function" ? CampusData.getItemById(id) : null;
    var box = document.querySelector("[data-status-item]");
    var activeLabel = document.querySelector("[data-active-label]");
    var completeLabel = document.querySelector("[data-complete-label]");
    var isMine = item && (item.publisherId === USER_ID || item.publisher === "校园用户" || item.publisher === "林同学" || String(item.id || "").indexOf("item-") === 0);
    if (!item || !isMine) {
      box.innerHTML = "<p>找不到可修改的发布信息。</p>";
      form.hidden = true;
      return;
    }
    box.innerHTML = "<h2>" + escapeHtml(item.name) + "</h2><p>" + escapeHtml(item.location) + " · " + escapeHtml(CampusData.formatItemDate(item)) + "</p><span>" + escapeHtml(CampusData.getStatusLabel(item)) + "</span>";
    if (item.type === "lost") {
      activeLabel.textContent = "未找到";
      completeLabel.textContent = "已找到";
    } else {
      activeLabel.textContent = "未归还";
      completeLabel.textContent = "已归还";
    }
    var selected = form.querySelector('input[name="status"][value="' + item.status + '"]');
    if (selected) selected.checked = true;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var nextStatus = new FormData(form).get("status");
      var updated = typeof CampusData.updateStatus === "function" ? CampusData.updateStatus(id, nextStatus) : null;
      if (!updated) {
        document.querySelector("[data-status-message]").textContent = "状态更新失败，请重试。";
        return;
      }
      window.location.href = "./profile.html";
    });
  }

  window.MemberBStatus = { init: init };
  init();
})();
