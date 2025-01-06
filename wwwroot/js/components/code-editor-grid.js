import { LitElement } from 'lit';
import u from 'umbrellajs';
import Split from 'split-grid';

class CodeEditorGrid extends LitElement {
  /**
   * Reactive properties.
   */
  static properties = {
    firstGutterClass: '',
  };

  constructor() {
    super();
    this.splitGrid = null;
  }

  connectedCallback() {
    this.splitGrid = Split({
      minSize: 0,
      snapOffset: 0,
      rowGutters: [{
        track: 1,
        element: u(`.${this.firstGutterClass}`).first(),
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

  /**
   * Do not use shadow DOM, so global styles (e.g. Materialize CSS) can be applied.
   */
  createRenderRoot() { return this; }
}

function setViewportHeight() {
  u(document.documentElement).first().style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}

customElements.define('code-editor-grid', CodeEditorGrid);
