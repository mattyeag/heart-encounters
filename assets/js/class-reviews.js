function createReviewCard(review) {
  const stars = "\u2605".repeat(review.STARS) + "\u2606".repeat(5 - review.STARS);
  return `
    <div class="review-card">
      <p class="review-quote">“${review.TEXT}”</p>
      <div class="review-rating">${stars}</div>
      <p class="review-author">— ${review.NAME}</p>
    </div>
  `;
}

async function renderReviews(reviews) {
    const container = document.querySelector(".classes-reviews");
    container.innerHTML = reviews.map(createReviewCard).join("");
}


async function getReviewsData(){
  console.log("loading customer reviews..");
  const url = window.config.customerReviewsUrl;
  const cachedReviewData = sessionStorage.getItem("CUSTOMER_REVIEW_DATA");
  if(!cachedReviewData){
    try{
      const response = await fetch(window.versionedUrl(url));
      const csvText = await response.text();
      const result = Papa.parse(csvText, {
        header: true,  
        skipEmptyLines: true,
      });
    
    // store propery data in window and as cookie
      window.customerReviews = result.data || [];
      sessionStorage.setItem("CUSTOMER_REVIEW_DATA", JSON.stringify(window.customerReviews));
    } catch(err){
      console.error("Failed to load reviews:", err);
      window.customerReviews = [];  
    }
  } else {
    window.customerReviews = JSON.parse(cachedReviewData);
    return;
  }
}



//wait for property data to populate from main.js
function waitForCookie(interval = 700) {
  return new Promise(resolve => {
    const check = setInterval(() => {
      console.log("checking for customer review data...")
      if (sessionStorage.getItem("CONFIG_DATA")) {
        clearInterval(check);
        resolve();
      }
    }, interval);
  });
}


async function renderReviewsWhenReady() {
  await waitForCookie();
  await getReviewsData();
  renderReviews(window.customerReviews);
}

renderReviewsWhenReady();
