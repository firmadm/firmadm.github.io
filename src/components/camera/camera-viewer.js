import { css, html, LitElement } from "../../../node_modules/lit-element/lit-element.js"; // These are the shared styles needed by this element.

import { SharedStyles } from '../shared-styles.js';
import { store } from '../../store.js';
import { CAPTURE, CLEAR, capture, clear } from '../../actions/camera.js';
import camera from '../../reducers/camera.js';

class CameraViewer extends LitElement {
  static get styles() {
    return [SharedStyles, css`
        :host {
            width: 100vw;
            height: 100vh;  
        }
        canvas {
          width: 100%;
          height: 100%;
        }
      `];
  }

  render() {
    return html`
        
        <canvas id="canvas"></canvas>
        <button id="delete" @click="${this._clear}" title="Clear">Clear</button>
        
    `;
  }

  _clear() {
    store.dispatch(clear());
  }

  _showCapture(player) {
    const canvas = this.shadowRoot.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(player, 0, 0, canvas.width, canvas.height);
  }

  firstUpdated() {
    store.subscribe(() => {
      let state = store.getState();

      if (state.camera.player) {
        this._showCapture(state.camera.player);
      }
    });
  }

}

window.customElements.define('camera-viewer', CameraViewer);