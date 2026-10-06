/* A 模块先使用本地示例数据；B 同学接入 localStorage 时保持同样的字段结构。 */
(function () {
  const ITEMS_STORAGE_KEY = "campus-lost-found-items";
  const PROFILE_STORAGE_KEY = "campus-lost-found-profile";
  const VIEWED_ITEMS_STORAGE_KEY = "campus-lost-found-viewed-items";
  const FAVORITES_STORAGE_KEY = "campus-lost-found-favorites";
  const DEFAULT_MY_POSTS_VERSION = 2;
  const DEFAULT_ACTIVITY_VERSION = 1;
  const PHONE_REGEX = /^1[3-9]\d{9}$/;
  const itemCategories = ["证件", "数码", "钥匙", "生活用品", "书籍", "其他"];
  const categoryAliases = {
    "电子产品": "数码",
    "日用品": "生活用品"
  };
  const campusLocations = [
    "图书馆", "晋江楼", "中楼", "东一", "东二", "东三", "西一", "西二", "西三", "文一", "文二", "文三",
    "机械学院", "机电学院", "电气学院", "车辆工程", "化学学院", "材料学院", "生工学院", "环安学院", "土木学院", "建筑学院",
    "京元", "芙蓉园", "玫瑰园", "紫荆园", "牡丹园", "丁香园", "紫竹园", "茉莉园", "丹桂园", "百合园", "教工餐厅",
    "快递中心", "校医院", "福友阁", "青春广场", "素拓中心", "学生活动中心", "山北行政楼", "山南行政楼",
    "第一田径场", "第二田径场", "风雨操场",
    "一区学生公寓", "二区学生公寓", "三区学生公寓", "四区学生公寓", "五区学生公寓", "其他"
  ];
  const LEGACY_SEED_ITEM_IDS = new Set([
    "lost-card-001", "found-card-002", "found-card-003",
    "lost-umbrella-001", "found-earphone-001", "found-cup-001"
  ]);
  const SEED_IMAGE_PREFIX = "assets/seed-items/";

  const seedItems = [
    { id: "seed-id-card-found", type: "found", name: "身份证", category: "证件", location: "图书馆", locationDetail: "一楼服务台附近", description: "在图书馆一楼服务台旁捡到一张身份证，证件已妥善保管，请本人核对姓名和出生日期后领取。", contact: "15915331238", images: [`${SEED_IMAGE_PREFIX}id-card.jpg`], imageClass: "icon-blue", status: "active", publisher: "陈同学", views: 36, createdAt: "2026-10-06T12:18:00+08:00" },
    { id: "seed-white-earbuds-lost", type: "lost", name: "白色无线耳机", category: "数码", location: "东二", locationDetail: "二楼 205 教室靠窗座位", description: "白色入耳式无线耳机和充电盒一起遗失，充电盒右下角有一道浅划痕。", contact: "15915331239", images: [], imageClass: "icon-blue", status: "active", publisher: "许同学", views: 52, createdAt: "2026-10-06T10:46:00+08:00" },
    { id: "seed-keys-found", type: "found", name: "钥匙", category: "钥匙", location: "快递中心", locationDetail: "入口右侧取件架旁", description: "捡到一串带蓝色门禁扣和黑色小挂件的钥匙，共有两把金属钥匙。", contact: "15915331240", images: [`${SEED_IMAGE_PREFIX}keys.jpg`], imageClass: "icon-blue", status: "active", publisher: "吴同学", views: 41, createdAt: "2026-10-06T08:32:00+08:00" },
    { id: "seed-campus-card-lost", type: "lost", name: "校园卡", category: "证件", location: "青春广场", locationDetail: "靠近东侧长椅", description: "黄色卡套校园卡，挂有蓝色挂绳，可能在青春广场休息时遗失。", contact: "15915331241", images: [`${SEED_IMAGE_PREFIX}campus-card.jpg`], imageClass: "icon-blue", status: "active", publisher: "黄同学", views: 68, createdAt: "2026-10-06T06:55:00+08:00" },
    { id: "seed-wireless-mic-found", type: "found", name: "无线麦克风", category: "数码", location: "学生活动中心", locationDetail: "一楼排练室门口", description: "黑色 RODE 无线麦克风发射器，外壳贴有透明胶带，已交至活动中心值班台。", contact: "15915331242", images: [`${SEED_IMAGE_PREFIX}wireless-microphone.jpg`], imageClass: "icon-blue", status: "active", publisher: "拾光志愿者", views: 87, createdAt: "2026-10-05T18:25:00+08:00" },
    { id: "seed-student-card-lost", type: "lost", name: "学生证", category: "证件", location: "晋江楼", locationDetail: "四楼自习区", description: "深红色福州大学学生证，可能夹在复习资料中遗失，请捡到的同学联系我。", contact: "15915331243", images: [`${SEED_IMAGE_PREFIX}student-card.jpg`], imageClass: "icon-blue", status: "active", publisher: "郑同学", views: 73, createdAt: "2026-10-04T14:10:00+08:00" },
    { id: "seed-orange-umbrella-lost", type: "lost", name: "橙色雨伞", category: "生活用品", location: "京元", locationDetail: "一楼靠近餐具回收处", description: "橙灰拼色折叠伞，黑色伞柄，收伞带上有小方形装饰扣。", contact: "15915331244", images: [`${SEED_IMAGE_PREFIX}orange-umbrella.jpg`], imageClass: "icon-blue", status: "active", publisher: "林同学", views: 94, createdAt: "2026-10-02T12:40:00+08:00" },
    { id: "seed-plush-found", type: "found", name: "玩偶", category: "其他", location: "第二田径场", locationDetail: "看台入口台阶旁", description: "捡到一个棕色小熊玩偶，戴浅蓝色睡帽并抱着一只小熊，外观干净。", contact: "15915331245", images: [`${SEED_IMAGE_PREFIX}plush-toy.jpg`], imageClass: "icon-blue", status: "active", publisher: "罗同学", views: 119, createdAt: "2026-09-30T16:05:00+08:00" },
    { id: "seed-campus-card-found", type: "found", name: "校园卡", category: "证件", location: "玫瑰园", locationDetail: "二楼靠窗餐桌", description: "在餐桌下捡到一张校园卡，卡面没有卡套，请本人提供姓名和学号后领取。", contact: "15915331246", images: [], imageClass: "icon-blue", status: "active", publisher: "谢同学", views: 132, createdAt: "2026-09-22T11:20:00+08:00" },
    { id: "seed-black-earphones-lost", type: "lost", name: "黑色耳机", category: "数码", location: "图书馆", locationDetail: "三楼东侧自习区", description: "黑色入耳式无线耳机，配黑色充电盒，盒体正面有一枚绿色指示灯。", contact: "15915331247", images: [`${SEED_IMAGE_PREFIX}black-earphones.jpg`], imageClass: "icon-blue", status: "active", publisher: "彭同学", views: 158, createdAt: "2026-09-05T19:35:00+08:00" },
    { id: "seed-purple-earphones-lost", type: "lost", name: "紫色耳机", category: "数码", location: "风雨操场", locationDetail: "西侧观众席第三排", description: "浅紫色入耳式无线耳机，配同色充电盒，耳机表面有黑色扬声器开孔。", contact: "15915331248", images: [`${SEED_IMAGE_PREFIX}purple-earphones.jpg`], imageClass: "icon-blue", status: "completed", publisher: "苏同学", views: 205, createdAt: "2026-08-13T17:50:00+08:00" },
    { id: "seed-ebike-key-lost", type: "lost", name: "电动车钥匙", category: "钥匙", location: "一区学生公寓", locationDetail: "8 号楼门口停车区", description: "粉色电动车钥匙，带粉色卡套、编织挂绳和小猪造型挂件。", contact: "15915331249", images: [`${SEED_IMAGE_PREFIX}ebike-key.jpg`], imageClass: "icon-blue", status: "active", publisher: "方同学", views: 77, createdAt: "2026-07-16T09:15:00+08:00" },
    { id: "seed-english-book-found", type: "found", name: "英文书", category: "书籍", location: "文一", locationDetail: "102 教室讲台下方", description: "英文原版《Mindset》，白色封面，书中夹有几张蓝色便利贴。", contact: "15915331250", images: [`${SEED_IMAGE_PREFIX}english-book.jpg`], imageClass: "icon-blue", status: "active", publisher: "高同学", views: 63, createdAt: "2026-06-23T15:30:00+08:00" },
    { id: "seed-calculus-book-found", type: "found", name: "高数书", category: "书籍", location: "中楼", locationDetail: "一楼公共休息区", description: "同济大学《高等数学》第八版上册，绿色封面，扉页写有部分课堂笔记。", contact: "15915331251", images: [`${SEED_IMAGE_PREFIX}calculus-book.jpg`], imageClass: "icon-blue", status: "completed", publisher: "叶同学", views: 186, createdAt: "2026-05-31T13:45:00+08:00" },
    { id: "seed-data-structure-book-lost", type: "lost", name: "数据结构课本", category: "书籍", location: "西二", locationDetail: "304 教室中间座位", description: "数据结构教材，绿色封面，内页有大量黑色笔记，书后夹着一张实验安排表。", contact: "15915331252", images: [], imageClass: "icon-blue", status: "active", publisher: "戴同学", views: 102, createdAt: "2026-05-08T20:10:00+08:00" },
    { id: "seed-discrete-math-book-found", type: "found", name: "离散数学课本", category: "书籍", location: "电气学院", locationDetail: "二楼连廊长椅", description: "高等教育出版社《离散数学》第三版，红色封面，已暂存在学院楼值班室。", contact: "15915331253", images: [`${SEED_IMAGE_PREFIX}discrete-math-book.jpg`], imageClass: "icon-blue", status: "active", publisher: "学院值班室", views: 149, createdAt: "2026-04-13T10:30:00+08:00" },
    { id: "seed-popmart-lost", type: "lost", name: "泡泡玛特", category: "其他", location: "紫荆园", locationDetail: "一楼北侧用餐区", description: "灰色泡泡玛特 DIMOO 毛绒玩偶，戴黑色毛绒帽并带有黑色钥匙扣。", contact: "15915331254", images: [`${SEED_IMAGE_PREFIX}popmart.jpg`], imageClass: "icon-blue", status: "active", publisher: "周同学", views: 238, createdAt: "2026-03-15T18:20:00+08:00" },
    { id: "seed-student-card-found", type: "found", name: "学生证", category: "证件", location: "校医院", locationDetail: "候诊区第二排座椅下", description: "捡到一本深红色学生证，已交给校医院一楼服务台保管。", contact: "15915331255", images: [], imageClass: "icon-blue", status: "completed", publisher: "校医院服务台", views: 264, createdAt: "2026-01-31T09:40:00+08:00" }
  ];
  const SEED_ITEM_IDS = new Set(seedItems.map(item => item.id));
  const defaultMyItems = [
    { id: "item-default-water-bottle", type: "lost", name: "水杯", category: "生活用品", location: "京元", locationDetail: "一楼靠窗餐桌", description: "白色小米保温杯，杯身细长，正面底部有米家标志，可能遗落在用餐区靠窗座位旁。", contact: "15915331237", images: [`${SEED_IMAGE_PREFIX}my-water-bottle.jpg`], imageClass: "icon-blue", status: "active", publisher: "小同学", publisherId: "current-user", views: 12, createdAt: "2026-10-04T14:24:00+08:00" },
    { id: "item-default-bead-keychain", type: "found", name: "拼豆挂件", category: "其他", location: "青春广场", locationDetail: "东侧长椅附近", description: "捡到一个蓝白配色的行字挂件，配有浅蓝色串珠挂绳，目前由本人妥善保管。", contact: "15915331237", images: [`${SEED_IMAGE_PREFIX}my-bead-keychain.jpg`], imageClass: "icon-blue", status: "active", publisher: "小同学", publisherId: "current-user", views: 8, createdAt: "2026-10-03T17:35:00+08:00" },
    { id: "item-default-earphones", type: "found", name: "耳机", category: "数码", location: "图书馆", locationDetail: "二楼自习区", description: "在图书馆二楼座位下捡到一副白色有线耳机，已与失主核对插头和线控特征并完成归还。", contact: "15915331237", images: [], imageClass: "icon-blue", status: "completed", publisher: "小同学", publisherId: "current-user", views: 21, createdAt: "2026-09-28T11:20:00+08:00" },
    { id: "item-default-black-cap", type: "lost", name: "帽子", category: "生活用品", location: "青春广场", locationDetail: "西侧步道长椅附近", description: "黑色棒球帽，帽身正面靠右位置有白色英文签名字样，帽檐较长，可能在晚间经过青春广场时遗失。", contact: "15915331237", images: [`${SEED_IMAGE_PREFIX}my-black-cap.jpg`], imageClass: "icon-blue", status: "completed", publisher: "小同学", publisherId: "current-user", views: 17, createdAt: "2026-09-18T20:10:00+08:00" }
  ];
  const DEFAULT_MY_ITEM_IDS = new Set(defaultMyItems.map(item => item.id));
  const DEFAULT_MY_ITEM_VERSIONS = {
    "item-default-water-bottle": 1,
    "item-default-bead-keychain": 1,
    "item-default-earphones": 1,
    "item-default-black-cap": 2
  };

  // The project has no account system yet, so localStorage represents one browser user.
  let memoryItems = null;
  const memoryViewedItems = new Set();
  const memoryFavorites = new Map();

  function readViewedItemIds() {
    try {
      const saved = window.localStorage.getItem(VIEWED_ITEMS_STORAGE_KEY);
      const ids = saved ? JSON.parse(saved) : [];
      return new Set(Array.isArray(ids) ? ids.map(String) : []);
    } catch (error) {
      return new Set(memoryViewedItems);
    }
  }

  function writeViewedItemIds(ids) {
    memoryViewedItems.clear();
    ids.forEach(id => memoryViewedItems.add(String(id)));
    try {
      window.localStorage.setItem(VIEWED_ITEMS_STORAGE_KEY, JSON.stringify([...ids]));
    } catch (error) {
      // Keep the in-memory fallback when localStorage is unavailable.
    }
  }

  function readFavoriteIds(userId) {
    const ownerId = String(userId || "current-user");
    try {
      const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!saved) return new Set(memoryFavorites.get(ownerId) || []);
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return new Set(parsed.map(String));
      const ids = parsed && Array.isArray(parsed[ownerId]) ? parsed[ownerId] : [];
      return new Set(ids.map(String));
    } catch (error) {
      return new Set(memoryFavorites.get(ownerId) || []);
    }
  }

  function writeFavoriteIds(userId, ids) {
    const ownerId = String(userId || "current-user");
    const values = [...ids].map(String);
    memoryFavorites.set(ownerId, values);
    try {
      const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      const favorites = Array.isArray(parsed) ? { "current-user": parsed } : (parsed || {});
      favorites[ownerId] = values;
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      // Keep the in-memory fallback when localStorage is unavailable.
    }
  }

  function writeItems(items) {
    memoryItems = items;
    try {
      window.localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // Keep the in-memory fallback when localStorage is unavailable.
    }
  }

  function normalizeLocation(location) {
    const raw = String(location || "").trim().replaceAll("京灵餐厅", "京元");
    const aliases = {
      "图书馆二楼": { name: "图书馆", detail: "二楼" },
      "中楼 301": { name: "中楼", detail: "301" },
      "中楼301": { name: "中楼", detail: "301" },
      "京元餐厅": { name: "京元", detail: "" },
      "东二教学楼": { name: "东二", detail: "" }
    };
    if (aliases[raw]) return aliases[raw];
    if (campusLocations.includes(raw)) return { name: raw, detail: "" };
    return { name: raw || "其他", detail: "" };
  }

  function normalizeCategory(category) {
    const value = String(category || "").trim();
    return categoryAliases[value] || (itemCategories.includes(value) ? value : "其他");
  }

  function isValidPhone(value) {
    return PHONE_REGEX.test(String(value || "").trim());
  }

  function getShanghaiParts(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date);
    return parts.reduce((result, part) => {
      if (part.type !== "literal") result[part.type] = part.value;
      return result;
    }, {});
  }

  function toShanghaiTimestamp(dateValue, referenceValue) {
    const day = String(dateValue || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return "";
    const reference = getShanghaiParts(referenceValue || new Date());
    if (!reference) return "";
    return `${day}T${reference.hour}:${reference.minute}:${reference.second}+08:00`;
  }

  function getItemTimestamp(item, nowValue) {
    const createdAt = new Date(item && item.createdAt).getTime();
    if (Number.isFinite(createdAt)) return createdAt;

    const label = String(item && item.date || "").trim();
    const timeMatch = label.match(/^(今天|昨天)\s+(\d{1,2}):(\d{2})$/);
    const dateMatch = label.match(/^(\d{1,2})月(\d{1,2})日(?:\s+(\d{1,2}):(\d{2}))?$/);
    const now = getShanghaiParts(nowValue || new Date());
    if (!now) return Number.NaN;

    if (timeMatch) {
      const baseDay = Date.UTC(Number(now.year), Number(now.month) - 1, Number(now.day));
      const target = new Date(baseDay - (timeMatch[1] === "昨天" ? 86400000 : 0));
      const day = `${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, "0")}-${String(target.getUTCDate()).padStart(2, "0")}`;
      return new Date(`${day}T${String(timeMatch[2]).padStart(2, "0")}:${timeMatch[3]}:00+08:00`).getTime();
    }
    if (dateMatch) {
      const hour = String(dateMatch[3] || "00").padStart(2, "0");
      const minute = dateMatch[4] || "00";
      return new Date(`${now.year}-${String(dateMatch[1]).padStart(2, "0")}-${String(dateMatch[2]).padStart(2, "0")}T${hour}:${minute}:00+08:00`).getTime();
    }
    return Number.NaN;
  }

  function getItemDayTimestamp(item, nowValue) {
    const itemTime = getItemTimestamp(item, nowValue);
    if (!Number.isFinite(itemTime)) return Number.NaN;
    const parts = getShanghaiParts(itemTime);
    if (!parts) return Number.NaN;
    return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
  }

  function formatItemDate(item, nowValue) {
    const fallback = String(item && item.date || "").trim();
    const itemTime = getItemTimestamp(item, nowValue);
    if (!Number.isFinite(itemTime)) return fallback;

    const itemParts = getShanghaiParts(itemTime);
    if (!itemParts) return fallback;
    return `${Number(itemParts.month)}月${Number(itemParts.day)}日`;
  }

  function getTimeRangeStart(range, nowValue) {
    const now = new Date(nowValue || Date.now());
    if (Number.isNaN(now.getTime())) return null;
    const parts = getShanghaiParts(now);
    if (!parts) return null;

    // Time filters use calendar days in Shanghai time rather than rolling hours.
    const day = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
    if (range === "week") day.setUTCDate(day.getUTCDate() - 6);
    if (range === "half-year") {
      const targetMonth = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 7, 1));
      const lastDay = new Date(Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth() + 1, 0)).getUTCDate();
      day.setUTCFullYear(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth(), Math.min(Number(parts.day), lastDay));
    }
    if (range !== "day" && range !== "week" && range !== "half-year") return null;

    const year = day.getUTCFullYear();
    const month = String(day.getUTCMonth() + 1).padStart(2, "0");
    const date = String(day.getUTCDate()).padStart(2, "0");
    return new Date(`${year}-${month}-${date}T00:00:00+08:00`);
  }

  function matchesTimeRange(item, range, nowValue) {
    if (range === "all") return true;
    const itemDay = getItemDayTimestamp(item, nowValue);
    const now = new Date(nowValue || Date.now());
    if (Number.isNaN(now.getTime())) return false;
    const start = getTimeRangeStart(range, now);
    const nowDay = getItemDayTimestamp({ createdAt: now.toISOString() }, now);
    if (!Number.isFinite(itemDay) || !start || !Number.isFinite(nowDay)) return false;
    return itemDay >= start.getTime() && itemDay <= nowDay;
  }

  function normalizeImages(images, allowSeedImages) {
    if (!Array.isArray(images)) return [];
    return images
      .filter(image => {
        if (typeof image !== "string") return false;
        const value = image.trim();
        const isBase64 = /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/]+={0,2}$/i.test(value);
        const isSeedImage = allowSeedImages
          && /^assets\/seed-items\/[a-z0-9-]+\.jpg$/i.test(value);
        return isBase64 || isSeedImage;
      })
      .map(image => image.trim())
      .slice(0, 3);
  }

  function normalizeItem(item) {
    const normalized = normalizeLocation(item.location);
    const isLocallyPublishedItem = String(item.id || "").startsWith("item-");
    const itemId = String(item.id || "");
    const images = normalizeImages(item.images, SEED_ITEM_IDS.has(itemId) || DEFAULT_MY_ITEM_IDS.has(itemId));
    return {
      ...item,
      location: normalized.name,
      locationDetail: item.locationDetail || normalized.detail,
      category: normalizeCategory(item.category),
      description: (item.description || "").replaceAll("京灵餐厅", "京元"),
      images,
      publisherId: item.publisherId || (isLocallyPublishedItem ? "current-user" : undefined)
    };
  }

  function readDefaultMyPostsVersion() {
    try {
      const profile = JSON.parse(window.localStorage.getItem(PROFILE_STORAGE_KEY) || "{}");
      return Number(profile.defaultMyPostsVersion) || 0;
    } catch (error) {
      return 0;
    }
  }

  function markDefaultMyPostsInitialized() {
    try {
      const profile = JSON.parse(window.localStorage.getItem(PROFILE_STORAGE_KEY) || "{}");
      profile.defaultMyPostsVersion = DEFAULT_MY_POSTS_VERSION;
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      // The in-memory defaults still work when localStorage is unavailable.
    }
  }

  function initializeDefaultActivity(items) {
    let profile;
    try {
      profile = JSON.parse(window.localStorage.getItem(PROFILE_STORAGE_KEY) || "{}");
    } catch (error) {
      profile = {};
    }
    if (Number(profile.defaultActivityVersion) >= DEFAULT_ACTIVITY_VERSION) return;

    const availableIds = new Set(items.map(item => item.id));
    const favoriteIds = [
      "item-default-water-bottle",
      "seed-campus-card-lost",
      "seed-plush-found"
    ].filter(id => availableIds.has(id));
    const viewedIds = [
      "item-default-bead-keychain",
      "seed-id-card-found",
      "seed-white-earbuds-lost",
      "seed-calculus-book-found"
    ].filter(id => availableIds.has(id));

    try {
      if (!window.localStorage.getItem(FAVORITES_STORAGE_KEY)) {
        writeFavoriteIds("current-user", new Set(favoriteIds));
      }
      if (!window.localStorage.getItem(VIEWED_ITEMS_STORAGE_KEY)) {
        writeViewedItemIds(new Set(viewedIds));
      }
      profile.defaultActivityVersion = DEFAULT_ACTIVITY_VERSION;
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      memoryFavorites.set("current-user", favoriteIds);
      viewedIds.forEach(id => memoryViewedItems.add(id));
    }
  }

  function readItems() {
    if (memoryItems) return memoryItems.map(normalizeItem);
    try {
      const saved = window.localStorage.getItem(ITEMS_STORAGE_KEY);
      if (saved) {
        const storedItems = JSON.parse(saved).map(normalizeItem);
        const storedById = new Map(storedItems.map(item => [item.id, item]));
        const retainedItems = storedItems.filter(item => !LEGACY_SEED_ITEM_IDS.has(item.id) && !SEED_ITEM_IDS.has(item.id));
        const currentDefaultMyPostsVersion = readDefaultMyPostsVersion();
        const needsDefaultMyItems = currentDefaultMyPostsVersion < DEFAULT_MY_POSTS_VERSION;
        const missingDefaultMyItems = needsDefaultMyItems
          ? defaultMyItems
            .filter(item => DEFAULT_MY_ITEM_VERSIONS[item.id] > currentDefaultMyPostsVersion && !storedById.has(item.id))
            .map(normalizeItem)
          : [];
        const refreshedSeeds = seedItems.map(seed => {
          const storedSeed = storedById.get(seed.id);
          return normalizeItem({
            ...seed,
            status: storedSeed ? storedSeed.status : seed.status,
            views: storedSeed ? storedSeed.views : seed.views
          });
        });
        const migratedItems = retainedItems.concat(missingDefaultMyItems, refreshedSeeds).map(normalizeItem);
        if (needsDefaultMyItems) markDefaultMyPostsInitialized();
        writeItems(migratedItems);
        initializeDefaultActivity(migratedItems);
        return migratedItems;
      }
    } catch (error) {
      console.warn("无法读取本地数据，将使用示例数据。", error);
    }
    const initialItems = defaultMyItems.concat(seedItems).map(normalizeItem);
    markDefaultMyPostsInitialized();
    writeItems(initialItems);
    initializeDefaultActivity(initialItems);
    return initialItems;
  }

  function getItemById(id) {
    return readItems().find(item => item.id === id) || null;
  }

  function getImageUrl(image) {
    const value = String(image || "").trim();
    if (/^data:image\/(?:jpeg|png|webp);base64,/i.test(value)) return value;
    if (!/^assets\/seed-items\/[a-z0-9-]+\.jpg$/i.test(value)) return "";
    return `${window.location.pathname.includes("/pages/") ? "../" : "./"}${value}`;
  }

  function getTypeLabel(type) { return type === "lost" ? "寻物" : "招领"; }
  function getStatusLabel(item) {
    if (item.status === "completed") return item.type === "lost" ? "已找到" : "已归还";
    return item.type === "lost" ? "寻找中" : "待认领";
  }

  function getCampusLocations() { return campusLocations.slice(); }
  function getItemCategories() { return itemCategories.slice(); }

  function createItem(input) {
    const values = input || {};
    const name = String(values.name || values.title || "").trim();
    const contact = String(values.contact || "").trim();
    if (!name || !isValidPhone(contact)) return null;

    const normalized = normalizeLocation(values.location);
    const images = normalizeImages(values.images);
    const item = {
      id: values.id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: values.type === "found" ? "found" : "lost",
      name,
      category: normalizeCategory(values.category),
      location: normalized.name,
      locationDetail: String(values.locationDetail || normalized.detail || "").trim(),
      description: String(values.description || "").trim(),
      contact,
      imageClass: values.imageClass || "icon-blue",
      icon: values.icon || "card",
      status: "active",
      publisher: String(values.publisher || "校园用户").trim(),
      publisherId: String(values.publisherId || "current-user").trim(),
      images,
      views: 0,
      createdAt: values.createdAt || new Date().toISOString()
    };

    writeItems([item, ...readItems()]);
    return item;
  }

  function getMyItems(publisherId) {
    const ownerId = String(publisherId || "current-user");
    return readItems()
      .filter(item => item.publisherId === ownerId)
      .map((item, index) => ({ item, index, day: getItemDayTimestamp(item) }))
      .sort((first, second) => {
        if (Number.isFinite(first.day) && Number.isFinite(second.day) && first.day !== second.day) return second.day - first.day;
        if (Number.isFinite(first.day) && !Number.isFinite(second.day)) return -1;
        if (!Number.isFinite(first.day) && Number.isFinite(second.day)) return 1;
        return first.index - second.index;
      })
      .map(entry => entry.item);
  }

  function updateMyProfile(profile) {
    const values = profile || {};
    const name = String(values.name || "").trim();
    const contact = String(values.contact || "").trim();
    if (contact && !isValidPhone(contact)) return false;
    const items = readItems();
    let updated = false;

    const updatedItems = items.map(item => {
      if (item.publisherId !== "current-user") return item;
      updated = true;
      return {
        ...item,
        publisher: name || item.publisher,
        contact: contact || item.contact
      };
    });

    // writeItems updates both the in-memory cache and the shared localStorage data.
    if (updated) writeItems(updatedItems);
    return true;
  }

  function updateItem(id, input, publisherId) {
    const itemId = String(id || "");
    const ownerId = String(publisherId || "current-user").trim();
    if (!itemId || ownerId !== "current-user") return null;

    const values = input || {};
    const items = readItems();
    const current = items.find(item => item.id === itemId);
    if (!current || current.publisherId !== "current-user") return null;

    const has = key => Object.prototype.hasOwnProperty.call(values, key);
    const next = { ...current };

    if (has("type") && (values.type === "lost" || values.type === "found")) {
      next.type = values.type;
    }
    if (has("name")) {
      const name = String(values.name || "").trim();
      if (name) next.name = name;
    }
    if (has("category")) next.category = normalizeCategory(values.category);
    if (has("description")) next.description = String(values.description || "").trim();
    if (has("contact")) {
      const contact = String(values.contact || "").trim();
      if (!isValidPhone(contact)) return null;
      next.contact = contact;
    }
    if (has("dateLabel") || has("date")) {
      const dateValue = String(has("dateLabel") ? values.dateLabel : values.date || "").trim();
      const createdAt = toShanghaiTimestamp(dateValue, current.createdAt);
      if (createdAt) {
        next.createdAt = createdAt;
        delete next.date;
      } else {
        next.date = dateValue;
      }
    }
    if (has("location")) {
      const normalized = normalizeLocation(values.location);
      next.location = normalized.name;
      if (!has("locationDetail") && normalized.detail) next.locationDetail = normalized.detail;
    }
    if (has("locationDetail")) next.locationDetail = String(values.locationDetail || "").trim();
    if (has("images")) {
      next.images = normalizeImages(values.images, DEFAULT_MY_ITEM_IDS.has(itemId));
    }

    const updatedItems = items.map(item => item.id === itemId ? next : item);
    writeItems(updatedItems);
    return next;
  }

  function updateStatus(id, status) {
    const itemId = String(id || "");
    const nextStatus = String(status || "");
    if (!itemId || !["active", "completed"].includes(nextStatus)) return null;

    const items = readItems();
    const item = items.find(entry => entry.id === itemId);
    if (!item) return null;

    const updatedItems = items.map(entry => entry.id === itemId
      ? { ...entry, status: nextStatus }
      : entry
    );
    writeItems(updatedItems);
    return updatedItems.find(entry => entry.id === itemId) || null;
  }

  function removeItemFromFavorites(itemId) {
    memoryFavorites.forEach((ids, ownerId) => {
      memoryFavorites.set(ownerId, ids.filter(id => String(id) !== itemId));
    });

    try {
      const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        window.localStorage.setItem(
          FAVORITES_STORAGE_KEY,
          JSON.stringify(parsed.filter(id => String(id) !== itemId))
        );
        return;
      }
      if (parsed && typeof parsed === "object") {
        Object.keys(parsed).forEach(ownerId => {
          if (Array.isArray(parsed[ownerId])) {
            parsed[ownerId] = parsed[ownerId].filter(id => String(id) !== itemId);
          }
        });
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch (error) {
      // Keep the in-memory fallback when localStorage is unavailable.
    }
  }

  function removeItemFromViewedHistory(itemId) {
    memoryViewedItems.delete(itemId);
    try {
      const saved = window.localStorage.getItem(VIEWED_ITEMS_STORAGE_KEY);
      if (!saved) return;
      const ids = JSON.parse(saved);
      if (Array.isArray(ids)) {
        window.localStorage.setItem(
          VIEWED_ITEMS_STORAGE_KEY,
          JSON.stringify(ids.filter(id => String(id) !== itemId))
        );
      }
    } catch (error) {
      // Keep the in-memory fallback when localStorage is unavailable.
    }
  }

  function deleteItem(id, publisherId) {
    const itemId = String(id || "");
    const ownerId = String(publisherId || "current-user");
    if (!itemId) return false;

    const items = readItems();
    const item = items.find(entry => entry.id === itemId);
    if (!item || item.publisherId !== ownerId) return false;

    writeItems(items.filter(entry => entry.id !== itemId));
    removeItemFromFavorites(itemId);
    removeItemFromViewedHistory(itemId);
    return true;
  }

  function getMyFavorites(userId) {
    return [...readFavoriteIds(userId)];
  }

  function isFavorite(id, userId) {
    return readFavoriteIds(userId).has(String(id || ""));
  }

  function toggleFavorite(id, userId) {
    const itemId = String(id || "");
    if (!itemId || !getItemById(itemId)) return null;

    const ids = readFavoriteIds(userId);
    const saved = !ids.has(itemId);
    if (saved) ids.add(itemId);
    else ids.delete(itemId);
    writeFavoriteIds(userId, ids);
    return saved;
  }

  function recordView(id) {
    const itemId = String(id || "");
    if (!itemId) return null;

    const items = readItems();
    const item = items.find(entry => entry.id === itemId);
    if (!item) return null;

    const viewedIds = readViewedItemIds();
    if (viewedIds.has(itemId)) return { ...item, added: false };

    const updatedItems = items.map(entry => entry.id === itemId
      ? { ...entry, views: (Number(entry.views) || 0) + 1 }
      : entry
    );
    writeItems(updatedItems);
    viewedIds.add(itemId);
    writeViewedItemIds(viewedIds);

    return { ...updatedItems.find(entry => entry.id === itemId), added: true };
  }

  window.CampusData = {
    readItems,
    getItemById,
    getImageUrl,
    getItemTimestamp,
    getItemDayTimestamp,
    formatItemDate,
    matchesTimeRange,
    toShanghaiTimestamp,
    getTypeLabel,
    getStatusLabel,
    getCampusLocations,
    getLocations: getCampusLocations,
    getItemCategories,
    isValidPhone,
    createItem,
    getMyItems,
    updateMyProfile,
    updateItem,
    updateStatus,
    deleteItem,
    getMyFavorites,
    isFavorite,
    toggleFavorite,
    recordView
  };
})();
