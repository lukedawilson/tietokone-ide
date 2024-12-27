import 'http://localhost:5293/proxy/codemirror.js'

class CodeMirrorEditor extends HTMLElement {
  constructor() {
    super();

    this.codeMirror = window.CM; // set by codemirror.js
    this.editorView = null;
  }

  connectedCallback() {
    const { basicSetup, EditorView } = this.codeMirror["codemirror"];
    const { javascript, javascriptLanguage, scopeCompletionSource } = this.codeMirror["@codemirror/lang-javascript"];
    const { oneDark } = this.codeMirror["@codemirror/theme-one-dark"];

    const onUpdate = this.getAttribute('onUpdate');
    this.editorView = new EditorView({
      doc: '',
      extensions: [
        basicSetup,
        javascript(),
        javascriptLanguage.data.of({ autocomplete: scopeCompletionSource(globalThis) }),
        oneDark,
        EditorView.updateListener.of(update => {
          if (update.docChanged && onUpdate) {
            new Function('value', onUpdate)(update.state.doc.toString());
          }
        })
      ],
      parent: this
    });

    // fix editor height to fill containing div
    for (const node of this.childNodes) {
      if (node.classList.contains('cm-editor')) {
        node.style.height = '100%';
        break;
      }
    }
  }

  disconnectedCallback() {
    if (this.editorView) {
      this.editorView.destroy();
      this.editorView = null;
    }
  }
}

customElements.define('code-mirror-editor', CodeMirrorEditor);
