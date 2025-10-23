// ==========================================
// LISTADO DE EMPLEOS
// ==========================================

import { DOMCache } from './shared.js';
import { 
  EstadoPaginacion, 
  SistemaFiltrado, 
  GestorPaginacion, 
  GestorUI, 
  ManejadorEventos 
} from './empleos-core.js';

class AplicacionEmpleos {
  constructor() {
    this.dom = new DOMCache();
    this.estado = new EstadoPaginacion();
    this.filtrado = new SistemaFiltrado(this.dom);
    this.paginacion = new GestorPaginacion(this.dom, this.estado);
    this.ui = new GestorUI(this.dom);
    this.eventos = new ManejadorEventos(this.dom, this.ui);

    // Configurar callbacks
    this.paginacion.setActualizarCallback(() => this.actualizar());
    this.eventos.setCallbacks(
      () => this.actualizar(),
      () => this.resetear()
    );
  }

  async inicializar() {
    this.eventos.inicializar();
    await this.ui.cargarEmpleos();
    this.actualizar();
  }

  actualizar() {
    const articulosVisibles = this.filtrado.aplicar();
    this.paginacion.aplicar(articulosVisibles);
  }

  resetear() {
    this.filtrado.resetear();
    this.estado.resetear();
    this.actualizar();
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  const app = new AplicacionEmpleos();
  app.inicializar();
});