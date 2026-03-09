// check for local storage CART_ITEMS, if not set to empty array 
async function getCartItems() {
    let cartItems = JSON.parse(localStorage.getItem("CART_ITEMS"));
    console.log("cart items from localStorage:", cartItems);
    if (!cartItems) {
        cartItems = [];
            localStorage.setItem("CART_ITEMS", JSON.stringify(cartItems));
    }
    return cartItems;
}



async function run() {
    refreshCartBadge();
    const cart = document.getElementById("cart-img-container");
    cart.addEventListener("click", () => {
        window.location.href = "pages/checkout-cart.html";
    });  
     
}

async function refreshCartBadge() {
    const cartItems = await getCartItems();
    if(cartItems !== null){
        document.querySelector(".cart-badge").classList.toggle("active", cartItems.length > 0);
    }
}


document.addEventListener("DOMContentLoaded", waitForHeader);

window.refreshCartBadge = refreshCartBadge;

function waitForHeader() {
    let x = 0;
    const interval = setInterval(() => {
        if (x > 10) {
            console.warn("card failed to load");
            clearInterval(interval);
            return;
        }
        if (window.headerLoaded) {
            console.log("Header loaded, initializing cart...");
            clearInterval(interval);
            run();
        } 
        x++;
    }, 500);
}