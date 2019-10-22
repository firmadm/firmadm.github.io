import { LitElement, css, html, SharedStyles, store, PageViewElement } from './my-app.js';
const CAPTURE = 'CAPTURE';
const CLEAR = 'CLEAR';

const capture = payload => {
  return {
    type: CAPTURE,
    payload: payload
  };
};

const clear = () => {
  return {
    type: CLEAR
  };
};

var camera = {
  CAPTURE: CAPTURE,
  CLEAR: CLEAR,
  capture: capture,
  clear: clear
};
const INITIAL_STATE = {
  player: undefined
};

const camera$1 = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CAPTURE:
      return {
        player: action.payload
      };

    case CLEAR:
      return {
        player: undefined
      };

    default:
      return state;
  }
};

var camera$2 = {
  'default': camera$1
};
store.addReducers({
  camera: camera$1
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

class MyView1 extends PageViewElement {
  static get styles() {
    return [SharedStyles];
  }

  render() {
    return html`
        <camera-element />
    `;
  }

}

window.customElements.define('my-view1', MyView1);
export { camera as $camera, camera$2 as $camera$1, camera$1 as $cameraDefault, CAPTURE, CLEAR, capture, clear };