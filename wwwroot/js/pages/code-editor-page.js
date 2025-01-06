import { LitElement, html } from 'lit';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import u from 'umbrellajs';

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
    this.connection = null;
  }

  /**
   * Initialises the websocket connection.
   */
  async firstUpdated(_) {
    const _this = this;

    this.connection = new signalR.HubConnectionBuilder().withUrl("/code-updates").build();

    this.connection.on("ReceiveMessage", (connectionId, message) => {
      if (connectionId === this.connection.connectionId) {
        return;
      }

      _this.aceEditor().setValue(message);
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
      const code = this.aceEditor().value();
      new Function(code)();
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
   * Cleans up the websocket connection.
   */
  async disconnectedCallback() {
    super.disconnectedCallback();

    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async onCodeChange(event) {
    this.runEnabled = !!event.detail.value;

    if (!event.detail.isRemote) {
      await this.connection.invoke('SendMessage', this.sessionCode, event.detail.value)
    }
  }

  aceEditor() {
    return u('ace-editor').first();
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

            <ace-editor style="height: calc(100% - 32px) !important"
                        @content-changed=${this.onCodeChange}>
            </ace-editor>
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
   * Do not use shadow DOM, so global styles (e.g. Materialize CSS) can be applied.
   */
  createRenderRoot() { return this; }
}

customElements.define('code-editor-page', CodeEditorPage);
