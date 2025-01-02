import u from 'umbrellajs';
import ace from 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import * as signalR from '@microsoft/signalr';

class CodeEditor extends HTMLElement {
  constructor() {
    super();

    this.editor = null;
    this.connection = null;
    this.sessionCode = this.attributes.getNamedItem('session-code').value;

    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    // create editor and attach to shadow DOM
    const shadowRoot = u(this.shadowRoot);
    shadowRoot.first().innerHTML = `<div id="code-editor-content" style="height: calc(100% - 32px) !important;"></div>`;

    const editor = ace.edit(shadowRoot.find('#code-editor-content').first(), {
      mode: 'ace/mode/javascript',
      theme: 'ace/theme/monokai',
    });
    editor.renderer.attachToShadowRoot();

    // subscribe to websocket and define event handlers
    this.connection = new signalR.HubConnectionBuilder().withUrl("/code-updates").build();
    editor.session.on('change', () => {
      const btn = u('#run').first();
      if (editor.getValue()) {
        btn.classList.remove('disabled');
      } else {
        btn.classList.add('disabled');
      }

      if (!editor.curOp?.command?.name) {
        // remote change - do not broadcast again, to avoid infinite loop
        return;
      }

      this.connection.invoke('SendMessage', this.sessionCode, editor.getValue());
    });

    this.connection.on("ReceiveMessage", (connectionId, message) => {
      console.log('Received message:', connectionId, this.connection.connectionId, message);
      if (connectionId === this.connection.connectionId) {
        // change made by self - ignore
        return;
      }

      editor.setValue(message, 1);
    });

    await this.connection.start();
    await this.connection.invoke('JoinSession', this.sessionCode);

    this.editor = editor;
  }

  async disconnectedCallback() {
    if (this.editor) {
      this.editor.destroy();
      this.editor.container.remove();
      this.editor = null;
    }

    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
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
