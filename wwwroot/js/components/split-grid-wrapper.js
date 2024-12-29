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

    // track viewport height
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    setViewportHeight();
  }

  disconnectedCallback() {
    if (this.splitGrid) {
      this.splitGrid.destroy();
      this.splitGrid = null;
    }

    window.removeEventListener('resize', setViewportHeight);
    window.removeEventListener('orientationchange', setViewportHeight);
  }
}

function setViewportHeight() {
  u(document.documentElement).first().style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}

customElements.define('split-grid-wrapper', SplitGridWrapper);
