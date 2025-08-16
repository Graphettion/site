// Media Player Class
function MediaPlayer(containerId) {
    this.container = document.getElementById(containerId);
    this.video = this.container.querySelector('#videoElement');
    this.videoContainer = this.container.querySelector('#videoContainer');
    this.playBtn = this.container.querySelector('#playBtn');
    this.playIcon = this.container.querySelector('#playIcon');
    this.playOverlay = this.container.querySelector('#playOverlay');
    this.rewindBtn = this.container.querySelector('#rewindBtn');
    this.forwardBtn = this.container.querySelector('#forwardBtn');
    this.timeDisplay = this.container.querySelector('#timeDisplay');
    this.progressBar = this.container.querySelector('#progressBar');
    this.progressFilled = this.container.querySelector('#progressFilled');
    this.volumeBtn = this.container.querySelector('#volumeBtn');
    this.volumeIcon = this.container.querySelector('#volumeIcon');
    this.volumeSlider = this.container.querySelector('#volumeSlider');
    this.volumeFilled = this.container.querySelector('#volumeFilled');
    this.ccBtn = this.container.querySelector('#ccBtn');
    this.languageDropdown = this.container.querySelector('#languageDropdown');
    this.languageBtn = this.container.querySelector('#languageBtn');
    this.languageMenu = this.container.querySelector('#languageMenu');
    this.fullscreenBtn = this.container.querySelector('#fullscreenBtn');
    this.controls = this.container.querySelector('#controls');

    this.isPlaying = false;
    this.currentVolume = 1;
    this.isMuted = false;
    this.currentLanguage = 'en';
    this.captionsEnabled = true;
    this.controlsTimeout = null;

    this.init();
}

MediaPlayer.prototype.init = function () {
    this.bindEvents();
    this.updateVolumeSlider();
    this.updateVolumeIcon();
    this.video.textTracks[0].mode = 'showing'; // Enable default captions
};

MediaPlayer.prototype.bindEvents = function () {
    var self = this;

    // Play/Pause
    this.playBtn.addEventListener('click', function () {
        self.togglePlay();
    });

    this.playOverlay.addEventListener('click', function () {
        self.togglePlay();
    });

    this.video.addEventListener('click', function () {
        self.togglePlay();
    });

    // Rewind/Forward
    this.rewindBtn.addEventListener('click', function () {
        self.rewind();
    });

    this.forwardBtn.addEventListener('click', function () {
        self.forward();
    });

    // Progress bar
    this.progressBar.addEventListener('click', function (e) {
        self.seek(e);
    });

    // Volume
    this.volumeBtn.addEventListener('click', function () {
        self.toggleMute();
    });

    this.volumeSlider.addEventListener('click', function (e) {
        self.setVolume(e);
    });

    // Closed Captions
    this.ccBtn.addEventListener('click', function () {
        self.toggleCaptions();
    });

    // Language dropdown
    this.languageBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        self.toggleLanguageDropdown();
    });

    var languageItems = this.languageMenu.querySelectorAll('.dropdown-item');
    for (var i = 0; i < languageItems.length; i++) {
        languageItems[i].addEventListener('click', function () {
            self.changeLanguage(this.dataset.lang);
        });
    }

    // Fullscreen
    this.fullscreenBtn.addEventListener('click', function () {
        self.toggleFullscreen();
    });

    // Video events
    this.video.addEventListener('timeupdate', function () {
        self.updateProgress();
        self.updateTime();
    });

    this.video.addEventListener('loadedmetadata', function () {
        self.updateTime();
    });

    this.video.addEventListener('play', function () {
        self.updatePlayButton(true);
    });

    this.video.addEventListener('pause', function () {
        self.updatePlayButton(false);
    });

    this.video.addEventListener('waiting', function () {
        self.showLoading(true);
    });

    this.video.addEventListener('canplay', function () {
        self.showLoading(false);
    });

    // Hide controls after inactivity
    this.container.addEventListener('mousemove', function () {
        self.showControls();
    });

    this.container.addEventListener('mouseleave', function () {
        self.hideControls();
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function () {
        self.closeDropdowns();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if (document.activeElement === document.body) {
            self.handleKeyboard(e);
        }
    });

    // Fullscreen change
    document.addEventListener('fullscreenchange', function () {
        self.handleFullscreenChange();
    });

    document.addEventListener('webkitfullscreenchange', function () {
        self.handleFullscreenChange();
    });
};

MediaPlayer.prototype.togglePlay = function () {
    if (this.video.paused) {
        this.video.play();
    } else {
        this.video.pause();
    }
};

MediaPlayer.prototype.updatePlayButton = function (isPlaying) {
    this.isPlaying = isPlaying;
    if (isPlaying) {
        this.playIcon.className = 'icon-pause';
        this.videoContainer.classList.remove('paused');
    } else {
        this.playIcon.className = 'icon-play';
        this.videoContainer.classList.add('paused');
    }
};

MediaPlayer.prototype.rewind = function () {
    this.video.currentTime = Math.max(0, this.video.currentTime - 10);
};

MediaPlayer.prototype.forward = function () {
    this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
};

MediaPlayer.prototype.seek = function (e) {
    var rect = this.progressBar.getBoundingClientRect();
    var pos = (e.clientX - rect.left) / rect.width;
    this.video.currentTime = pos * this.video.duration;
};

MediaPlayer.prototype.updateProgress = function () {
    if (this.video.duration) {
        var progress = (this.video.currentTime / this.video.duration) * 100;
        this.progressFilled.style.width = progress + '%';
    }
};

MediaPlayer.prototype.updateTime = function () {
    var current = this.formatTime(this.video.currentTime);
    var duration = this.formatTime(this.video.duration);
    this.timeDisplay.textContent = current + ' / ' + duration;
};

MediaPlayer.prototype.formatTime = function (time) {
    if (isNaN(time)) return '0:00';

    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time % 60);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};

MediaPlayer.prototype.toggleMute = function () {
    if (this.isMuted) {
        this.video.volume = this.currentVolume;
        this.isMuted = false;
    } else {
        this.currentVolume = this.video.volume;
        this.video.volume = 0;
        this.isMuted = true;
    }
    this.updateVolumeIcon();
    this.updateVolumeSlider();
};

MediaPlayer.prototype.setVolume = function (e) {
    var rect = this.volumeSlider.getBoundingClientRect();
    var pos = (e.clientX - rect.left) / rect.width;
    var volume = Math.max(0, Math.min(1, pos));

    this.video.volume = volume;
    this.currentVolume = volume;
    this.isMuted = volume === 0;

    this.updateVolumeIcon();
    this.updateVolumeSlider();
};

MediaPlayer.prototype.updateVolumeSlider = function () {
    var volume = this.isMuted ? 0 : this.video.volume;
    this.volumeFilled.style.width = (volume * 100) + '%';
};

MediaPlayer.prototype.updateVolumeIcon = function () {
    var volume = this.isMuted ? 0 : this.video.volume;
    var iconPath;

    if (volume === 0) {
        iconPath = 'M3,9V15H7L12,20V4L7,9H3M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12Z';
    } else if (volume < 0.5) {
        iconPath = 'M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z';
    } else {
        iconPath = 'M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z';
    }

    this.volumeIcon.querySelector('path').setAttribute('d', iconPath);
};

MediaPlayer.prototype.toggleCaptions = function () {
    this.captionsEnabled = !this.captionsEnabled;
    var textTracks = this.video.textTracks;

    for (var i = 0; i < textTracks.length; i++) {
        if (this.captionsEnabled && textTracks[i].language === this.currentLanguage) {
            textTracks[i].mode = 'showing';
        } else {
            textTracks[i].mode = 'hidden';
        }
    }

    // Update CC button appearance
    if (this.captionsEnabled) {
        this.ccBtn.style.color = '#6366f1';
        this.ccBtn.style.background = 'rgba(99, 102, 241, 0.1)';
    } else {
        this.ccBtn.style.color = '#ffffff';
        this.ccBtn.style.background = 'none';
    }
};

MediaPlayer.prototype.toggleLanguageDropdown = function () {
    this.languageDropdown.classList.toggle('open');
};

MediaPlayer.prototype.changeLanguage = function (lang) {
    this.currentLanguage = lang;
    var textTracks = this.video.textTracks;

    // Hide all tracks
    for (var i = 0; i < textTracks.length; i++) {
        textTracks[i].mode = 'hidden';
    }

    // Show selected language track
    if (lang !== 'off' && this.captionsEnabled) {
        for (var i = 0; i < textTracks.length; i++) {
            if (textTracks[i].language === lang) {
                textTracks[i].mode = 'showing';
                break;
            }
        }
    }

    // Update button text
    var langText = lang === 'en' ? 'EN' : lang === 'es' ? 'ES' : 'OFF';
    this.languageBtn.innerHTML = this.languageBtn.innerHTML.replace(/EN|ES|OFF/, langText);

    // Update active state in dropdown
    var items = this.languageMenu.querySelectorAll('.dropdown-item');
    for (var i = 0; i < items.length; i++) {
        items[i].classList.remove('active');
        if (items[i].dataset.lang === lang) {
            items[i].classList.add('active');
        }
    }

    this.closeDropdowns();
};

MediaPlayer.prototype.toggleFullscreen = function () {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Enter fullscreen
        if (this.container.requestFullscreen) {
            this.container.requestFullscreen();
        } else if (this.container.webkitRequestFullscreen) {
            this.container.webkitRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
};

MediaPlayer.prototype.handleFullscreenChange = function () {
    var isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;

    if (isFullscreen) {
        this.container.classList.add('fullscreen');
        // Change fullscreen icon to exit fullscreen
        this.fullscreenBtn.querySelector('path').setAttribute('d',
            'M14,14H19V16H16V19H14V14M5,14H10V19H8V16H5V14M8,5H10V10H5V8H8V5M19,8V10H14V5H16V8H19Z'
        );
    } else {
        this.container.classList.remove('fullscreen');
        // Change back to fullscreen icon
        this.fullscreenBtn.querySelector('path').setAttribute('d',
            'M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z'
        );
    }
};

MediaPlayer.prototype.showControls = function () {
    var self = this;
    this.controls.classList.add('show');

    // Clear existing timeout
    if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
    }

    // Hide controls after 3 seconds of inactivity
    if (this.isPlaying) {
        this.controlsTimeout = setTimeout(function () {
            self.controls.classList.remove('show');
        }, 3000);
    }
};

MediaPlayer.prototype.hideControls = function () {
    if (this.isPlaying) {
        this.controls.classList.remove('show');
    }
};

MediaPlayer.prototype.closeDropdowns = function () {
    this.languageDropdown.classList.remove('open');
};

MediaPlayer.prototype.showLoading = function (show) {
    if (show) {
        this.videoContainer.classList.add('loading');
    } else {
        this.videoContainer.classList.remove('loading');
    }
};

MediaPlayer.prototype.handleKeyboard = function (e) {
    switch (e.code) {
        case 'Space':
            e.preventDefault();
            this.togglePlay();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            this.rewind();
            break;
        case 'ArrowRight':
            e.preventDefault();
            this.forward();
            break;
        case 'ArrowUp':
            e.preventDefault();
            this.video.volume = Math.min(1, this.video.volume + 0.1);
            this.updateVolumeSlider();
            break;
        case 'ArrowDown':
            e.preventDefault();
            this.video.volume = Math.max(0, this.video.volume - 0.1);
            this.updateVolumeSlider();
            break;
        case 'KeyM':
            e.preventDefault();
            this.toggleMute();
            break;
        case 'KeyF':
            e.preventDefault();
            this.toggleFullscreen();
            break;
        case 'KeyC':
            e.preventDefault();
            this.toggleCaptions();
            break;
    }
};

// Initialize the media player
var player = new MediaPlayer('mediaPlayer');

// Demo: Add some sample subtitle content
window.addEventListener('load', function () {
    // Create English subtitles
    var englishTrack = player.video.textTracks[0];
    if (englishTrack && englishTrack.cues.length === 0) {
        try {
            englishTrack.addCue(new VTTCue(1, 5, 'Welcome to the custom media player'));
            englishTrack.addCue(new VTTCue(6, 10, 'This player supports multiple languages'));
            englishTrack.addCue(new VTTCue(11, 15, 'And many advanced features'));
        } catch (e) {
            // Fallback for browsers that don't support VTTCue
            console.log('VTTCue not supported');
        }
    }

    // Create Spanish subtitles
    var spanishTrack = player.video.textTracks[1];
    if (spanishTrack && spanishTrack.cues.length === 0) {
        try {
            spanishTrack.addCue(new VTTCue(1, 5, 'Bienvenido al reproductor multimedia personalizado'));
            spanishTrack.addCue(new VTTCue(6, 10, 'Este reproductor admite múltiples idiomas'));
            spanishTrack.addCue(new VTTCue(11, 15, 'Y muchas características avanzadas'));
        } catch (e) {
            console.log('VTTCue not supported');
        }
    }
});