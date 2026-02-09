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
    const cartItems = await getCartItems();
    document.querySelector(".cart-badge").classList.toggle("active", cartItems.length == 0);
    const cart = document.getElementById("cart-img-container");
    cart.addEventListener("click", () => {
        alert("Cart coming soon!");
    });
    
}


document.addEventListener("DOMContentLoaded", waitForHeader);
 
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