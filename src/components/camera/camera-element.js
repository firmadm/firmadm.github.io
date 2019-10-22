import { css, html, LitElement } from "../../../node_modules/lit-element/lit-element.js"; // These are the shared styles needed by this element.

import { SharedStyles } from '../shared-styles.js';
import './camera-capture.js';
import './camera-viewer.js';
import { store } from '../../store.js';

class CameraElement extends LitElement {
  static get styles() {
    return [SharedStyles, css`
        host: {
          height: 100%;
          width: 100%;
        }

        [hidden] {
          display: none;
        }
      `];
  }

  render() {
    let state = store.getState();
    return html`
        <camera-viewer .hidden=${state.camera.player == undefined}></camera-viewer>  
        <camera-capture .hidden=${state.camera.player != undefined}></camera-capture>
      `;
  }

  firstUpdated() {
    store.subscribe(() => {
      this.requestUpdate();
    });
  }

}

window.customElements.define('camera-element', CameraElement);