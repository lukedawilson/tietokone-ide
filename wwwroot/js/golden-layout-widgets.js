import 'http://code.jquery.com/jquery-1.11.1.min.js';

class GoldenLayoutWidgets extends HTMLElement {
  constructor() {
    super();
    this.layout = null;
    this.childElements = Array.from(this.children);
    this.innerHTML = '';
  }

  connectedCallback() {
    const scriptSrc = 'https://golden-layout.com/files/latest/js/goldenlayout.min.js';

    if (Array.from(document.head.childNodes).filter(x => x.src === scriptSrc).length) {
      this.initialise();
      return;
    }

    // load goldenlayout.min.js without strict mode
    const _this = this;
    (function() {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.onload = () => _this.initialise();
      document.head.appendChild(script);
    })();
  }

  initialise() {
    const childElements = this.childElements;

    this.layout = new window.GoldenLayout({
      settings: {
        showPopoutIcon: false,
        showMaximiseIcon: false,
        showCloseIcon: false,
        hasHeaders: true,
        reorderEnabled: true,
      },
      dimensions: {
        headerHeight: 30,
      },
      content: [
        {
          type: 'column',
          content: childElements.map(child => ({
            type: 'component',
            componentName: child.dataset.name,
            isClosable: false,
            title: child.dataset.title,
          }))
        }
      ]
    });

    for (const child of childElements) {
      this.layout.registerComponent(child.dataset.name, function(container) {
        container.getElement().html(child);
      });
    }

    this.layout.init();
  }

  disconnectedCallback() {
    if (this.layout) {
      this.layout.destroy();
      this.layout = null;
    }
  }
}

customElements.define('golden-layout-widgets', GoldenLayoutWidgets);
