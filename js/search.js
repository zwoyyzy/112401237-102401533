(function () {
  const form = document.getElementById("filter-form");
  const keyword = document.getElementById("keyword");
  const clearKeyword = document.getElementById("clear-keyword");
  const grid = document.getElementById("search-item-grid");
  const noResults = document.getElementById("no-results-state");
  const summary = document.getElementById("results-summary");
  const resultsHeading = document.getElementById("results-heading");
  const overlay = document.getElementById("filter-overlay");
  const openFilter = document.getElementById("open-filter");
  const closeFilter = document.getElementById("close-filter");
  const filterScrim = document.getElementById("filter-scrim");
  const confirmFilter = document.getElementById("confirm-filter");
  const resetFilters = document.getElementById("reset-filters");
  const searchHomeState = document.getElementById("search-home-state");
  const searchHistoryList = document.getElementById("search-history-list");
  const clearSearchHistory = document.getElementById("clear-search-history");
  const searchScreen = document.querySelector(".search-screen");
  const params = new URLSearchParams(window.location.search);
  const filters = { sort: "default", time: "all", type: "all", status: "all", location: [] };
  const SEARCH_HISTORY_KEY = "campus-lost-found-search-history";

  keyword.value = params.get("keyword") || "";

  function readSearchHistory() {
    try {
      const saved = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      const history = saved ? JSON.parse(saved) : [];
      return Array.isArray(history) ? history.filter(Boolean).map(String) : [];
    } catch (error) {
      return [];
    }
  }

  function saveSearchTerm(value) {
    const term = value.trim();
    if (!term) return;
    const history = readSearchHistory().filter(item => item !== term);
    history.unshift(term);
    try {
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
    } catch (error) {
      // Search still works when localStorage is unavailable.
    }
  }

  function renderSearchHistory() {
    const history = readSearchHistory();
    searchHistoryList.innerHTML = history.length
      ? history.map(term => `<button type="button" data-search-term="${escapeHtml(term)}">${escapeHtml(term)}</button>`).join("")
      : '<p class="empty-search-history">暂无搜索记录</p>';
    searchHistoryList.querySelectorAll("[data-search-term]").forEach(button => {
      button.addEventListener("click", () => openSearchTerm(button.dataset.searchTerm));
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function openSearchTerm(term) {
    saveSearchTerm(term);
    window.location.href = `${window.location.pathname}?keyword=${encodeURIComponent(term)}`;
  }

  if (keyword.value.trim()) saveSearchTerm(keyword.value);

  const locationGroups = {
    图书馆: ["图书馆"],
    晋江楼: ["晋江楼"],
    教学区: ["中楼", "东一", "东二", "东三", "西一", "西二", "西三", "文一", "文二", "文三"],
    学院楼: ["机械学院", "机电学院", "电气学院", "车辆工程", "化学学院", "材料学院", "生工学院", "环安学院", "土木学院", "建筑学院"],
    餐厅: ["京元", "芙蓉园", "玫瑰园", "紫荆园", "牡丹园", "丁香园", "紫竹园", "茉莉园", "丹桂园", "百合园", "教工餐厅"],
    服务与公共设施: ["快递中心", "校医院", "福友阁", "青春广场", "素拓中心", "学生活动中心", "山北行政楼", "山南行政楼"],
    体育场馆: ["第一田径场", "第二田径场", "风雨操场"],
    宿舍区: ["一区学生公寓", "二区学生公寓", "三区学生公寓", "四区学生公寓", "五区学生公寓"]
  };
  function normalizeSearchText(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
  }

  function getKeywordScore(item, key) {
    const name = normalizeSearchText(item.name);
    const category = normalizeSearchText(item.category);
    let score = 0;

    // Names are the strongest signal: exact, prefix, then partial matches.
    if (name === key) score = Math.max(score, 1000);
    else if (name.startsWith(key)) score = Math.max(score, 850);
    else if (name.includes(key)) score = Math.max(score, 700);

    // Categories help users find a type of item without making location text count.
    if (category === key) score = Math.max(score, 600);
    else if (category.includes(key)) score = Math.max(score, 500);

    return score;
  }

  function locationMatches(item, values) {
    if (!values.length) return true;
    const location = String(item.location || "");
    const matchesGroup = group => group.some(place => location.includes(place));
    return values.some(value => {
      if (value === "其他") return !Object.values(locationGroups).some(matchesGroup);
      return locationGroups[value] ? matchesGroup(locationGroups[value]) : false;
    });
  }

  function typeMatches(item, value) {
    return value === "all" || item.type === value;
  }

  function statusMatches(item, value) {
    return value === "all" || item.status === value;
  }

  function getItemTime(item) {
    return CampusData.getItemDayTimestamp(item);
  }

  function timeMatches(item, value) {
    return CampusData.matchesTimeRange(item, value);
  }

  function render() {
    const key = normalizeSearchText(keyword.value);
    const hasKeyword = Boolean(key);
    searchHomeState.classList.toggle("hidden", hasKeyword);
    searchScreen.classList.toggle("is-search-home", !hasKeyword);

    if (!hasKeyword) {
      grid.innerHTML = "";
      resultsHeading.classList.add("hidden");
      noResults.classList.add("hidden");
      document.getElementById("search-suggestion").classList.add("hidden");
      clearKeyword.classList.add("hidden");
      renderSearchHistory();
      return;
    }

    let items = CampusData.readItems()
      .map(item => ({ item, score: getKeywordScore(item, key) }))
      .filter(result => result.score > 0)
      .filter(result => timeMatches(result.item, filters.time))
      .filter(result => typeMatches(result.item, filters.type))
      .filter(result => statusMatches(result.item, filters.status))
      .filter(result => locationMatches(result.item, filters.location));

    if (filters.sort === "newest") {
      items.sort((a, b) => getItemTime(b.item) - getItemTime(a.item) || b.score - a.score);
    } else if (filters.sort === "views") {
      items.sort((a, b) => (b.item.views || 0) - (a.item.views || 0) || b.score - a.score);
    } else {
      items.sort((a, b) => b.score - a.score || getItemTime(b.item) - getItemTime(a.item));
    }

    grid.innerHTML = items.map(result => CampusCard.itemCard(result.item)).join("");
    summary.textContent = `找到 ${items.length} 条相关结果`;
    resultsHeading.classList.remove("hidden");
    noResults.classList.toggle("hidden", items.length > 0);
    document.getElementById("search-suggestion").classList.remove("hidden");
    clearKeyword.classList.toggle("hidden", !keyword.value);
  }

  function setOverlay(open) {
    overlay.classList.toggle("hidden", !open);
    document.body.classList.toggle("filter-open", open);
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const term = keyword.value.trim();
    if (!term) {
      render();
      return;
    }
    saveSearchTerm(term);
    window.location.href = `${window.location.pathname}?keyword=${encodeURIComponent(term)}`;
  });
  keyword.addEventListener("input", () => {
    clearKeyword.classList.toggle("hidden", !keyword.value);
  });
  clearKeyword.addEventListener("click", () => {
    keyword.value = "";
    window.history.replaceState(null, "", window.location.pathname);
    render();
    keyword.focus();
  });
  clearSearchHistory.addEventListener("click", () => {
    window.localStorage.removeItem(SEARCH_HISTORY_KEY);
    renderSearchHistory();
  });
  document.querySelectorAll("#popular-search-list [data-search-term]").forEach(button => {
    button.addEventListener("click", () => openSearchTerm(button.dataset.searchTerm));
  });
  openFilter.addEventListener("click", () => setOverlay(true));
  closeFilter.addEventListener("click", () => setOverlay(false));
  filterScrim.addEventListener("click", () => setOverlay(false));
  confirmFilter.addEventListener("click", () => {
    setOverlay(false);
    render();
  });
  resetFilters.addEventListener("click", () => {
    Object.assign(filters, { sort: "default", time: "all", type: "all", status: "all", location: [] });
    document.querySelectorAll(".chip-group").forEach(group => {
      group.querySelectorAll(".chip").forEach((chip, index) => chip.classList.toggle("active", index === 0));
    });
    render();
  });

  document.querySelectorAll(".chip-group").forEach(group => {
    const name = group.dataset.filterGroup;
    group.querySelectorAll(".chip").forEach(chip => chip.addEventListener("click", () => {
      const value = chip.dataset.value;
      if (name !== "location") {
        filters[name] = value;
        group.querySelectorAll(".chip").forEach(option => option.classList.toggle("active", option === chip));
        return;
      }

      if (value === "all") {
        filters.location = [];
        group.querySelectorAll(".chip").forEach(option => option.classList.toggle("active", option === chip));
        return;
      }

      filters.location = filters.location.includes(value)
        ? filters.location.filter(selected => selected !== value)
        : [...filters.location, value];
      group.querySelector('[data-value="all"]').classList.toggle("active", filters.location.length === 0);
      chip.classList.toggle("active", filters.location.includes(value));
    }));
  });

  render();
})();
