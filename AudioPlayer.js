class AudioPlayer {

	constructor() {
		this.audio = null;
		this.mode = null;
		this.isPlaying = false;
		this.isPaused = false;
		this.volume = 100;
	}

	playLive(url){
		if(this.audio){
			this.stop();
		}
		this.audio = new Audio(url);
		this.applyVolume();
		this.audio.play();
		this.isPlaying = true;
		this.mode = "live";
	}

	playRecording(file, start, offset, duration){
		if(this.audio){
			this.stop();
		}
		if(!offset){
			offset = 0;
		}
		this.audio = new Audio(file);
		this.applyVolume();
		this.audio.currentTime = start + offset;
		this.audio.play();
		this.isPlaying = true;
		if(duration){
			this.timeout = setTimeout(() => this.audio.pause(), duration*1000);
		}
		this.mode = "recording";
	}

	continue(){
		if(this.audio && this.isPaused){
			this.audio.play();
			this.isPlaying = true;
			this.isPaused = false;
		}
	}

	pause(){
		if(this.audio && this.isPlaying){
			this.audio.pause();
			this.isPlaying = false;
			this.isPaused = true;
		}
	}

	stop(){
		if(this.audio){
			this.audio.pause();
			this.isPlaying = false;
		}
		if(this.timeout){
			clearTimeout(this.timeout);
			this.timeout = null;
		}
		this.audio = null;
		this.mode = null;
	}

	applyVolume(){
		if(this.audio){
			this.audio.volume = this.volume / 100;
		}
	}

}

module.exports = AudioPlayer;