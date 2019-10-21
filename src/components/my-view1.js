import{LitElement,css,html,SharedStyles,store,PageViewElement}from"./my-app.js";const CAPTURE="CAPTURE",CLEAR="CLEAR",capture=payload=>{return{type:CAPTURE,payload:payload}},clear=()=>{return{type:CLEAR}};var camera={CAPTURE:CAPTURE,CLEAR:CLEAR,capture:capture,clear:clear};const INITIAL_STATE={player:void 0},camera$1=(state=INITIAL_STATE,action)=>{switch(action.type){case CAPTURE:return{player:action.payload};case CLEAR:return{player:void 0};default:return state;}};var camera$2={default:camera$1};store.addReducers({camera:camera$1});class CameraCapture extends LitElement{static get styles(){return[SharedStyles,css`
        :host {
          width: 100vw;
          height: 100vh;
        }

        video {
          width: 100%;
          height: 100%;
        }
        
      `]}render(){return html`
        <video id="player" controls autoplay></video>
        
        <button id="capture" @click="${this._capture}" title="Capture">Capture</button>
    `}firstUpdated(){const player=this.shadowRoot.getElementById("player"),captureButton=this.shadowRoot.getElementById("capture"),constraints={video:!0};navigator.mediaDevices.getUserMedia(constraints).then(stream=>{player.srcObject=stream})}_capture(){const player=this.shadowRoot.getElementById("player");store.dispatch(capture(player))}}window.customElements.define("camera-capture",CameraCapture);class CameraViewer extends LitElement{static get styles(){return[SharedStyles,css`
        :host {
            width: 100vw;
            height: 100vh;  
        }
        canvas {
          width: 100%;
          height: 100%;
        }
      `]}render(){return html`
        
        <canvas id="canvas"></canvas>
        <button id="delete" @click="${this._clear}" title="Clear">Clear</button>
        
    `}_clear(){store.dispatch(clear())}_showCapture(player){const canvas=this.shadowRoot.getElementById("canvas"),context=canvas.getContext("2d");context.drawImage(player,0,0,canvas.width,canvas.height)}firstUpdated(){store.subscribe(()=>{let state=store.getState();if(state.camera.player){this._showCapture(state.camera.player)}})}}window.customElements.define("camera-viewer",CameraViewer);class CameraElement extends LitElement{static get styles(){return[SharedStyles,css`
        host: {
          height: 100%;
          width: 100%;
        }

        [hidden] {
          display: none;
        }
      `]}render(){let state=store.getState();return html`
        <camera-viewer .hidden=${state.camera.player==void 0}></camera-viewer>  
        <camera-capture .hidden=${state.camera.player!=void 0}></camera-capture>
      `}firstUpdated(){store.subscribe(()=>{this.requestUpdate()})}}window.customElements.define("camera-element",CameraElement);class MyView1 extends PageViewElement{static get styles(){return[SharedStyles]}render(){return html`
        <camera-element />
    `}firstUpdated(){const player=this.shadowRoot.getElementById("player"),canvas=this.shadowRoot.getElementById("canvas"),context=canvas.getContext("2d"),captureButton=this.shadowRoot.getElementById("capture"),constraints={video:!0};captureButton.addEventListener("click",()=>{// Draw the video frame to the canvas.
context.drawImage(player,0,0,canvas.width,canvas.height)});// Attach the video stream to the video element and autoplay.
navigator.mediaDevices.getUserMedia(constraints).then(stream=>{player.srcObject=stream})}}window.customElements.define("my-view1",MyView1);export{camera as $camera,camera$2 as $camera$1,camera$1 as $cameraDefault,CAPTURE,CLEAR,capture,clear};