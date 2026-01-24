// LOAD DATA

// class test data 

let allClasses = [];
let currentFilter = "all";


/// <summary>
/// Fetch class data from session storage and filter by status
/// </summary>
async function getClassData(filter){
  let currentFilter = filter || "all";
  try {
    const raw = sessionStorage.getItem("CLASS_DATA");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    allClasses = Array.isArray(parsed) ? parsed : [];
    const cf = String(currentFilter).toLowerCase();
    return allClasses.filter((x) => { 
      
      // gets all classes that match
      if (cf === "all") return true;                      
       
    });
  } catch (err) {
    console.error("getClassData error:", err);
    allClasses = [];
    return [];
  }
}



async function filterClasses(filter){
  currentFilter = filter;
  renderClasses(currentFilter);
}


/// <summary>
/// Create a property card HTML representation
/// </summary>
function createClassCard(property) {
  const imgSrc = (Array.isArray(property.IMAGENAMES) && property.IMAGENAMES[0]) ? property.IMAGENAMES[0] : 'assets/img/placeholder.png';
  const title = property.TITLE || '';
  const price = property.PRICE || '';
  const details = property.DETAILS || '';
  const id = property.ID != null ? property.ID : '';
  const status = property.STATUS || '';

  // Determine badge text and color class
  let badgeText = '';
  let badgeClass = '';

  switch (status) {
    case 'open':
      badgeText = 'Available';
      badgeClass = 'status-open';
      break;
    case 'closed':
      badgeText = 'Unavailable';
      badgeClass = 'status-closed';
      break;
    case 'soon':
      badgeText = 'Available Soon';
      badgeClass = 'status-soon';
      break;
    default:
      badgeText = '';
      badgeClass = '';
  }

  return `
    <div class="property-card" data-status="${status}" data-id="${id}">
      <img src="${imgSrc}" alt="${title}" class="property-image" />
      <div class="card-body">
        ${badgeText ? `<span class="status-badge ${badgeClass}">${badgeText}</span>` : ''}
        <h3 class="property-title">${title}</h3>
        <p class="property-price">${price}</p>
        <p class="property-details">${details}</p>
        <a href="#" class="property-link">View Details</a>
      </div>
    </div>
  `;
}


/// <summary>
/// Render properties based on the provided filter
/// </summary>
async function renderClasses(filter) {
  const classes = await getClassData(filter);
  const container = document.getElementById("classes-list");
  container.innerHTML = classes.map(createClassCard).join("");
  container.removeEventListener("click", cardClickHandler);
  container.addEventListener("click", cardClickHandler);
}

let modal, closeBtn, imgEl, counterEl, titleEl, priceEl, locationEl, descEl
let slideshowInterval = null;

/// <summary>
/// Initialize modal elements
/// </summary>
function initElements(){
   modal = document.getElementById("property-modal");
   closeBtn = document.querySelector(".close-btn");
   imgEl = document.getElementById("property-image");
   availabilityBadge = document.getElementById("availability-badge");
   titleEl = document.getElementById("property-title");
   priceEl = document.getElementById("property-price");
   descEl = document.getElementById("property-description");
   teacherNameEl = document.getElementById("property-teacher-name");
   teacherEmailEl = document.getElementById("property-teacher-email");
   locationEl = document.getElementById("property-location");
   detailEl = document.getElementById("property-class-detail");
   footnoteEl = document.getElementById("footnote");
}

let currentIndex = 0;

/// <summary>
/// Open modal with property details
/// </summary>
function openPropertyModal(property) {
  console.log("Opening modal for property:", property);
  if (!modal) return;
  titleEl && (titleEl.textContent = property.TITLE || '');
  priceEl && (priceEl.textContent = property.PRICE || '');
  detailEl && (detailEl.textContent = property.DETAILS || '');
  teacherNameEl && (teacherNameEl.textContent = property.TEACHER_NAME || '');
  teacherEmailEl && (teacherEmailEl.textContent = property.TEACHER_EMAIL || '');
  locationEl && (locationEl.textContent = property.LOCATION || '');
  descEl && (descEl.textContent = property.DESCRIPTION || '');  
  footnoteEl && (footnoteEl.textContent = property.FOOTNOTE || '');
  const images = Array.isArray(property.IMAGENAMES) ? property.IMAGENAMES : [];
  currentIndex = 0;
  updateImage(images);

  modal.style.display = "block";
}

function startSlideshow(images) {
  stopSlideshow(); // Clear if already running
  slideshowInterval = setInterval(() => {
    changeImage(images, 1); // Next image
     if (currentIndex === 0) {
      stopSlideshow();
    }
  }, 2000); // 3 seconds — adjust as desired
}

function stopSlideshow() {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }
}


/// <summary>
/// Update the displayed image and counter in the modal
/// </summary>
function updateImage(images) {
  if (!imgEl) return;
  if (!images || images.length === 0) {
    imgEl.src = 'assets/img/placeholder.png';
    return;
  }
  currentIndex = Math.max(0, Math.min(currentIndex, images.length - 1));
  imgEl.src = images[currentIndex] || 'assets/img/placeholder.png';
}

function changeImage(images, step) {
  if (!images || images.length === 0) return;
  currentIndex = (currentIndex + step + images.length) % images.length;
  updateImage(images);
}


/// <summary>
/// Set up filter buttons for property status
/// </summary>
function setupFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const status = (btn.dataset.status || "all").toLowerCase();
      buttons.forEach(b => b.classList.toggle("active", (b.dataset.status || "").toLowerCase() === status));
      filterClasses(status);
    });
  });
}


/// <summary>
/// Load the modal content
/// </summary>
async function loadModal(){
  try {
    const modalHTML = await fetch('/partials/property-details-card.html').then(res => res.text());
    const placeholder = document.getElementById('property-details');
    if (placeholder) placeholder.innerHTML = modalHTML;
  } catch (err) {
    console.error("loadModal failed:", err);
  }
}

function cardClickHandler(e) {
  const card = e.target.closest(".property-card");
  if (!card) return;
  const idAttr = card.getAttribute("data-id");
  const property = allClasses.find((p) => String(p.ID) === String(idAttr));
  if (property) {
    openPropertyModal(property);
  }
}


async function initializeModal(){
  await loadModal().then(()=>{
    initElements();
    if (closeBtn && modal) {
      closeBtn.onclick = () => {
        stopSlideshow();
        modal.style.display = "none"
      };
    } else {
      console.warn("Modal or close button not found yet");
    }

    // Optional: close if clicking outside
    window.onclick = (e) => {
      if (modal && e.target == modal) {
        stopSlideshow();
        modal.style.display = "none";
      }
    };
  });
}

/// Initialize filters and render classes

function waitForClassData(interval = 700) {
  return new Promise(resolve => {
    const check = setInterval(() => {
      console.log("checking for class data...")
      if (sessionStorage.getItem("CLASS_DATA")) {
        clearInterval(check);
        resolve();
      }
    }, interval);
  });
}


async function runClasses(){
  if(!sessionStorage.getItem("CLASS_DATA")){
    await waitForClassData();
  }
  setupFilters();
  renderClasses(currentFilter).catch((err) => console.error("renderClasses failed:", err));
}

async function run(){
  await runClasses();
  await initializeModal();
  const params = new URLSearchParams(window.location.search || '');
  const selectedId = params.get('id');
  if (selectedId) {
    const card = document.querySelector(`.property-card[data-id="${selectedId}"]`);
    if (card) {
      cardClickHandler({target: card});
    }
  }
}


run();