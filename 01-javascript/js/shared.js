// ==========================================
// CONFIGURACIÓN Y UTILIDADES COMPARTIDAS
// ==========================================

export const CONFIG = {
  ITEMS_POR_PAGINA: 4,
  MAX_BOTONES_PAGINACION: 5,
  DATA_URL: "./js/data.json",
  DETAIL_PAGE_URL: "empleo.html",
  REDIRECT_URL: "empleos.html",
  STORAGE_KEY: "datosEmpleo",
};

export const SELECTORS = {
  tecnologia: "#tecnologia",
  ubicacion: "#ubicacion",
  contrato: "#contrato",
  experiencia: "#nivel",
  searchForm: '[role="search"]',
  searchInput: '[role="search"] input',
  sectionArticles: ".job-articles",
  containerArticles: ".container-articles",
  resetBtn: ".refresh",
  pagination: ".pagination",
};

export const Utils = {
  normalizarTexto(texto) {
    return texto?.toLowerCase().trim() || "";
  },

  obtenerTecnologiaString(tecnologia) {
    if (!tecnologia) return "";
    
    if (Array.isArray(tecnologia)) {
      return tecnologia.join(" ").toLowerCase();
    }
    
    if (typeof tecnologia === "object") {
      return Object.values(tecnologia).flat().join(" ").toLowerCase();
    }
    
    return String(tecnologia).toLowerCase();
  },

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  extraerIdDeArticulo(article) {
    return article.dataset.id || "";
  },

  escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
  },
};

export class DOMCache {
  constructor() {
    this.elements = {};
    this.inicializar();
  }

  inicializar() {
    this.elements = {
      selects: {
        tecnologia: document.querySelector(SELECTORS.tecnologia),
        ubicacion: document.querySelector(SELECTORS.ubicacion),
        contrato: document.querySelector(SELECTORS.contrato),
        experiencia: document.querySelector(SELECTORS.experiencia),
      },
      searchForm: document.querySelector(SELECTORS.searchForm),
      searchInput: document.querySelector(SELECTORS.searchInput),
      sectionArticles: document.querySelector(SELECTORS.sectionArticles),
      containerArticles: document.querySelector(SELECTORS.containerArticles),
      resetBtn: document.querySelector(SELECTORS.resetBtn),
      pagination: document.querySelector(SELECTORS.pagination),
    };
  }

  get(key) {
    return this.elements[key];
  }
}