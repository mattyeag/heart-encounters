



async function renderCartItems(items) {
  console.log("running cart checkout js")
  const container = document.getElementById("cart-items");
  if (!container) return;
  // clear existing items
  container.innerHTML = "";

  items.forEach(item => {

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.dataset.itemId = item.ID;
    const imageUrl = item.IMAGENAMES?.[0] || "assets/images/placeholder.png";

    cartItem.innerHTML = `
      <div class="item-thumbnail">
        <img src="${imageUrl}" alt="${item.TITLE}">
      </div>

      <div class="item-summary">
        <div class="item-header">
          <h3 class="item-name">${item.TITLE}</h3>

          <div class="item-actions">
            <a class="remove-item" data-id="${item.ID}">Remove</a>
          </div>
        </div>

        <div class="item-details">
          <h3 class="item-name">item details</h3>
          <p class="item-description">${item.DESCRIPTION || "No description available."}</p>
        </div>
      </div>
      
    `;

    container.appendChild(cartItem);

  });

}


async function getCartItems() {
    let cartItems = JSON.parse(localStorage.getItem("CART_ITEMS"));
    if (!cartItems) {
        cartItems = [];
            localStorage.setItem("CART_ITEMS", JSON.stringify(cartItems));
    }
    return cartItems;
}


async function removeCartItem(itemId) {
  let cartItems = JSON.parse(localStorage.getItem("CART_ITEMS")) || [];
  cartItems = cartItems.filter(item => item.ID != itemId);
  localStorage.setItem("CART_ITEMS", JSON.stringify(cartItems));
  renderCartItems(cartItems);
}


async function initRemoveButton() {
  document.getElementById("cart-items").addEventListener("click", (e) => {

  if (e.target.classList.contains("remove-item")) {

    const itemId = e.target.dataset.id;

    let cartItems = JSON.parse(localStorage.getItem("CART_ITEMS")) || [];

    cartItems = cartItems.filter(item => item.ID != itemId);

    localStorage.setItem("CART_ITEMS", JSON.stringify(cartItems));
    console.log("refreshing cart badge after item removal");
    window.refreshCartBadge();

    renderCartItems(cartItems);

  }

});
}


document.addEventListener("DOMContentLoaded", ()=>{
  getCartItems().then(items => {
    renderCartItems(items);
  }).then(() => {
    initRemoveButton();
  });
});