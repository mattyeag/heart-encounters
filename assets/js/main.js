window.config = {};

window.versionedUrl = versionedUrl = (url) => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = now.getMinutes() < 30 ? '00' : '30';
  const version = `${hours}:${minutes}`;
  const hasQuery = url.includes('?');
  const separator = hasQuery ? '&' : '?';
  return `${url}${separator}v=${version}`;
}

async function getConfig(){
  console.log("fetching config..")
  try {
  const res = await fetch(versionedUrl("/assets/config.json"));
  const freshConfig = await res.json();
  window.config = freshConfig;
  sessionStorage.setItem("CONFIG_DATA", JSON.stringify(freshConfig));
  }catch{
    alert("error loading config");
    console.error("error loading config");
  }
}

async function loadPages() {
  // Load header
  const headerHTML = await fetch('/partials/header.html').then(res => res.text());
  document.getElementById('site-header').innerHTML = headerHTML;

  // Load footer
  const footerHTML = await fetch('/partials/footer.html').then(res => res.text());
  document.getElementById('site-footer').innerHTML = footerHTML;


  // After injecting header, attach event listener for hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Set attributes
  document.getElementById('year').textContent = new Date().getFullYear();

  //TODO: set tag line from sheetData not config
  setHomeTagline(window.config.home.tagline)

}

async function loadClassData() {
  const url = window.config.classesSheetUrl;
  const response = await fetch(url);
  const csvText = await response.text();
  let result;
  
    result = Papa.parse(csvText, {
      header: true,  
      skipEmptyLines: true,
    });
    if (result.errors && result.errors.length > 0) {
      console.error("error parsing sheet data");
      result.data = [];
    }
    
  
  if (result.data && result.data.length > 0) {
  result.data.forEach(x => {
    let images = x.IMAGENAMES.split(",").map(img => img.trim());
    let bucket = window.config.image_bucket;
    let imageUrls = images.map(img => {
      return `https://storage.googleapis.com/${bucket}/${x.IMAGEFOLDER}/${img}`;
    });
    x.IMAGENAMES = imageUrls;
  });
}
 let activeClasses = result.data.filter(x => x.STATUS.toLowerCase() !== "inactive");
 // store propery data in window and as cookie
  window.classData = activeClasses;
  sessionStorage.setItem("CLASS_DATA", JSON.stringify(activeClasses));
}



function sessionExpired(maxAgeMs = 5 * 60 * 1000) {
  const item = sessionStorage.getItem("SESSION_TIME");
  if (!item) return true;

  try {
    const parsed = JSON.parse(item);
    if (!parsed.storedAt) return true;
    const age = Date.now() - parsed.storedAt;
    console.log("session expired:", age > maxAgeMs)
    return age > maxAgeMs;
  } catch (e) {
    console.error("Error parsing sessionStorage item:", e);
    return true;
  }
}

function setHomeTagline(newTagline) {
  const taglineEl = document.getElementById("home-tagline");
  if (taglineEl) {
    taglineEl.textContent = newTagline;
  }
}

async function setupSession(needsRefresh) {
  if (typeof needsRefresh === 'undefined') {
    const classData = sessionStorage.getItem("CLASS_DATA");
    const configData = sessionStorage.getItem("CONFIG_DATA");
    const hasData = classData && configData;
    needsRefresh = !sessionStorage.getItem("SESSION_TIME") || !hasData || sessionExpired();
  }

  if (needsRefresh) {
    console.log("Session needs refresh → refreshing data");
    await refreshData();
    return;
  }

  // Load from sessionStorage into window state
  const classData = sessionStorage.getItem("CLASS_DATA");
  const configData = sessionStorage.getItem("CONFIG_DATA");
  try {
    window.config = JSON.parse(configData);
  } catch (e) {
    window.config = {};
    console.error("Failed to parse CONFIG_DATA in setupSession:", e);
  }
  try {
    window.classData = JSON.parse(classData);
  } catch (e) {
    window.classData = [];
    console.error("Failed to parse CLASS_DATA in setupSession:", e);
  }
  console.log("Session still valid → no refresh needed");
}

async function refreshData() {
  try{
  await getConfig()
  await loadClassData();
  sessionStorage.removeItem("BUSINESSES_DATA");
  sessionStorage.removeItem("CLASS_REVIEW_DATA");

  sessionStorage.setItem("SESSION_TIME", JSON.stringify({ storedAt: Date.now() }));
  } catch(e){
    console.error("error refreshing data", e);
    sessionStorage.removeItem("SESSION_TIME");
  }
}

window.isSessionExpired = sessionExpired

// Run on page load
async function initPages() {
    const classData = sessionStorage.getItem("CLASS_DATA");
    const configData = sessionStorage.getItem("CONFIG_DATA");
    const hasData = classData && configData;
    const needsRefresh = !sessionStorage.getItem("SESSION_TIME") || !hasData || sessionExpired();

    if (needsRefresh) {
      console.log("Clearing stale session data");
      window.classData = null;
      window.businessData = null;
      sessionStorage.removeItem("BUSINESSES_DATA");
      sessionStorage.removeItem("CLASS_REVIEW_DATA");
    }

    await setupSession(needsRefresh);    
    await loadPages();
}


initPages()