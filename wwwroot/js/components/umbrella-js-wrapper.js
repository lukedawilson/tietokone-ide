import u from 'umbrellajs';

class UmbrellaJsWrapper extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    window.u = u;
  }

  disconnectedCallback() {
    window.u = undefined;
  }
}

customElements.define('umbrella-js-wrapper', UmbrellaJsWrapper);
