const API_URL = "https://script.google.com/macros/s/AKfycbyYxtRQPX2w3ku1ZQiAaNNETKVSlIOoHcjo_RaPMbrYI3TxCE0Qt9chmng0p8ws1Q4S/exec";

async function loadCategories() {
  const response = await fetch(API_URL + "?action=getMenu");
  const data = await response.json();

  const select = document.getElementById("category_id");
  select.innerHTML = "";

  data.categories.forEach(category => {
    select.innerHTML += `
      <option value="${category.id}">
        ${category.name}
      </option>
    `;
  });
}

document.getElementById("productForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const message = document.getElementById("message");
  message.innerText = "Αποθήκευση...";

  const payload = {
    action: "addProduct",
    category_id: document.getElementById("category_id").value,
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    price: document.getElementById("price").value,
    image_url: document.getElementById("image_url").value,
    sort_order: 999
  };

  try {
    const formData = new URLSearchParams();
    formData.append("payload", JSON.stringify(payload));

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const text = await response.text();
    console.log(text);

    const result = JSON.parse(text);

    message.innerText = result.message;

    if (result.success) {
      document.getElementById("productForm").reset();
      loadCategories();
    }

  } catch (error) {
    message.innerText = "Σφάλμα: " + error.message;
  }
});

loadCategories();
