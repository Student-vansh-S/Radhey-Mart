// Theme toggle (persist using localStorage)
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") document.body.classList.add("light");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
});

// Cart counter + toast
let cartCount = 0;
const cartCountEl = document.getElementById("cartCount");
const toastEl = document.getElementById("monoToast");
const toastMsg = document.getElementById("toastMsg");
const toast = new bootstrap.Toast(toastEl, { delay: 1500 });

document.querySelectorAll(".add-cart").forEach(btn => {
  btn.addEventListener("click", () => {
    cartCount++;
    cartCountEl.textContent = cartCount;
    toastMsg.textContent = "✅ Added to cart";
    toast.show();
  });
});

// Product category filter
const filter = document.getElementById("categoryFilter");
const items = document.querySelectorAll(".product-item");

filter.addEventListener("change", () => {
  const val = filter.value;
  items.forEach(item => {
    const cat = item.getAttribute("data-category");
    item.style.display = (val === "all" || val === cat) ? "" : "none";
  });
});

// Newsletter form validation (Vanilla JS)
const form = document.getElementById("newsletterForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const formSuccess = document.getElementById("formSuccess");

const isValidName = (name) => /^[a-zA-Z\s]{2,}$/.test(name.trim());
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formSuccess.style.display = "none";

  const nameOk = isValidName(nameInput.value);
  const emailOk = isValidEmail(emailInput.value);

  nameError.style.display = nameOk ? "none" : "block";
  emailError.style.display = emailOk ? "none" : "block";

  if (nameOk && emailOk) {
    formSuccess.style.display = "inline";
    nameInput.value = "";
    emailInput.value = "";
  }
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();
