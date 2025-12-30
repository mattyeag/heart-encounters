


// create property cards for each property record
function createPropertyCard(property) {

  // Determine badge text and color class
  const status = property.STATUS || '';
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
  // determine target page based on commercial/residential flags
  const id = property.ID != null ? property.ID : '';
  const isResidential = String(property.RESIDENTIAL || '').toLowerCase() === 'true';
  const targetPage = isResidential ? '/pages/resedential.html' : '/pages/commercial.html';

  const href = `${targetPage}?id=${encodeURIComponent(id)}`;

  return `
      <div class="property-card featured-card" data-status="${property.STATUS}">
      <a class="property-card-link" href="${href}" style="text-decoration:none;">
        <img src="${property.IMAGENAMES[0]}" alt="${property.TITLE}" class="property-image" />
        <div class="card-body">
          ${badgeText ? `<span class="status-badge ${badgeClass}">${badgeText}</span>` : ''}
          <h3 class="property-title">${property.TITLE}</h3>
        </div>
      </a>
      </div>
  `;
}


 async function renderProperties() {
  let propertyList;
  let data = sessionStorage.getItem("PROPERTY_DATA");
  if(data){
     propertyList = JSON.parse(data);
  }else{
    alert("error loading property data. Pleae refresh and try again")
    propertyList = [];
  }
  
  // render properties tagged as FEATURED 
  const container = document.getElementById("classes-list");
  container.innerHTML = propertyList.filter(prop => 
    prop.FEATURED.toLowerCase() === "true"
    && (prop.COMMERCIAL.toLowerCase() === "true"
    || prop.RESIDENTIAL.toLowerCase() === "true")
  ).map(createPropertyCard).join("");
}

//wait for property data to populate from main.js
function waitForPropertyData(interval = 700) {
  return new Promise(resolve => {
    const check = setInterval(() => {
      console.log("checking for property data...")
      if (sessionStorage.getItem("PROPERTY_DATA")) {
        clearInterval(check);
        resolve();
      }
    }, interval);
  });
}


async function renderPropertiesWhenDataReady() {
  await waitForPropertyData();
  renderProperties()
}

renderPropertiesWhenDataReady();


