import { LitElement, html } from 'lit';
import u from 'umbrellajs';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/components/split-panel/split-panel.js';

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
    this.consoleOutput = '\n';

    const _this = this;
    const outputDiv = u('#console-output').first();

    const consoleLog = console.log;
    console.log = (...args) => {
      const height = outputDiv.clientHeight;
      _this.consoleOutput += `${args.join(' ').trim()}\n`;
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
              <a class="btn btn-square btn-secondary ${this.runEnabled ? '' : 'disabled'}"
                 title="Run code..."
                 @click=${this.run}>
                <i style="font-size: 52px !important; left: -8px;"
                   class="material-symbols-outlined">play_arrow
                </i>
              </a>
            </li>
          </ul>
          <ul class="right">
            <li>
              <a class="btn btn-square btn-secondary"
                 title="Share session..."
                 @click=${this.share}>
                <i style="font-size: 32px !important;"
                   class="material-symbols-outlined">content_paste_go
                </i>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <code-editor-grid>
        <div class="grid blue-grey darken-4">
          <div>
            <ace-editor @content-changed=${this.onCodeChange}></ace-editor>
          </div>

          <div class="gutter-row-1 gutter-row-2"></div>

          <div class="console">
            <textarea id="console-output" class="p3 blue-grey darken-4 white-text" readonly>
              ${this.consoleOutput}
            </textarea>
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
