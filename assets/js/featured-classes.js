


// create class cards for each class
function createClassCard(classItem) {

  // Determine badge text and color class
  const status = classItem.STATUS || '';
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
  const id = classItem.ID != null ? classItem.ID : '';
  
  // const isResidential = String(classItem.RESIDENTIAL || '').toLowerCase() === 'true';
  // const targetPage = isResidential ? '/pages/resedential.html' : '/pages/commercial.html';
  // update to class page when ready
  const targetPage = '#';
  
  
  const href = `${targetPage}?id=${encodeURIComponent(id)}`;
  return `
      <div class="property-card featured-card" data-status="${classItem.STATUS}">
      <a class="property-card-link" href="${href}" style="text-decoration:none;">
        <img src="${classItem.IMAGENAMES[0]}" alt="${classItem.TITLE}" class="property-image" />
        <div class="card-body">
          ${badgeText ? `<span class="status-badge ${badgeClass}">${badgeText}</span>` : ''}
          <h3 class="property-title">${classItem.TITLE}</h3>
        </div>
      </a>
      </div>
  `;
}


 async function renderClassList() {
  let classList;
  let data = sessionStorage.getItem("CLASS_DATA");
  if(data){
     classList = JSON.parse(data);
  }else{
    alert("error loading classes data. Pleae refresh and try again")
    classList = [];
  }
  
  // render classes tagged as FEATURED 
  const container = document.getElementById("classes-list");
  container.innerHTML = classList.filter(classItem =>
    classItem.FEATURED.toLowerCase() === "true"
    && (classItem.STATUS.toLowerCase() !== "inactive")
  ).map(createClassCard).join("");
}

//wait for class data to populate from main.js
function waitForClassListData(interval = 700) {
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


async function renderClassListWhenDataReady() {
  await waitForClassListData();
  renderClassList();
}

renderClassListWhenDataReady();


