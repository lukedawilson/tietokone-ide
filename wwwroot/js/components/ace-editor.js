import { LitElement, html } from "lit";
import u from 'umbrellajs';

import ace from "ace-builds/src-noconflict/ace";
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';

class AceEditor extends LitElement {
  /**
   * Reactive properties.
   */
  static properties = {
    style: '',
    class: '',
  };

  constructor() {
    super();
    this.editor = null;
  }

  firstUpdated(_) {
    this.editor = ace.edit(u(this.renderRoot.querySelector('#editor')).first(), {
      mode: 'ace/mode/javascript',
      theme: 'ace/theme/monokai',
    });
    this.editor.renderer.attachToShadowRoot();

    const _this = this;
    this.editor.session.on('change', () => {
      this.dispatchEvent(new CustomEvent('content-changed', {
        detail: { value: this.value(), isRemote: !_this.editor.curOp?.command?.name }
      }));
    });
  }

  disconnectedCallback() {
    if (this.editor) {
      this.editor.destroy();
      this.editor.container.remove();
      this.editor = null;
    }
  }

  value() {
    return this.editor.getValue();
  }

  setValue(value) {
    this.editor.setValue(value, 1);
  }

  render() {
    const style = this.style ?? 'height: 100% !important;';
    return html`<div class=${this.class} style=${style} id="editor"></div>`;
  }
}

customElements.define('ace-editor', AceEditor);
