import { LitElement, html } from "lit";
import u from 'umbrellajs';

import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';

class CodeEditor extends LitElement {
  /**
   * Reactive properties.
   */
  static properties = {
    style: '',
    class: '',
    disabled: false,
  };

  constructor() {
    super();

    this.editor = null;
    this.darkModeHandler = null;
  }

  firstUpdated(_) {
    this.editor = ace.edit(u(this.renderRoot.querySelector('#editor')).first(), {
      mode: 'ace/mode/javascript',
      theme: localStorage.getItem('darkMode') === 'true' ? 'ace/theme/monokai' : 'ace/theme/github',
      showPrintMargin: false,
    });
    this.editor.renderer.attachToShadowRoot();

    const _this = this;

    this.editor.session.on('change', event => {
      const isRemote = !_this.editor.curOp?.command?.name;
      _this.dispatchEvent(new CustomEvent('content-changed', { detail: { update: event, value: _this.value(), isRemote } }));
    });

    this.darkModeHandler = (event) => {
      console.log(event.detail, _this.editor)
      if (event.detail.darkMode) {
        _this.editor.setTheme('ace/theme/monokai');
      } else {
        _this.editor.setTheme('ace/theme/github');
      }
    }
    document.addEventListener('darkModeToggled', this.darkModeHandler);
  }

  updated(changedProperties) {
    if (changedProperties.has('disabled')) {
      this.editor.setReadOnly(this.disabled === 'true');
    }
  }

  disconnectedCallback() {
    if (this.editor) {
      this.editor.destroy();
      this.editor.container.remove();
      this.editor = null;
    }

    if (this.darkModeHandler) {
      document.removeEventListener('darkModeToggled', this.darkModeHandler);
      this.darkModeHandler = null;
    }
  }

  value() {
    return this.editor.getValue();
  }

  applyUpdate(event) {
    switch (event.action) {
      case 'init':
        this.editor.setValue(event.value, -1);
        break;
      case 'insert':
        this.editor.session.insert(event.start, event.lines.join('\n'));
        break;
      case 'remove':
        this.editor.session.remove({ start: event.start, end: event.end });
        break;
    }
  }

  render() {
    const style = this.style ?? 'height: 100% !important;';
    return html`<div class=${this.class} style=${style} id="editor"></div>`;
  }
}

customElements.define('code-editor', CodeEditor);
