class CodeEditor extends HTMLElement {
  constructor() {
    super();

    this.editor = null;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<div id="code-editor-content" style="height: calc(100% - 32px) !important;"></div>`;
    const editor = ace.edit(this.shadowRoot.getElementById('code-editor-content'), {
      mode: 'ace/mode/javascript',
      theme: 'ace/theme/monokai',
    });

    editor.renderer.attachToShadowRoot();
    editor.session.on('change', () => {
      const btn = document.getElementById('run');
      if (editor.getValue(0)) {
        btn.classList.remove('disabled');
      } else {
        btn.classList.add('disabled');
      }
    });

    this.editor = editor;
  }

  disconnectedCallback() {
    if (this.editor) {
      this.editor.destroy();
      this.editor.container.remove();
      this.editor = null;
    }
  }

  run(output) {
    const consoleLog = console.log;
    console.log = (...args) => {
      output.innerHTML += `${args.join(' ')}<br/>`;
      output.scrollTop = output.scrollHeight;
    }

    try {
      new Function(this.editor.getValue(0))();
    } catch (e) {
      console.log(e);
    } finally {
      console.log();
      console.log('Execution complete.');
      console.log = consoleLog;
    }
  }
}

customElements.define('code-editor', CodeEditor);
