import 'https://unpkg.com/split-grid/dist/split-grid.js';

class SplitGridWrapper extends HTMLElement {
  constructor() {
    super();
    this.splitGrid = null;
  }

  connectedCallback() {
    this.splitGrid = window.Split({
      minSize: 0,
      snapOffset: 0,
      rowGutters: [{
        track: 1,
        element: u(`.${this.getAttribute('first-gutter-class')}`).first(),
      }]
    })
  }

  disconnectedCallback() {
    if (this.splitGrid) {
      this.splitGrid.destroy();
      this.splitGrid = null;
    }
  }
}

customElements.define('split-grid-wrapper', SplitGridWrapper);
