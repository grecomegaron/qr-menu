const API_URL = "https://script.google.com/macros/s/AKfycbyYxtRQPX2w3ku1ZQiAaNNETKVSlIOoHcjo_RaPMbrYI3TxCE0Qt9chmng0p8ws1Q4S/exec?action=getMenu";

async function loadMenu() {
  const menu = document.getElementById("menu");

  try {
    menu.innerHTML = "<p>Σύνδεση με Google Sheet...</p>";

    const response = await fetch(API_URL);
    const text = await response.text();

    console.log("API response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      menu.innerHTML = `
        <h3>Το API δεν επέστρεψε JSON</h3>
        <pre>${text}</pre>
      `;
      return;
    }

    if (!data.success) {
      menu.innerHTML = `
        <h3>Σφάλμα API</h3>
        <p>${data.message || "Άγνωστο σφάλμα"}</p>
      `;
      return;
    }

    document.getElementById("storeName").textContent =
      data.settings.store_name || "QR Menu";

    document.body.style.background =
      data.settings.background_color || "#111111";

    document.body.style.color =
      data.settings.font_color || "#ffffff";

    menu.innerHTML = "";

    data.categories.forEach(category => {
      menu.innerHTML += `<h2 class="category-title">${category.name}</h2>`;

      const categoryProducts = data.products.filter(
        p => String(p.category_id) === String(category.id)
      );

      categoryProducts.forEach(product => {
        menu.innerHTML += `
          <div class="product">
            ${product.image_url ? `<img src="${product.image_url}" class="product-image">` : ""}
            <h3>${product.name}</h3>
            <p>${product.description || ""}</p>
            <strong>${product.price}€</strong>
          </div>
        `;
      });
    });

  } catch (error) {
    console.error(error);
    menu.innerHTML = `
      <h3>Σφάλμα σύνδεσης</h3>
      <p>${error.message}</p>
    `;
  }
}

loadMenu();
