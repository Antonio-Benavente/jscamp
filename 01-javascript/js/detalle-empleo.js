// ==========================================
// APLICACIÓN DETALLE DE EMPLEO
// ==========================================

import { CONFIG } from './shared.js';

const domElements = {
  empleoSlash: document.getElementById("empleo-slash"),
  jobTitle: document.getElementById("title"),
  jobDetails: document.getElementById("details"),
  jobDescription: document.getElementById("description"),
  jobResponsabilidades: document.getElementById("responsabilidades"),
  jobRequisitos: document.getElementById("requisitos"),
  jobAcercaDe: document.getElementById("acerca"),
};

function createListItem(texto) {
  return `
    <div class="lista">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1173D4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l2 2l4 -4" /></svg>
      <p>${texto}</p>
    </div>
  `;
}

async function fetchEmpleos() {
  const response = await fetch(CONFIG.DATA_URL);

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return await response.json();
}

function renderEmpleoDetalle(datos) {
  const { title, ubicacion, dataEmpresa } = datos;
  const { company, description, responsabilidades, requisitos, acerca } = dataEmpresa;

  domElements.empleoSlash.textContent = title;
  domElements.jobTitle.textContent = title;
  domElements.jobDetails.textContent = `${company} · ${ubicacion}`;
  domElements.jobDescription.textContent = description;
  domElements.jobAcercaDe.textContent = acerca;

  domElements.jobResponsabilidades.innerHTML = responsabilidades
    .map(createListItem)
    .join("");

  domElements.jobRequisitos.innerHTML = requisitos
    .map(createListItem)
    .join("");
}

function redirectToEmpleos() {
  window.location.href = CONFIG.REDIRECT_URL;
}

function aplicarTodosLosBotones() {
  const botones = document.querySelectorAll('.aplicar-btn');
  
  botones.forEach(boton => {
    boton.textContent = "¡Aplicado!";
    boton.classList.add("is-aplied");
    boton.disabled = true;
  });
}

function inicializarBotonesAplicar() {
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("aplicar-btn")) {
      aplicarTodosLosBotones();
    }
  });
}

async function cargarEmpleoDetalle() {
  const jobId = sessionStorage.getItem(CONFIG.STORAGE_KEY);

  if (!jobId) {
    redirectToEmpleos();
    return;
  }

  try {
    const empleos = await fetchEmpleos();
    const empleoEncontrado = empleos.find((job) => job.id === jobId);

    if (!empleoEncontrado) {
      console.error(`Empleo con ID "${jobId}" no encontrado`);
      redirectToEmpleos();
      return;
    }

    renderEmpleoDetalle(empleoEncontrado);
    inicializarBotonesAplicar();

    // Opcional: limpiar sessionStorage después de usar
    sessionStorage.removeItem(CONFIG.STORAGE_KEY);
  } catch (error) {
    console.error("Error al cargar el empleo:", error);
    redirectToEmpleos();
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", cargarEmpleoDetalle);