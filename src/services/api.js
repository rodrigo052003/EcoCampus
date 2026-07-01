
//  EcoCampus — Serviço de API
//  Centraliza todas as chamadas ao backend Flask.
//  Eu(Rodrigo) e Carlos fizemos


const BASE_URL = "http://127.0.0.1:5000";

function getHeaders(auth = false) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}


export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/forgot-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function resetPassword(reset_token, password) {
  const res = await fetch(`${BASE_URL}/reset-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ reset_token, password }),
  });
  return { ok: res.ok, data: await res.json() };
}


export async function getProfile() {
  const res = await fetch(`${BASE_URL}/profile`, {
    headers: getHeaders(true),
  });
  return res.json();
}

export async function updateProfile(payload) {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, data: await res.json() };
}


export async function getMaterials() {
  const res = await fetch(`${BASE_URL}/materials`);
  return res.json();
}

export async function getMyMaterials() {
  const res = await fetch(`${BASE_URL}/materials/me`, {
    headers: getHeaders(true),
  });
  return res.json();
}

export async function createMaterial(payload) {
  const res = await fetch(`${BASE_URL}/materials`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function updateMaterial(id, payload) {
  const res = await fetch(`${BASE_URL}/materials/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function deleteMaterial(id) {
  const res = await fetch(`${BASE_URL}/materials/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return { ok: res.ok };
}

export async function getMyRequests() {
  const res = await fetch(`${BASE_URL}/requests`, {
    headers: getHeaders(true),
  });
  return res.json();
}

export async function getReceivedRequests() {
  const res = await fetch(`${BASE_URL}/requests/received`, {
    headers: getHeaders(true),
  });
  return res.json();
}

export async function createRequest(material_id, type, message = "") {
  const res = await fetch(`${BASE_URL}/requests`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ material_id, type, message }),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function updateRequestStatus(id, status) {
  const res = await fetch(`${BASE_URL}/requests/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify({ status }),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function getNotifications() {
  const res = await fetch(`${BASE_URL}/notifications`, {
    headers: getHeaders(true),
  });
  return res.json();
}
