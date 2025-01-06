import { LitElement, html } from 'lit';
import Split from 'split-grid';
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
    this.splitGrid = null;
  }

  /**
   * Initialises the split grid and websocket connection.
   */
  async firstUpdated(_) {
    // initialise and configure split grid
    this.splitGrid = Split({
      minSize: 0,
      snapOffset: 0,
      rowGutters: [{
        track: 1,
        element: u('.gutter-row-1').first(),
      }]
    })

    window.addEventListener('resize', this.setViewportHeightCssVar);
    window.addEventListener('orientationchange', this.setViewportHeightCssVar);
    this.setViewportHeightCssVar();

    // configure ws connection
    this.connection = new signalR.HubConnectionBuilder().withUrl("/code-updates").build();

    const _this = this;
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
   * Cleans up the split grid and websocket connection.
   */
  async disconnectedCallback() {
    super.disconnectedCallback();

    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }

    if (this.splitGrid) {
      this.splitGrid.destroy();
      this.splitGrid = null;
    }

    window.removeEventListener('resize', this.setViewportHeightCssVar);
    window.removeEventListener('orientationchange', this.setViewportHeightCssVar);
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

  /**
   * This is used by the grid layout CSS.
   */
  setViewportHeightCssVar() {
    u(document.documentElement).first().style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
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
      
      <div class="grid blue-grey darken-4">
        <ace-editor @content-changed=${this.onCodeChange}></ace-editor>

        <div class="gutter-row-1 gutter-row-2"></div>

        <textarea id="console-output" class="p3 blue-grey darken-4 white-text console" readonly>
          ${this.consoleOutput}
        </textarea>
      </div>
  `;
  }

  /**
   * Do not use shadow DOM, so global styles (e.g. Materialize CSS) can be applied.
   */
  createRenderRoot() { return this; }
}

customElements.define('code-editor-page', CodeEditorPage);
