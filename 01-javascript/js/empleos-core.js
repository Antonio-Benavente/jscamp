// ==========================================
// LÓGICA PRINCIPAL DEL LISTADO DE EMPLEOS
// ==========================================

import { CONFIG, Utils } from './shared.js';

// ==========================================
// ESTADO DE PAGINACIÓN
// ==========================================
export class EstadoPaginacion {
  constructor() {
    this.paginaActual = 1;
    this.totalItems = 0;
  }

  resetear() {
    this.paginaActual = 1;
  }

  setPagina(pagina) {
    this.paginaActual = Math.max(1, pagina);
  }

  setTotalItems(total) {
    this.totalItems = total;
  }

  getTotalPaginas() {
    return Math.ceil(this.totalItems / CONFIG.ITEMS_POR_PAGINA);
  }

  getPaginaActual() {
    const totalPaginas = this.getTotalPaginas();
    if (this.paginaActual > totalPaginas && totalPaginas > 0) {
      this.paginaActual = totalPaginas;
    }
    return this.paginaActual;
  }

  getRangoPaginacion() {
    const inicio = (this.getPaginaActual() - 1) * CONFIG.ITEMS_POR_PAGINA;
    return {
      inicio,
      fin: inicio + CONFIG.ITEMS_POR_PAGINA,
    };
  }
}

// ==========================================
// SISTEMA DE FILTRADO
// ==========================================
export class SistemaFiltrado {
  constructor(domCache) {
    this.dom = domCache;
  }

  obtenerQueries() {
    const { selects, searchInput } = this.dom.elements;
    
    return {
      tecnologia: Utils.normalizarTexto(selects.tecnologia?.value),
      ubicacion: Utils.normalizarTexto(selects.ubicacion?.value),
      contrato: Utils.normalizarTexto(selects.contrato?.value),
      nivel: Utils.normalizarTexto(selects.experiencia?.value),
      search: Utils.normalizarTexto(searchInput?.value),
    };
  }

  verificarCoincidencia(article, queries) {
    const datos = {
      nivel: Utils.normalizarTexto(article.dataset.nivel),
      contract: Utils.normalizarTexto(article.dataset.contract),
      tecnologia: Utils.normalizarTexto(article.dataset.tecnologia),
      ubicacion: Utils.normalizarTexto(article.dataset.ubicacion),
      texto: article.textContent.toLowerCase(),
    };

    return (
      (!queries.tecnologia || datos.tecnologia.includes(queries.tecnologia)) &&
      (!queries.ubicacion || datos.ubicacion.includes(queries.ubicacion)) &&
      (!queries.contrato || datos.contract.includes(queries.contrato)) &&
      (!queries.nivel || datos.nivel.includes(queries.nivel)) &&
      (!queries.search || datos.texto.includes(queries.search))
    );
  }

  aplicar() {
    const queries = this.obtenerQueries();
    const articles = this.dom.get("sectionArticles")?.querySelectorAll(".job-detail") || [];

    articles.forEach(article => {
      const coincide = this.verificarCoincidencia(article, queries);
      article.dataset.filtered = coincide ? "true" : "false";
    });

    return Array.from(articles).filter(a => a.dataset.filtered === "true");
  }

  resetear() {
    const { selects, searchInput } = this.dom.elements;
    
    Object.values(selects).forEach(select => {
      if (select) select.selectedIndex = 0;
    });
    
    if (searchInput) searchInput.value = "";
  }
}

// ==========================================
// GESTOR DE PAGINACIÓN
// ==========================================
export class GestorPaginacion {
  constructor(domCache, estado) {
    this.dom = domCache;
    this.estado = estado;
    this.actualizarCallback = null;
  }

  setActualizarCallback(callback) {
    this.actualizarCallback = callback;
  }

  aplicar(articulosVisibles) {
    this.estado.setTotalItems(articulosVisibles.length);
    const { inicio, fin } = this.estado.getRangoPaginacion();
    const todosLosArticulos = this.dom.get("sectionArticles")?.querySelectorAll(".job-detail") || [];

    todosLosArticulos.forEach(article => {
      article.style.display = "none";
    });

    articulosVisibles.forEach((article, index) => {
      if (index >= inicio && index < fin) {
        article.style.display = "";
      }
    });

    this.actualizarBordes(articulosVisibles);
    this.renderizar();
  }

  actualizarBordes(articulos) {
    const visibles = articulos.filter(a => a.style.display !== "none");
    
    articulos.forEach(a => a.classList.remove("primer-visible"));
    
    if (visibles.length > 0) {
      visibles[0].classList.add("primer-visible");
    }
  }

  renderizar() {
    const paginationEl = this.dom.get("pagination");
    if (!paginationEl) return;

    paginationEl.innerHTML = "";
    const totalPaginas = this.estado.getTotalPaginas();

    this.agregarBotonAnterior(paginationEl, totalPaginas);
    this.agregarNumerosPagina(paginationEl, totalPaginas);
    this.agregarBotonSiguiente(paginationEl, totalPaginas);
  }

  agregarBotonAnterior(container, totalPaginas) {
    const btn = this.crearBotonNavegacion("prev", totalPaginas);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.estado.paginaActual > 1) {
        this.estado.setPagina(this.estado.paginaActual - 1);
        this.actualizarYScroll();
      }
    });
    container.appendChild(btn);
  }

  agregarBotonSiguiente(container, totalPaginas) {
    const btn = this.crearBotonNavegacion("next", totalPaginas);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.estado.paginaActual < totalPaginas) {
        this.estado.setPagina(this.estado.paginaActual + 1);
        this.actualizarYScroll();
      }
    });
    container.appendChild(btn);
  }

  agregarNumerosPagina(container, totalPaginas) {
    const { inicio, fin } = this.calcularRangoVisiblePaginas(totalPaginas);

    for (let i = inicio; i <= fin; i++) {
      const btn = document.createElement("a");
      btn.href = "#";
      btn.textContent = i;
      
      if (i === this.estado.getPaginaActual()) {
        btn.classList.add("is-active");
      }
      
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.estado.setPagina(i);
        this.actualizarYScroll();
      });
      
      container.appendChild(btn);
    }
  }

  calcularRangoVisiblePaginas(totalPaginas) {
    let inicio = Math.max(1, this.estado.paginaActual - 2);
    let fin = Math.min(totalPaginas, inicio + CONFIG.MAX_BOTONES_PAGINACION - 1);
    
    if (fin - inicio < CONFIG.MAX_BOTONES_PAGINACION - 1) {
      inicio = Math.max(1, fin - CONFIG.MAX_BOTONES_PAGINACION + 1);
    }

    return { inicio, fin };
  }

  crearBotonNavegacion(tipo, totalPaginas) {
    const btn = document.createElement("a");
    btn.href = "#";
    
    const iconPath = tipo === "prev" 
      ? "M15 6l-6 6l6 6" 
      : "M9 6l6 6l-6 6";
    
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="${iconPath}"/></svg>`;

    const deshabilitado = tipo === "prev" 
      ? this.estado.paginaActual === 1
      : this.estado.paginaActual === totalPaginas || totalPaginas === 0;

    if (deshabilitado) {
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.5";
    }

    return btn;
  }

  actualizarYScroll() {
    if (this.actualizarCallback) {
      this.actualizarCallback();
    }
    Utils.scrollToTop();
  }
}

// ==========================================
// GESTOR DE UI Y CARGADOR DE DATOS
// ==========================================
export class GestorUI {
  constructor(domCache) {
    this.dom = domCache;
  }

  crearArticulo(job) {
    const article = document.createElement("article");
    article.className = "job-detail";

    const tecnologiaString = Utils.obtenerTecnologiaString(job.data?.tecnologia);

    article.dataset.nivel = Utils.normalizarTexto(job.data?.nivel);
    article.dataset.id = Utils.normalizarTexto(job.id);
    article.dataset.contract = Utils.normalizarTexto(job.data?.contract);
    article.dataset.ubicacion = Utils.normalizarTexto(job.data?.ubicacion);
    article.dataset.tecnologia = tecnologiaString;

    article.innerHTML = `
      <div>
        <h3 class="title">${Utils.escaparHTML(job.title)}</h3>
        <small>${Utils.escaparHTML(job.company)} | ${Utils.escaparHTML(job.ubicacion)}</small>
        <p>${Utils.escaparHTML(job.description)}</p>
      </div>
      <button class="aplicar-btn">Aplicar</button>
    `;

    return article;
  }

  async cargarEmpleos() {
    try {
      const response = await fetch(CONFIG.DATA_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jobs = await response.json();
      this.renderizarEmpleos(jobs);
      
      return jobs;
    } catch (error) {
      console.error("Error al cargar empleos:", error);
      this.mostrarError();
      return [];
    }
  }

  renderizarEmpleos(jobs) {
    const container = this.dom.get("containerArticles");
    if (!container) return;

    const fragment = document.createDocumentFragment();
    
    jobs.forEach(job => {
      const article = this.crearArticulo(job);
      fragment.appendChild(article);
    });

    container.appendChild(fragment);
  }

  mostrarError() {
    const container = this.dom.get("containerArticles");
    if (!container) return;
    
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #666;">
        <p>Error al cargar los empleos. Por favor, intenta nuevamente.</p>
      </div>
    `;
  }

  aplicarEmpleo(button) {
    button.textContent = "¡Aplicado!";
    button.classList.add("is-aplied");
    button.disabled = true;
  }

  navegarADetalle(article) {
    const jobId = Utils.extraerIdDeArticulo(article);
    sessionStorage.setItem(CONFIG.STORAGE_KEY, jobId);
    window.location.href = CONFIG.DETAIL_PAGE_URL;
  }
}

// ==========================================
// MANEJADOR DE EVENTOS
// ==========================================
export class ManejadorEventos {
  constructor(domCache, gestorUI) {
    this.dom = domCache;
    this.ui = gestorUI;
    this.actualizarCallback = null;
    this.resetearCallback = null;
  }

  setCallbacks(actualizarCallback, resetearCallback) {
    this.actualizarCallback = actualizarCallback;
    this.resetearCallback = resetearCallback;
  }

  inicializar() {
    this.configurarFormulario();
    this.configurarFiltros();
    this.configurarReset();
    this.configurarArticulos();
  }

  configurarFormulario() {
    const form = this.dom.get("searchForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.actualizarCallback) {
        this.actualizarCallback();
      }
      return false;
    });
  }

  configurarFiltros() {
    const { selects, searchInput } = this.dom.elements;
    
    Object.values(selects).forEach(select => {
      select?.addEventListener("change", () => {
        if (this.actualizarCallback) {
          this.actualizarCallback();
        }
      });
    });

    searchInput?.addEventListener("input", () => {
      if (this.actualizarCallback) {
        this.actualizarCallback();
      }
    });

    searchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (this.actualizarCallback) {
          this.actualizarCallback();
        }
      }
    });
  }

  configurarReset() {
    const resetBtn = this.dom.get("resetBtn");
    resetBtn?.addEventListener("click", () => {
      if (this.resetearCallback) {
        this.resetearCallback();
      }
    });
  }

  configurarArticulos() {
    const section = this.dom.get("sectionArticles");
    section?.addEventListener("click", (e) => this.manejarClickArticulo(e));
  }

  manejarClickArticulo(e) {
    const { target } = e;

    if (target.classList.contains("aplicar-btn")) {
      this.ui.aplicarEmpleo(target);
      return;
    }

    if (target.classList.contains("title")) {
      const article = target.closest(".job-detail");
      if (article) this.ui.navegarADetalle(article);
    }
  }
}