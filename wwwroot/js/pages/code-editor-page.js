import { LitElement, html } from 'lit';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import u from 'umbrellajs';

import ace from "ace-builds/src-noconflict/ace";
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';

import * as signalR from "@microsoft/signalr";

export class CodeEditorPage extends LitElement {
  /**
   * Reactive properties.
   */
  static properties = {
    sessionCode: '',
    runEnabled: false,
    consoleOutput: '',
  };

  constructor() {
    super();

    this.editor = null;
    this.connection = null;
  }

  /**
   * Initialises the ACE editor and websocket connection.
   */
  async firstUpdated(_) {
    // initialise editor div
    const editorDiv = u('#code-editor-content').first();
    this.editor = ace.edit(editorDiv, {
      mode: 'ace/mode/javascript',
      theme: 'ace/theme/monokai',
    });

    // initialise websocket connection and event listeners
    this.connection = new signalR.HubConnectionBuilder().withUrl("/code-updates").build();

    this.editor.session.on('change', async () => {
      this.runEnabled = !!this.editor.getValue();

      if (!this.editor.curOp?.command?.name) {
        return;
      }

      await this.connection.invoke('SendMessage', this.sessionCode, this.editor.getValue())
    });

    this.connection.on("ReceiveMessage", (connectionId, message) => {
      if (connectionId === this.connection.connectionId) {
        return;
      }

      this.editor.setValue(message, 1);
    });

    this.connection.onclose(error => {
      console.warn('SignalR connection closed unexpectedly:', error);
    });

    await this.connection.start();
    await this.connection.invoke('JoinSession', this.sessionCode);
  }

  /**
   * Runs the code.
   */
  run() {
    this.consoleOutput = '';

    const _this = this;
    const outputDiv = u('#console-output').first();

    const consoleLog = console.log;
    console.log = (...args) => {
      const height = outputDiv.clientHeight;
      _this.consoleOutput += `${args.join('')}<br/>`;
      outputDiv.style.height = `${height}px`;
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

  /**
   * Copies the session code to the clipboard.
   */
  share() {
    navigator.clipboard.writeText(this.sessionCode);
    M.toast({html: 'Session code copied to clipboard!'})
  }

  /**
   * Cleans up the ACE editor and websocket connection.
   */
  async disconnectedCallback() {
    super.disconnectedCallback();

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

  render() {
    return html`
      <nav class="indigo lighten-1">
        <div class="nav-wrapper">
          <ul class="left">
            <li>
              <a id="run"
                 class="btn btn-secondary ${this.runEnabled ? '' : 'disabled'}"
                 title="Run code..."
                 @click=${this.run}>
                <i class="material-symbols-outlined">play_arrow</i>
              </a>
            </li>
          </ul>
          <ul class="right">
            <li>
              <a id="share"
                 class="btn btn-secondary"
                 title="Share session..."
                 @click=${this.share}>
                <i class="material-symbols-outlined">content_paste_go</i>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <code-editor-grid firstGutterClass="gutter-row-1">
        <div class="grid blue-grey darken-4">
          <div>
            <nav id="code-title-bar" class="deep-purple darken-3">
              <h6 class="pl2 m0">JavaScript</h6>
            </nav>

            <div id="code-editor-content" style="height: calc(100% - 32px) !important"></div>
          </div>

          <div class="gutter-row-1 gutter-row-2"></div>

          <div class="console">
            <nav id="console-title-bar" class="deep-purple darken-3">
              <h6 class="pl2 m0">Console</h6>
            </nav>

            <div id="console-output" class="p3 blue-grey darken-4 white-text">
              ${unsafeHTML(this.consoleOutput)}
            </div>
          </div>
        </div>
      </code-editor-grid>
  `;
  }

  /**
   * Do not use shadow DOM, so global styles (e.g. Materialize CSS) can be applied
   */
  createRenderRoot() { return this; }
}

customElements.define('code-editor-page', CodeEditorPage);
