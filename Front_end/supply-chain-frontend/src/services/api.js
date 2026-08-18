//const API_URL = "http://192.168.2.200:3003";
const API_URL = "/api";
async function parseResponse(response) {
  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.error || data?.message || "Request failed";

    throw new Error(message);
  }

  return data;
}
//Lay tat ca san pham
export async function getAllProducts() {
  const response = await fetch(`${API_URL}/getAllProducts`);

  const data = await parseResponse(response);

  return data.result || [];
}
//Kiem tra ket noi
export async function getHealth() {
  const response = await fetch(`${API_URL}/health`);
  const data = await parseResponse(response);

  return data;
}

export async function getProduct(id) {
  const response = await fetch(
    `${API_URL}/getProduct?id=${encodeURIComponent(id)}`
  );

  const data = await parseResponse(response);

  return data.result || data;
}

export async function getProductWithHistory(id) {
  const response = await fetch(
    `${API_URL}/getProductWithHistory?id=${encodeURIComponent(id)}`
  );

  const data = await parseResponse(response);

  return data.result || data;
}

export async function productExists(id) {
  const response = await fetch(
    `${API_URL}/productExists?id=${encodeURIComponent(id)}`
  );

  return parseResponse(response);
}

export async function createProduct(product) {
  const response = await fetch(`${API_URL}/createProduct`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  return parseResponse(response);
}

export async function shipProduct(data) {
  const response = await fetch(`${API_URL}/shipProduct`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseResponse(response);
}