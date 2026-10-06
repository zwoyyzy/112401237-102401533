(function () {
  const container = document.getElementById("detail-content");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "seed-id-card-found";
  const detailBack = document.querySelector(".detail-back");
  if (params.get("from") === "home" && detailBack) {
    const returnUrl = params.get("return");
    try {
      const homeUrl = new URL(returnUrl, window.location.href);
      const isHomePath = homeUrl.pathname.endsWith("/index.html") || homeUrl.pathname.endsWith("/");
      if (homeUrl.origin === window.location.origin && isHomePath) {
        detailBack.href = `${homeUrl.pathname}${homeUrl.search}${homeUrl.hash}`;
      }
    } catch (error) {
      // Keep browser history fallback when the return URL is unavailable.
    }
  }
  if (params.get("from") === "search" && detailBack) {
    const returnUrl = params.get("return");
    try {
      const searchUrl = new URL(returnUrl, window.location.href);
      if (searchUrl.origin === window.location.origin && searchUrl.pathname.endsWith("/search.html")) {
        detailBack.href = `${searchUrl.pathname}${searchUrl.search}${searchUrl.hash}`;
      }
    } catch (error) {
      // Keep browser history fallback when the return URL is unavailable.
    }
  }
  const initialItem = CampusData.getItemById(id);
  const toast = document.getElementById("copy-toast");

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function notify(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");
    window.setTimeout(() => toast.classList.add("hidden"), 1800);
  }

  if (!initialItem) {
    container.innerHTML = '<div class="not-found"><h2>找不到这条信息</h2><p>它可能已经被移除，或链接已经失效。</p></div>';
    return;
  }

  // Count only the first detail-page visit from this browser for this item.
  CampusData.recordView(id);
  const item = CampusData.getItemById(id) || initialItem;

  document.title = `${item.name} | 拾光`;
  const statusClass = item.status === "completed" ? "completed" : "active";
  const categoryLabel = item.category;
  const publisherName = String(item.publisher || "");
  const contactText = item.contact || "暂无联系方式";
  const displayDate = CampusData.formatItemDate(item);
  const isCurrentUser = item.publisherId === "current-user";
  let publisherAvatar = "../assets/default-profile-avatar.png";
  if (isCurrentUser) {
    try {
      const profile = JSON.parse(window.localStorage.getItem("campus-lost-found-profile") || "{}");
      if (profile && typeof profile.avatar === "string" && profile.avatar.trim()) publisherAvatar = profile.avatar.trim();
    } catch (error) {
      // Keep the same default avatar used by the profile page.
    }
  }
  const publisherAvatarMarkup = isCurrentUser
    ? `<img class="publisher-avatar" src="${escapeHtml(publisherAvatar)}" alt="${escapeHtml(publisherName)}的头像">`
    : `<span class="publisher-avatar" aria-hidden="true">${escapeHtml(publisherName.slice(0, 1))}</span>`;
  const images = Array.isArray(item.images)
    ? item.images.map(CampusData.getImageUrl).filter(Boolean).slice(0, 3)
    : [];
  const galleryMarkup = images.length
    ? `<img class="detail-gallery-image" data-gallery-image src="${escapeHtml(images[0])}" alt="${escapeHtml(item.name)}图片 1">${images.length > 1 ? `
        <button class="gallery-prev" type="button" aria-label="上一张图片"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg></button>
        <button class="gallery-next" type="button" aria-label="下一张图片"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7"/></svg></button>
        <span class="gallery-counter" data-gallery-counter>1 / ${images.length}</span>` : ""}`
    : `<span class="item-emoji default-item-placeholder" aria-hidden="true">${CampusCard.defaultItemIconSvg()}</span>`;
  container.innerHTML = `
    <div class="detail-visual ${images.length ? "has-image" : item.imageClass}">
      ${galleryMarkup}
    </div>
    <article class="detail-content">
      <div class="detail-kicker">
        <span class="item-type-inline ${item.type}">${CampusData.getTypeLabel(item.type)}</span>
        <span class="status-pill ${statusClass}">${CampusData.getStatusLabel(item)}</span>
      </div>
      <div class="detail-title-line">
        <h1>${item.name}</h1>
        <span class="detail-views">${item.views || 0} 次浏览</span>
      </div>
      <p class="detail-subtitle">${categoryLabel}</p>
      <section class="detail-description">
        <strong>简要描述</strong>
        ${item.locationDetail ? `<small class="detail-location-detail">具体位置：${item.locationDetail}</small>` : ""}
        <span>${item.description}</span>
      </section>
      <section class="detail-info">
        <div class="info-item time"><div><small>丢失时间</small><strong>${escapeHtml(displayDate)}</strong></div></div>
        <div class="info-item place"><span class="place-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span><div><small>可能地点</small><strong>${item.location}</strong></div></div>
      </section>
      <section class="publisher-card">
        ${publisherAvatarMarkup}
        <div class="publisher-info"><strong>${escapeHtml(publisherName)}</strong><p class="publisher-contact"><span id="contact-value">${escapeHtml(contactText)}</span><button class="copy-contact" id="copy-contact" type="button" aria-label="复制联系方式"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0 2 2v8a2 2 0 0 0 2 2h2"/></svg><span>复制</span></button></p></div>
      </section>
    </article>`;

  if (images.length > 1) {
    let galleryIndex = 0;
    const galleryImage = container.querySelector("[data-gallery-image]");
    const galleryCounter = container.querySelector("[data-gallery-counter]");

    function renderGallery() {
      galleryImage.src = images[galleryIndex];
      galleryImage.alt = `${item.name}图片 ${galleryIndex + 1}`;
      galleryCounter.textContent = `${galleryIndex + 1} / ${images.length}`;
    }

    container.querySelector(".gallery-prev").addEventListener("click", () => {
      galleryIndex = (galleryIndex - 1 + images.length) % images.length;
      renderGallery();
    });
    container.querySelector(".gallery-next").addEventListener("click", () => {
      galleryIndex = (galleryIndex + 1) % images.length;
      renderGallery();
    });
  }

  const saveButton = document.getElementById("save-detail");
  const favoriteUserId = "current-user";

  function updateFavoriteButton(saved) {
    saveButton.classList.toggle("saved", saved);
    saveButton.setAttribute("aria-label", saved ? "取消收藏" : "收藏");
    saveButton.setAttribute("aria-pressed", String(saved));
  }

  updateFavoriteButton(CampusData.isFavorite(id, favoriteUserId));
  saveButton.addEventListener("click", () => {
    const saved = CampusData.toggleFavorite(id, favoriteUserId);
    if (saved === null) return;
    updateFavoriteButton(saved);
    notify(saved ? "已加入收藏" : "已取消收藏");
  });

  async function copyContact() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(contactText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = contactText;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("copy command failed");
      }
      notify("复制成功，快去联系ta吧");
    } catch (error) {
      notify("复制失败，请手动复制联系方式");
    }
  }

  document.getElementById("copy-contact").addEventListener("click", copyContact);
})();
