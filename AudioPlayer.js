const moment = require('moment');
const _ = require('lodash');
const constants = require('./constants');

class AudioPlayer {

	constructor() {
		this.audio = null;
		this.mode = null;
		this.isPlaying = false;
		this.isPaused = false;
		this.volume = 100;
		this.playingPosition = null;
		this.currentPlayingTime = null;
	}

	play(source, start, end) {
		if(this.audio){
			this.stop();
		}
		this.audio = new Audio(source + '?' + _.random(10000000)); // prevent caching to ensure that rollover works
		this.applyVolume();
		this.start = start ? start : null;
		this.audio.currentTime = start ? start : 0;
		this.playingPosition = start ? start : 0;
		this.end = end ? end : null;
		this.audio.addEventListener('timeupdate', () => {
			this.playingPosition = this.audio ? this.audio.currentTime : null;
			this.updateCurrentPlayingTime();
			if(this.audio && this.end && this.audio.currentTime >= this.end){
				this.stop();
			}
		});
		this.audio.play();
		this.isPlaying = true;
		this.isPaused = false;
	}

	playLive(station) {
		this.mode = 'live';
		this.file = null;
		this.play(station.stream.url);
	}

	playTrack(track, stationName){
		this.mode = 'track';
		this.file = track.take;
		const path = constants.recordingsFolder + stationName + '/' + track.take;
		this.play(path, track.start, track.end);
	}

	playTrackCut(take, stationName, start){
		this.mode = 'cut';
		this.file = take;
		const path = constants.recordingsFolder + stationName + '/' + take;
		this.play(path, start, start + 4);
	}
	
	playTimeline(block, start, isLive){
		this.mode = 'timeline';
		this.file = block.file;
		this.play(block.path, start);
		
		if(isLive){
			// in live mode we have to reload the file from time to time (rollover)
			// because the HTML5 player does not pull the new data automatically
			this.audio.addEventListener('ended', () => {
				if(this.audio){
					console.log('rollover playing live block');
					this.playTimeline(block, this.audio.currentTime, true);
				}
			});
		} else {
			this.audio.addEventListener('ended', () => {
				this.isPlaying = false;
				this.isPaused = false;
				this.audio = null;
				this.mode = null;
			});
		}
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
			this.isPaused = false;
		}
		this.audio = null;
	}

	applyVolume(){
		if(this.audio){
			this.audio.volume = this.volume / 100;
		}
	}

	getProgress(){
		if(!this.audio || !this.start || !this.end){
			return null;
		}
		return ((this.audio.currentTime - this.start) / (this.end - this.start));
	}

	updateCurrentPlayingTime(){
		if(!this.audio){
			this.currentPlayingTime = null;
			return;
		}
		let time;
		if(this.mode === 'live'){
			time = moment();
		} else {
			time = moment(parseInt(this.file.replace('.mp3')) + 1000 * this.audio.currentTime);
		} 
		this.currentPlayingTime = time.format('D.M.YYYY H:mm:ss');
	}

}

module.exports = AudioPlayer;