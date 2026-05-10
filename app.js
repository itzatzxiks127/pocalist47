const cardList = document.getElementById("cardList");
const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");

const artistInput = document.getElementById("artistInput");
const albumSelect = document.getElementById("albumSelect");
const memberInput = document.getElementById("memberInput");

const nameInput = document.getElementById("nameInput");
const albumNameInput = document.getElementById("albumNameInput");
const sourceInput = document.getElementById("sourceInput");
const fileInput = document.getElementById("fileInput");

const frame = document.getElementById("frame");
const frameImg = document.getElementById("frameImg");

const detailInput = document.getElementById("detailInput");

const deleteBar = document.getElementById("deleteBar");
const deleteCount = document.getElementById("deleteCount");
// ===== 데이터 =====
let items = JSON.parse(localStorage.getItem("items")) || [];

let masterData = JSON.parse(localStorage.getItem("masterData")) || {};

if (!masterData || typeof masterData !== "object") {
  masterData = {};
  saveMaster();
}

let fileBase64 = "";
let currentGroup = "all";
let currentType = "all";
let deleteMode = false;
function saveMaster() {
  localStorage.setItem("masterData", JSON.stringify(masterData));
}
// ===== 저장 =====
function save() {
  localStorage.setItem("items", JSON.stringify(items));
}

// ===== 이미지 =====
fileInput.onchange = e => {

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = event => {

    const img = new Image();

    img.onload = () => {

      const canvas = document.createElement("canvas");

      // ⭐ 크기 줄이기
      const maxWidth = 300;

      const scale = maxWidth / img.width;

      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // ⭐ 압축
      fileBase64 = canvas.toDataURL(
        "image/jpeg",
        0.7
      );

    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
};

// ===== 모달 =====
addBtn.onclick = () => modal.classList.remove("hidden");
function closeModal(){ modal.classList.add("hidden"); }

// ===== 저장 =====
saveBtn.onclick = () => {
  items.unshift({
  name: nameInput.value,
  artist: artistInput.value,
  album: albumNameInput.value || "기타",
  member: memberInput.value,
  type: sourceInput.value,
  detail: detailInput.value || "기본",
  img: fileBase64 || "https://via.placeholder.com/150",
  selected: false
});

  save();
  render();
  closeModal();
};

// ===== 렌더 =====
function render(){
  cardList.innerHTML = "";

  let filtered = items.filter(i =>
    (currentGroup === "all" || i.artist === currentGroup) &&
    (currentType === "all" || i.type === currentType) &&
    (i.name + i.artist + i.member).toLowerCase().includes(searchInput.value.toLowerCase())
  );

  // 앨범별 묶기
const grouped = {};

filtered.forEach(i => {
  if (!grouped[i.album]) {
    grouped[i.album] = [];
  }

  grouped[i.album].push(i);
});

// 앨범 렌더
Object.keys(grouped).forEach(albumName => {

  const section = document.createElement("div");
  section.className = "album-section";

  const owned = grouped[albumName].filter(i => i.selected).length;
const total = grouped[albumName].length;

const isComplete = owned === total && total > 0;

  section.innerHTML = `
  <div class="album-title ${isComplete ? "complete" : ""}">
    <h2>${albumName}</h2>
    <span>
      ${owned} / ${total}
      ${isComplete ? "🔥 100%" : ""}
    </span>
  </div>

  <div class="album-row"></div>
`;

  const row = section.querySelector(".album-row");

  grouped[albumName].forEach(i => {

    const c = document.createElement("div");
    c.className = "card";

    if(i.selected){
      c.classList.add("selected");
    }

    c.innerHTML = `<img src="${i.img}">`;

    c.onclick = () => {

  if (deleteMode) {
    // 삭제 모드일 때: 선택만
    i.selected = !i.selected;
  } else {
    // 일반 모드일 때: 선택 토글 (기존 기능 유지)
    i.selected = !i.selected;
  }

  save();
  render();
};

    row.appendChild(c);
  });

  cardList.appendChild(section);
});

  renderGroupTabs(); // ✔ 이것만 쓰기
  renderTypeTabs();  // ✔ 이거도 따로 만들면 OK
}

// ===== 그룹 =====
function renderTabs(){
  const g = document.getElementById("groupTabs");
  g.innerHTML = "";

  ["all", ...new Set(items.map(i=>i.artist))].forEach(x=>{
    const b = document.createElement("button");
    b.textContent = x === "all" ? "전체" : x;
    b.onclick = ()=>{ currentGroup = x; render(); };
    g.appendChild(b);
  });

  const t = document.getElementById("typeTabs");
  t.innerHTML = "";

  ["all","앨범","특전","럭드","팬키트","시즌그리팅","미공포"].forEach(x=>{
    const b = document.createElement("button");
    b.textContent = x === "all" ? "전체" : x;
    b.onclick = ()=>{ currentType = x; render(); };
    t.appendChild(b);
  });
}

// ===== 프레임 =====
function openFrame(i){
  frameImg.src = i.img;
  frame.classList.remove("hidden");

  frame.onclick = () => {
    if(confirm("삭제?")){
      items = items.filter(x=>x!==i);
      save();
      render();
    }
    frame.classList.add("hidden");
  };
}
function renderGroupTabs(){
  const container = document.getElementById("groupTabs");
  if(!container) return;

  container.innerHTML = "";

  const groups = Object.keys(masterData);

  // 전체 버튼
  const allBtn = document.createElement("button");
  allBtn.textContent = "전체";
  allBtn.classList.add("tab-btn");

  allBtn.onclick = () => {
    currentGroup = "all";
    render();
  };

  container.appendChild(allBtn);

  // 그룹 버튼
  groups.forEach(group => {
    const btn = document.createElement("button");
    btn.textContent = group;
    btn.classList.add("tab-btn");

    btn.onclick = () => {
      currentGroup = group;
      render();
    };

    container.appendChild(btn);
  });
}

function renderTypeTabs(){
  const t = document.getElementById("typeTabs");
  if (!t) return;

  t.innerHTML = "";

  const types = ["all","앨범","특전","럭드","팬키트","시즌그리팅","미공포"];

  types.forEach(x=>{
    const b = document.createElement("button");
    b.textContent = x === "all" ? "전체" : x;
    b.onclick = ()=>{ currentType = x; render(); };
    t.appendChild(b);
  });
}
function deleteSelected(){
  if(!confirm("선택된 포카 삭제할까?")) return;

  items = items.filter(i => !i.selected);

  save();
  render();
}
function openAdmin(){
  document.getElementById("adminPanel").classList.remove("hidden");
  renderAdminOptions();
}

function closeAdmin(){
  document.getElementById("adminPanel").classList.add("hidden");
}
function addGroupUI(){
  const input = document.getElementById("newGroupInput");
  const name = input.value.trim();
  if(!name) return alert("그룹 입력");

  if(!masterData[name]){
    masterData[name] = {};
  }

  saveMaster();
  renderAdminOptions();
  renderGroupTabs();

  input.value = "";
}

function addAlbumUI(){
  const group = document.getElementById("groupSelect").value;
  const name = document.getElementById("newAlbumInput").value.trim();

  if(!group || !name) return alert("값 입력");

  if(!masterData[group]) masterData[group] = {};

  masterData[group][name] = [];

  saveMaster();
  renderAdminOptions();

  document.getElementById("newAlbumInput").value = "";
}

function addMemberUI(){
  const group = document.getElementById("groupSelect2").value;
  const album = document.getElementById("albumSelect2").value;
  const name = document.getElementById("newMemberInput").value.trim();

  if(!group || !album || !name) return alert("값 입력");

  if(!masterData[group]?.[album]) return;

  masterData[group][album].push(name);

  saveMaster();

  document.getElementById("newMemberInput").value = "";
}
function renderAdminOptions(){
  const groups = Object.keys(masterData);

  const groupSelect = document.getElementById("groupSelect");
  const groupSelect2 = document.getElementById("groupSelect2");

  groupSelect.innerHTML = "";
  groupSelect2.innerHTML = "";

  groups.forEach(g=>{
    groupSelect.innerHTML += `<option value="${g}">${g}</option>`;
    groupSelect2.innerHTML += `<option value="${g}">${g}</option>`;
  });

  updateAlbumSelect();
}

function updateAlbumSelect(){
  const g = document.getElementById("groupSelect2").value;

  const albumSelect2 = document.getElementById("albumSelect2");
  albumSelect2.innerHTML = "";

  if(!masterData[g]) return;

  Object.keys(masterData[g]).forEach(a=>{
    albumSelect2.innerHTML += `<option value="${a}">${a}</option>`;
  });
}
function deleteSelected(){
  const selectedCount = items.filter(i => i.selected).length;

  if(selectedCount === 0){
    alert("선택된 포카가 없어");
    return;
  }

  if(!confirm(`선택된 ${selectedCount}개 삭제할까?`)) return;

  items = items.filter(i => !i.selected);

  save();
  render();
}
function toggleDeleteMode() {
  deleteMode = !deleteMode;

  document.body.classList.toggle("delete-mode", deleteMode);

  if (deleteMode) {
    deleteBar.classList.remove("hidden");
  } else {
    deleteBar.classList.add("hidden");

    // 선택 초기화
    items.forEach(i => i.selected = false);
  }

  updateDeleteCount();
  render();
}
function updateDeleteCount() {
  const count = items.filter(i => i.selected).length;
  deleteCount.textContent = `${count}개 선택됨`;
}
function renderGroupOptions() {
  artistInput.innerHTML = `<option value="">그룹 선택</option>`;

  const groups = Object.keys(masterData);

  groups.forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    artistInput.appendChild(option);
  });
}
document.getElementById("groupSelect2").onchange = updateAlbumSelect;
// ===== 데이터 내보내기 =====
function exportData() {

  const data = {
    items,
    masterData
  };

  const json = JSON.stringify(data);

  const blob = new Blob([json], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;

  a.download = "pocalist-data.json";

  a.click();

  URL.revokeObjectURL(url);
}
// ===== 데이터 불러오기 =====
document.getElementById("importFile")
.addEventListener("change", e => {

  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = event => {

    try {

      const data = JSON.parse(event.target.result);

      items = data.items || [];
      masterData = data.masterData || {};

      save();
      saveMaster();

      render();

      alert("불러오기 완료!");

    } catch {
      alert("파일 오류");
    }

  };

  reader.readAsText(file);

});
// ===== 초기 =====
render();
renderGroupOptions(); // ⭐ 이거 추가ender();