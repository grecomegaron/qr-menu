/************************************************************
 * QR MENU ADMIN JS - JSONP VERSION
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
 * JSONP REQUEST
 ************************************************************/

function jsonpRequest(params) {
  return new Promise((resolve, reject) => {
    const callbackName = "jsonp_callback_" + Date.now() + "_" + Math.floor(Math.random() * 100000);

    params.callback = callbackName;

    const query = new URLSearchParams(params).toString();
    const script = document.createElement("script");

    window[callbackName] = function(data) {
      resolve(data);

      delete window[callbackName];

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    script.onerror = function() {
      reject(new Error("JSONP request failed"));

      delete window[callbackName];

      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    script.src = API_URL + "?" + query;

    document.body.appendChild(script);
  });
}

/************************************************************
 * LOAD CATEGORIES
 ************************************************************/

async function loadCategories() {
  const categorySelect = document.getElementById("category_id");

  if (!categorySelect) return;

  categorySelect.innerHTML = `<option value="">Φόρτωση κατηγοριών...</option>`;

  try {
    const data = await jsonpRequest({
      action: "getMenu"
    });

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
    console.error(error);
    categorySelect.innerHTML = `<option value="">Σφάλμα σύνδεσης</option>`;
    showMessage("Σφάλμα σύνδεσης με το Apps Script", "error");
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

  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Αποθήκευση...";
    }

    const data = await jsonpRequest({
      action: "addProduct",
      category_id: category_id,
      name: name,
      description: description,
      price: price,
      image_url: image_url
    });

    if (!data.success) {
      showMessage(data.message || "Δεν αποθηκεύτηκε το προϊόν", "error");
      return;
    }

    showMessage("Το προϊόν προστέθηκε επιτυχώς", "success");

    document.getElementById("productForm").reset();

    await loadCategories();

  } catch (error) {
    console.error(error);
    showMessage("Σφάλμα σύνδεσης. Δεν αποθηκεύτηκε το προϊόν.", "error");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Προσθήκη προϊόντος";
    }
  }
}

/************************************************************
 * MESSAGE
 ************************************************************/

function showMessage(text, type) {
  const messageBox = document.getElementById("message");

  if (!messageBox) return;

  messageBox.textContent = text;
  messageBox.className = type || "";

  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "";
  }, 4000);
}
