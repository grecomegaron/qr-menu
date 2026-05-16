/************************************************************
 * QR MENU ADMIN JS
 * Αρχείο: admin.js
 ************************************************************/

const API_URL = "https://script.google.com/macros/s/AKfycbyYxtRQPX2w3ku1ZQiAaNNETKVSlIOoHcjo_RaPMbrYI3TxCE0Qt9chmng0p8ws1Q4S/exec";

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();

  const form = document.getElementById("productForm");
  if (form) {
    form.addEventListener("submit", handleProductSubmit);
  }
});

/************************************************************
 * LOAD CATEGORIES
 ************************************************************/

async function loadCategories() {
  const categorySelect = document.getElementById("category_id");
  const messageBox = document.getElementById("message");

  if (!categorySelect) return;

  categorySelect.innerHTML = `<option value="">Φόρτωση κατηγοριών...</option>`;

  try {
    const response = await fetch(`${API_URL}?action=getMenu`);
    const data = await response.json();

    if (!data.success) {
      categorySelect.innerHTML = `<option value="">Σφάλμα φόρτωσης</option>`;
      showMessage(data.message || "Δεν φορτώθηκαν οι κατηγορίες", "error");
      return;
    }

    const categories = data.categories || [];

    if (categories.length === 0) {
      categorySelect.innerHTML = `<option value="">Δεν υπάρχουν ενεργές κατηγορίες</option>`;
      return;
    }

    categorySelect.innerHTML = `<option value="">Επιλέξτε κατηγορία</option>`;

    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

  } catch (error) {
    console.error("Load categories error:", error);

    categorySelect.innerHTML = `<option value="">Σφάλμα σύνδεσης</option>`;

    if (messageBox) {
      showMessage("Δεν έγινε σύνδεση με το Google Apps Script", "error");
    }
  }
}

/************************************************************
 * ADD PRODUCT
 ************************************************************/

async function handleProductSubmit(event) {
  event.preventDefault();

  const button = event.target.querySelector("button[type='submit']");

  const category_id = document.getElementById("category_id").value.trim();
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const price = document.getElementById("price").value.trim();
  const image_url = document.getElementById("image_url").value.trim();

  if (!category_id) {
    showMessage("Επιλέξτε κατηγορία", "error");
    return;
  }

  if (!name) {
    showMessage("Γράψτε όνομα προϊόντος", "error");
    return;
  }

  if (!price) {
    showMessage("Γράψτε τιμή προϊόντος", "error");
    return;
  }

  const params = new URLSearchParams({
    action: "addProduct",
    category_id: category_id,
    name: name,
    description: description,
    price: price,
    image_url: image_url
  });

  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Αποθήκευση...";
    }

    const response = await fetch(`${API_URL}?${params.toString()}`);
    const data = await response.json();

    if (!data.success) {
      showMessage(data.message || "Δεν αποθηκεύτηκε το προϊόν", "error");
      return;
    }

    showMessage("Το προϊόν προστέθηκε επιτυχώς", "success");

    document.getElementById("productForm").reset();

    await loadCategories();

  } catch (error) {
    console.error("Add product error:", error);
    showMessage("Σφάλμα σύνδεσης. Δεν αποθηκεύτηκε το προϊόν.", "error");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Προσθήκη προϊόντος";
    }
  }
}

/************************************************************
 * MESSAGE HELPER
 ************************************************************/

function showMessage(text, type) {
  const messageBox = document.getElementById("message");

  if (!messageBox) return;

  messageBox.textContent = text;
  messageBox.className = "";

  if (type === "success") {
    messageBox.classList.add("success");
  }

  if (type === "error") {
    messageBox.classList.add("error");
  }

  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "";
  }, 4000);
}
