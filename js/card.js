(function () {
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function iconSvg(type) {
    const paths = {
      card: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M7 9h4M7 13h6M16 9h2"></path>',
      umbrella: '<path d="M3 13a9 9 0 0 1 18 0H3Z"></path><path d="M12 13v6a2 2 0 0 0 4 0"></path>',
      headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"></path><rect x="3" y="13" width="4" height="6" rx="1"></rect><rect x="17" y="13" width="4" height="6" rx="1"></rect>',
      cup: '<path d="M5 7h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V7Z"></path><path d="M17 10h2a2 2 0 0 1 0 4h-2M8 4v3M12 4v3"></path>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[type] || paths.card}</svg>`;
  }

  function defaultItemIconSvg() {
    return `
      <svg class="default-item-cube" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="m24 6 16 9-16 9-16-9 16-9Z"></path>
        <path d="M8 15v18l16 9 16-9V15"></path>
        <path d="M24 24v18"></path>
      </svg>`;
  }

  function itemCard(item) {
    const statusClass = item.status === "completed" ? "completed" : "active";
    const detailPath = window.location.pathname.includes("/pages/") ? "./detail.html" : "./pages/detail.html";
    const isHomePage = window.location.pathname.endsWith("/index.html") || window.location.pathname.endsWith("/");
    const homeCategory = isHomePage ? new URLSearchParams(window.location.search).get("category") || "all" : "";
    const homeReturnParams = isHomePage ? `&from=home&category=${encodeURIComponent(homeCategory)}` : "";
    const firstImage = Array.isArray(item.images) && item.images.length ? item.images[0] : "";
    const firstImageUrl = CampusData.getImageUrl(firstImage);
    const displayDate = CampusData.formatItemDate(item);
    const thumbContent = firstImageUrl
      ? `<img class="item-thumb-image" src="${escapeHtml(firstImageUrl)}" alt="${escapeHtml(item.name)}图片">`
      : `<span class="item-emoji default-item-placeholder" aria-hidden="true">${defaultItemIconSvg()}</span>`;
    return `
      <article class="item-card">
        <a class="item-card-link" href="${detailPath}?id=${encodeURIComponent(item.id)}${homeReturnParams}">
          <div class="item-thumb ${item.imageClass}">
            <span class="item-type ${item.type}">${CampusData.getTypeLabel(item.type)}</span>
            ${thumbContent}
          </div>
          <div class="item-body">
            <div class="item-card-head">
              <h3>${item.name}</h3>
              <span class="item-type-inline ${item.type}">${CampusData.getTypeLabel(item.type)}</span>
            </div>
            <div class="item-meta">
              <span>${escapeHtml(displayDate)}</span>
              <span>${item.location}</span>
            </div>
            <div class="item-footer">
              <span class="status-pill ${statusClass}">${CampusData.getStatusLabel(item)}</span>
              <span class="view-count" aria-label="浏览次数"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>${item.views || 0}</span>
            </div>
          </div>
        </a>
      </article>`;
  }
  window.CampusCard = { itemCard, iconSvg, defaultItemIconSvg };
})();
