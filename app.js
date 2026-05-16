const API_URL = "https://script.google.com/macros/s/AKfycbyYxtRQPX2w3ku1ZQiAaNNETKVSlIOoHcjo_RaPMbrYI3TxCE0Qt9chmng0p8ws1Q4S/exec";

async function loadMenu() {

  const response = await fetch(API_URL);
  const data = await response.json();

  const menu = document.getElementById("menu");

  document.body.style.background = data.settings.background_color;
  document.body.style.color = data.settings.font_color;

  menu.innerHTML = "";

  data.categories.forEach(category => {

    menu.innerHTML += `
      <h2 class="category-title">
        ${category.name}
      </h2>
    `;

    const categoryProducts = data.products.filter(
      p => p.category_id === category.id
    );

    categoryProducts.forEach(product => {

      menu.innerHTML += `
        <div class="product">

          ${
            product.image_url
            ? `<img src="${product.image_url}" class="product-image">`
            : ""
          }

          <h3>${product.name}</h3>

          <p>${product.description}</p>

          <strong>${product.price}€</strong>

        </div>
      `;

    });

  });

}

loadMenu();
