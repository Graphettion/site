// video-player.js
class VideoPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['src'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'src' && this.shadowRoot) {
      const video = this.shadowRoot.querySelector('video');
      if (video) {
        video.src = newValue;
      }
    }
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }

        .container {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #1a1a1a;
        }

        video {
          width: 100%;
          display: block;
        }

        :host([fullscreen]) .container {
          border-radius: 0;
          width: 100vw;
          height: 100vh;
        }

        :host([fullscreen]) video {
          height: 100%;
          object-fit: contain;
        }

        .controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          display: flex;
          flex-direction: column;
          gap: 10px;
          opacity: 1;
          transition: opacity 0.3s;
          z-index: 2147483647;
        }

        .container:not(:hover) .controls {
          opacity: 0;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          position: relative;
          border-radius: 2px;
        }

        .progress-fill {
          height: 100%;
          background: #ffffff;
          width: 0%;
          position: absolute;
          border-radius: 2px;
          transition: width 0.1s;
        }

        .buttons-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #ffffff;
        }

        .left-controls, .right-controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        button {
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }

        button:hover {
          opacity: 0.8;
        }

        .time-display {
          font-family: sans-serif;
          font-size: 14px;
          color: #ffffff;
        }

        svg {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }

        .volume-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .volume-slider-container {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          padding: 10px;
          border-radius: 4px;
          display: none;
          flex-direction: column;
          align-items: center;
          width: 40px;
          height: 100px;
          z-index: 2147483647;
        }

        .volume-container:hover .volume-slider-container {
          display: flex;
        }

        :host([fullscreen]) .volume-slider-container {
          position: fixed;
          bottom: 80px;
        }

        .volume-slider {
          writing-mode: bt-lr;
          -webkit-appearance: slider-vertical;
          width: 8px;
          height: 80px;
          background: rgba(255, 255, 255, 0.3);
          outline: none;
          border-radius: 4px;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #ffffff;
          border-radius: 50%;
          cursor: pointer;
        }

        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #ffffff;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        :host([fullscreen]) .controls {
          position: fixed;
        }
      </style>

      <div class="container">
        <video src="${this.getAttribute('src') || ''}"></video>
        <div class="controls">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="buttons-container">
            <div class="left-controls">
              <button class="play-pause">
                <svg viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <button class="rewind">
                <svg viewBox="0 0 24 24">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
              </button>
              <button class="forward">
                <svg viewBox="0 0 24 24">
                  <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                </svg>
              </button>
              <span class="time-display">0:00 / 0:00</span>
            </div>
            <div class="right-controls">
              <div class="volume-container">
                <button class="volume">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                </button>
                <div class="volume-slider-container">
                  <input type="range" class="volume-slider" min="0" max="100" value="100" orient="vertical">
                </div>
              </div>
              <button class="fullscreen">
                <svg viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const container = this.shadowRoot.querySelector('.container');
    const video = this.shadowRoot.querySelector('video');
    const playPauseBtn = this.shadowRoot.querySelector('.play-pause');
    const rewindBtn = this.shadowRoot.querySelector('.rewind');
    const forwardBtn = this.shadowRoot.querySelector('.forward');
    const volumeBtn = this.shadowRoot.querySelector('.volume');
    const volumeSlider = this.shadowRoot.querySelector('.volume-slider');
    const fullscreenBtn = this.shadowRoot.querySelector('.fullscreen');
    const progressBar = this.shadowRoot.querySelector('.progress-bar');
    const progressFill = this.shadowRoot.querySelector('.progress-fill');
    const timeDisplay = this.shadowRoot.querySelector('.time-display');

    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
      } else {
        video.pause();
        playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      }
    });

    // Skip buttons
    rewindBtn.addEventListener('click', () => {
      video.currentTime = Math.max(video.currentTime - 10, 0);
    });

    forwardBtn.addEventListener('click', () => {
      video.currentTime = Math.min(video.currentTime + 10, video.duration);
    });

    // Progress bar
    video.addEventListener('timeupdate', () => {
      const progress = (video.currentTime / video.duration) * 100;
      progressFill.style.width = `${progress}%`;
      timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    });

    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
    });

    // Volume control
    volumeSlider.addEventListener('input', (e) => {
      const volume = e.target.value / 100;
      video.volume = volume;
      updateVolumeIcon(volume);
    });

    volumeBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (video.muted) {
        volumeSlider.value = 0;
      } else {
        volumeSlider.value = video.volume * 100;
      }
      updateVolumeIcon(video.muted ? 0 : video.volume);
    });

    const updateVolumeIcon = (volume) => {
      let path;
      if (volume === 0) {
        path = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
      } else if (volume < 0.5) {
        path = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
      } else {
        path = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
      }
      volumeBtn.innerHTML = `<svg viewBox="0 0 24 24">${path}</svg>`;
    };

    // Fullscreen
    const toggleFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await container.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.error('Error toggling fullscreen:', err);
      }
    };

    fullscreenBtn.addEventListener('click', toggleFullscreen);
    video.addEventListener('dblclick', toggleFullscreen);

    const updateFullscreenButton = () => {
      const isFullscreen = document.fullscreenElement === container;
      
      fullscreenBtn.innerHTML = isFullscreen ?
        '<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>' :
        '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
      
      this.toggleAttribute('fullscreen', isFullscreen);
    };

    document.addEventListener('fullscreenchange', updateFullscreenButton);
  }
}

// Helper function to format time
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Register the custom element
customElements.define('video-player', VideoPlayer);