import { css, html, LitElement } from "../../../node_modules/lit-element/lit-element.js"; // These are the shared styles needed by this element.

import { SharedStyles } from '../shared-styles.js'; // This element is connected to the Redux store.

import { store } from '../../store.js';
import { capture, clear } from '../../actions/camera.js';
import camera from '../../reducers/camera.js';
store.addReducers({
  camera
});

class CameraCapture extends LitElement {
  static get styles() {
    // cover the whole screen
    return [SharedStyles, css`
                
                video {
                    height: 100vh;
                }
                #video_box{
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,.7);
                    
                    overflow: hidden;
                }
                #video_overlays {
                    position: absolute;
                    width:100%;
                    min-height:100px;
                    background-color:#000;
                    color: red;
                    opacity: 0.5;
                    bottom: 0;
                }
                button {
                    opacity: 1.0;
                    color: red;
                    font-size: 25px;
                }
                
            `];
  }

  render() {
    return html`
    
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.css">
        <!-- <link rel="stylesheet" href="../../fonts/fontawesome/css/all.css"> -->
    
        <div id="video_box">
        <video id="player" autoplay></video>
            <div id="video_overlays">
                <button id="capture" @click="${this._capture}" title="Capture">capture<i class="fa fa-camera"></i></button>
            </div>

            
        </div>        
    `;
  }

  firstUpdated() {
    const player = this.shadowRoot.getElementById('player');
    const captureButton = this.shadowRoot.getElementById('capture');
    const constraints = {
      video: {
        facingMode: {
          exact: "environment"
        }
      }
    }; //   const constraints = {
    //     video: true
    //   };

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      player.srcObject = stream;
    });
  }

  _capture() {
    const player = this.shadowRoot.getElementById('player');
    store.dispatch(capture(player));
  }

}

window.customElements.define('camera-capture', CameraCapture);