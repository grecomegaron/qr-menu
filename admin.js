function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";

  if (action === "getMenu") {
    return getMenu_();
  }

  if (action === "addProduct") {
    return addProduct_(e.parameter);
  }

  return json_({
    success: false,
    message: "Invalid action"
  });
}

function getMenu_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const settingsSheet = ss.getSheetByName("Settings");
  const categoriesSheet = ss.getSheetByName("Categories");
  const productsSheet = ss.getSheetByName("Products");

  if (!settingsSheet || !categoriesSheet || !productsSheet) {
    return json_({
      success: false,
      message: "Λείπει κάποιο από τα sheets: Settings, Categories ή Products"
    });
  }

  const settings = sheetToObjects_(settingsSheet);
  const categories = sheetToObjects_(categoriesSheet);
  const products = sheetToObjects_(productsSheet);

  const settingsObj = {};

  settings.forEach(row => {
    if (row.key) {
      settingsObj[String(row.key).trim()] = row.value;
    }
  });

  return json_({
    success: true,
    settings: settingsObj,
    categories: categories
      .filter(c => String(c.active).trim().toUpperCase() === "TRUE")
      .sort((a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999)),
    products: products
      .filter(p => String(p.active).trim().toUpperCase() === "TRUE")
      .sort((a, b) => Number(a.sort_order || 999) - Number(b.sort_order || 999))
  });
}

function addProduct_(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Products");

  if (!sheet) {
    return json_({
      success: false,
      message: "Δεν βρέθηκε το sheet Products"
    });
  }

  if (!data.name) {
    return json_({
      success: false,
      message: "Λείπει το όνομα προϊόντος"
    });
  }

  const id = "p" + new Date().getTime();

  const price = data.price ? Number(String(data.price).replace(",", ".")) : "";

  sheet.appendRow([
    id,
    data.category_id || "",
    data.name || "",
    data.description || "",
    price,
    data.image_url || "",
    "TRUE",
    data.sort_order || 999
  ]);

  return json_({
    success: true,
    message: "Το προϊόν προστέθηκε",
    id: id
  });
}

function sheetToObjects_(sheet) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values.shift().map(h => String(h).trim());

  return values.map(row => {
    const obj = {};

    headers.forEach((header, i) => {
      obj[header] = row[i];
    });

    return obj;
  });
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
