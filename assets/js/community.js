const page = document && document.body && document.body.dataset && document.body.dataset.page;
function createBusinessCard(business) {
  const id = business.ID || '';
  const name = business.NAME || '';
  const header = business.HEADER || '';
//   const details = business.DETAILS || '';
  const details = (business.DETAILS || '').slice(0, 50) + "...";
  const imageUrl = business.IMAGE || '';

  return `
    <div class="business-card" data-id="${id}">
      <div class="card-body">
        <h2 class="business-name">${name}</h2>
        ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="business-image" />` : ''}
        <h4 class="business-header">${header}</h4>
        <p class="business-details">${details}</p>
      </div>
    </div>
  `;
}

function renderBusinesses(businesses) {
  const container = document.getElementById("business-list");
  if (!container) return;
  // const page = document && document.body && document.body.dataset && document.body.dataset.page;
  let toRender = businesses || [];
  if (page === 'home') {
    toRender = toRender.filter(b => !!b.FEATURED);
  } else if (!page) {
    // Preserve previous behavior when data-page is not present
    if (!container.classList.contains('business-card-container')) {
      toRender = toRender.filter(b => !!b.FEATURED);
    }
  }

  container.innerHTML = (toRender || []).map(createBusinessCard).join("");

  container.querySelectorAll(".business-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      const business = (businesses || []).find(b => b.ID === id);
      // const page = document && document.body && document.body.dataset && document.body.dataset.page;
      // If we're on the home page, navigate to the community page with a query param so links are shareable
      
      if (page === 'home') {
        try {
          const target = `../pages/community.html?biz=${encodeURIComponent(id)}`;
          window.location.href = target;
          return;
        } catch (e) {
          console.warn('Failed to navigate to community page with query param:', e);
        }
      }

      showBusinessDetail(business);
    });
  });
}



function showBusinessDetail(business) {
  const detailSection = document.getElementById("selected-business-detail");
  // connect details partial
 let connectHTML = "";
  if (business.PHONE || business["WEB-LINK"] || business.EMAIL) {
    connectHTML = `
      <div class="business-connect">
        <h4 class="business-connect-title">Connect!</h4>
        <div class="business-connect-links">
          ${business.PHONE ? `<p><strong>Phone:</strong> ${business.PHONE}</p>` : ""}
          ${business.EMAIL ? `<p><strong>Email:</strong> <a href="mailto:${business.EMAIL}">${business.EMAIL}</a></p>` : ""}
          ${business["WEB-LINK"] ? `<p><strong>Website:</strong> <a href="${business["WEB-LINK"]}" target="_blank">${business.NAME}</a></p>` : ""}
        </div>
      </div>
    `;
  }
  // business details partial
  detailSection.innerHTML = `
    <div class="business-detail">
      <h2 class="business-detail-name">${business.NAME}</h2>
      ${business.IMAGE ? `<img src="${business.IMAGE}" alt="${business.NAME}" class="business-detail-image">` : ''}
      <h4 class="business-detail-header">${business.HEADER}</h4>
      <p class="business-detail-description">${business.DETAILS}</p>
      ${business.FULLDETAIL ? `<p class="business-full-detail">${business.FULLDETAIL}</p>` : ''}
      ${connectHTML}
      </div>
  `;
  // scroll to the top of the details section.
  const businessNameElem = detailSection.querySelector('.business-detail');
  if (businessNameElem) {
    businessNameElem.scrollIntoView({ behavior: "smooth" });
    return;
  }
}

function loadCachedBusinesses() {
  if (window.businessData && window.businessData.length > 0) {
    console.log("Using cached businessData");
    renderBusinesses(window.businessData);  
  } else {

  // Otherwise, check sessionStorage
  const cached = sessionStorage.getItem("BUSINESSES_DATA");
  if (cached) {
    console.log("Using cached business data from sessionStorage");
    const businesses = JSON.parse(cached);
    window.businessData = businesses;
    renderBusinesses(businesses);
  } else {
    console.warn("No cached business data found.");
    document.getElementById("business-list").innerHTML =
      "<p style='text-align:center;'>Business data not available. Please reload the site.</p>";
  }
  }
    // If we're on the community page and a biz param is present, show its detail.
    if (page === 'community') {
        const params = new URLSearchParams(window.location.search || '');
        const selectedId = params.get('biz');
        if (selectedId) {
          const biz = (window.businessData || []).find(b => b.ID === selectedId);
          if (biz) showBusinessDetail(biz);
        }
      }
}

// Data-loading helpers (from business.js)
async function getBusinessesData(){
  const url = window.config && window.config.businessesSheetUrl;
  if (!url) {
    console.warn('No businessesSheetUrl configured');
    return;
  }
  const cachedBusinessData = sessionStorage.getItem("BUSINESSES_DATA");
  if(!cachedBusinessData){
    console.log("fetching businesses");
    try{
      const response = await fetch(window.versionedUrl ? window.versionedUrl(url) : url);
      const csvText = await response.text();
      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });
      window.businessData = result.data || [];
      const bucket = window.config && window.config.image_bucket;
      if (bucket) {
        window.businessData.forEach(biz => {
          biz.IMAGE = `https://storage.googleapis.com/${bucket}/${biz.IMAGEFOLDER}/${biz.IMAGENAME}`;
        });
      }
      sessionStorage.setItem("BUSINESSES_DATA", JSON.stringify(window.businessData));
    } catch(err){
      console.error("Failed to load businesses:", err);
      window.businessData = [];
    }
  } else {
    console.log("Using cached business data from sessionStorage");
    window.businessData = JSON.parse(cachedBusinessData);
    return;
  }
}

// Wait for CONFIG_DATA to be populated by main.js (same approach as business.js)
function waitForCookie(interval = 700) {
  return new Promise(resolve => {
    const check = setInterval(() => {
      if (sessionStorage.getItem("CONFIG_DATA")) {
        clearInterval(check);
        resolve(); 
      }
    }, interval);
  });
}

async function renderBusinessesWhenReady() {
  // If we already have data in memory or session storage, use it
  if (window.businessData && window.businessData.length > 0) {
    renderBusinesses(window.businessData);
    return;
  }

  // Otherwise wait for config and fetch
  await waitForCookie();
  await getBusinessesData();
  renderBusinesses(window.businessData || []);
}

// Run once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Prefer cached/in-memory data if present
  if (window.businessData && window.businessData.length > 0) {
    loadCachedBusinesses();
  } else if (sessionStorage.getItem('BUSINESSES_DATA')) {
    loadCachedBusinesses();
  } else {
    
    //show the business detail after data is loaded if on the community page
    renderBusinessesWhenReady().then(() => {
      if (page === 'community') {
        const params = new URLSearchParams(window.location.search || '');
        const selectedId = params.get('biz');
        console.log("community page biz param:", selectedId);
        if (selectedId) {
          console.log("display biz detail: ", selectedId);
          // Use in-memory data if present, otherwise fall back to cached sessionStorage data.
          let biz;
          if (window.businessData && window.businessData.length) {
            biz = window.businessData.find(b => b.ID === selectedId);
          } else {
            try {
              const cached = sessionStorage.getItem('BUSINESSES_DATA');
              if (cached) {
                const businesses = JSON.parse(cached);
                window.businessData = businesses;
                renderBusinesses(businesses);
                biz = businesses.find(b => b.ID === selectedId);
              }
            } catch (e) {
              console.warn('Failed to read cached businesses:', e);
            }
          }
          if (biz) {
          showBusinessDetail(biz);
          }
        }
      }
    }).catch(e => {
      console.error("Error rendering businesses when ready:", e);
    });
  }
});
