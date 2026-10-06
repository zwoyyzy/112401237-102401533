(function () {
  "use strict";
  var form = document.getElementById("edit-form");
  if (!form || !window.CampusData) return;
  var id = new URLSearchParams(window.location.search).get("id");
  var item = typeof CampusData.getItemById === "function" ? CampusData.getItemById(id) : null;
  var message = document.getElementById("edit-form-message");
  var allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!item || item.publisherId !== "current-user") { message.textContent = "无法编辑这条发布信息。"; return; }
  function field(name) { return form.elements[name]; }
  function setField(name, value) { if (field(name)) field(name).value = value || ""; }
  setField("title", item.name); setField("category", item.category); setField("description", item.description); setField("location", item.location); setField("locationDetail", item.locationDetail); setField("contact", item.contact);
  var locationLabel = form.querySelector("[data-location-label]");
  if (locationLabel && item.location) locationLabel.textContent = item.location;
  var locationTrigger = form.querySelector(".location-trigger");
  if (locationTrigger && item.location) locationTrigger.classList.add("has-value");
  var type = form.querySelector('[name="type"][value="' + item.type + '"]'); if (type) type.checked = true;
  setField("date", String(item.createdAt || "").slice(0, 10));
  function readDataUrl(file) { return new Promise(function (resolve, reject) { var reader = new FileReader(); reader.onload = function () { resolve(reader.result); }; reader.onerror = reject; reader.readAsDataURL(file); }); }
  function showSlot(slot, data) { var image = document.createElement("img"); image.src = data; image.alt = "已选择的物品图片"; slot.classList.add("has-image"); slot.appendChild(image); var remove = document.createElement("button"); remove.type = "button"; remove.className = "image-remove"; remove.setAttribute("aria-label", "删除这张图片"); remove.textContent = "×"; remove.addEventListener("click", function (event) { event.preventDefault(); event.stopPropagation(); var input = slot.querySelector("input[data-image-slot]"); if (input) input.value = ""; image.remove(); remove.remove(); slot.classList.remove("has-image"); }); slot.appendChild(remove); }
  function bindSlot(input) { var slot = input.closest(".image-upload-slot"); slot.addEventListener("click", function (event) { if (event.target === input || event.target.closest(".image-remove")) return; input.click(); }); input.addEventListener("change", function () { var file = input.files && input.files[0]; if (!file) return; if (!allowed.includes(file.type)) { input.value = ""; message.textContent = "只能选择图片文件"; return; } var old = slot.querySelector("img"); if (old) old.remove(); var oldRemove = slot.querySelector(".image-remove"); if (oldRemove) oldRemove.remove(); showSlot(slot, URL.createObjectURL(file)); }); }
  var inputs = Array.prototype.slice.call(form.querySelectorAll("[data-image-slot]"));
  if (window.MemberBPublish && typeof window.MemberBPublish.renderLocations === "function") window.MemberBPublish.renderLocations();
  inputs.forEach(function (input, index) { bindSlot(input); if (item.images && item.images[index]) showSlot(input.closest(".image-upload-slot"), CampusData.getImageUrl(item.images[index]) || item.images[index]); });
  form.addEventListener("submit", async function (event) { event.preventDefault(); var contact = String(field("contact").value || "").trim(); var contactError = form.querySelector('[data-error="contact"]'); if (contactError) contactError.textContent = ""; if (!CampusData.isValidPhone(contact)) { if (contactError) contactError.textContent = "请输入正确的11位手机号"; message.textContent = "请检查手机号码。"; field("contact").focus(); return; } if (typeof CampusData.updateItem !== "function") { message.textContent = "公共数据模块尚未提供编辑接口，请先同步队友代码。"; return; } var images = []; for (var i = 0; i < inputs.length; i += 1) { var file = inputs[i].files && inputs[i].files[0]; var existing = inputs[i].closest(".image-upload-slot").querySelector("img"); if (file) images.push(await readDataUrl(file)); else if (existing && item.images && item.images[i]) images.push(item.images[i]); } var updated = CampusData.updateItem(id, { type: field("type").value, name: field("title").value, category: field("category").value, description: field("description").value, location: field("location").value, locationDetail: field("locationDetail").value, date: field("date").value, contact: contact, images: images }, "current-user"); if (!updated) { message.textContent = "保存失败，请稍后重试。"; return; } window.location.href = "./profile.html"; });
})();
