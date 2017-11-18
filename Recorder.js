const fs = require('fs-extra');
const request = require('request');
const jpath = require('json-path');
const moment = require('moment');
const mkdirp = require('mkdirp-promise');
const constants = require('./constants');
const Track = require('./Track');

class Recorder {

	constructor(station){
		this.station = station;
		this.trackListManager = station.trackListManager;
		this.blocksManager = station.blocksManager;		
		this.stationFolder = constants.recordingsFolder + this.station.name;
		this.currentTrack = null;
		this.startOfStream = null;	
		this.audioFileName = null;	
	}

	async record() {
		await mkdirp(this.stationFolder);
		const blockStart = moment().valueOf();
		this.blocksManager.notifyLiveBlockStart(blockStart);
		this.audioFileName = blockStart + '.' + this.station.stream.format;
		this.audioFileWriter = fs.createWriteStream(
			this.stationFolder + '/' + this.audioFileName,
			{encoding: 'binary'}
		);
		this.streamReader = request(this.station.stream.url);
		this.streamReader.pipe(this.audioFileWriter);

		this.startOfStream = moment();
		this.station.recording = true;
		console.log('started recording ' + this.station.name);
		
		this.currentTrack = null;
		this.checkSongInfo();		
		this.songInfoDownloader = setInterval(() => this.checkSongInfo(), 1000);
	}

	stop() {
		this.station.recording = false;
		console.log('stopped recording ' + this.station.name);
		this.streamReader.pause();
		clearInterval(this.songInfoDownloader);
		this.blocksManager.notifyLiveBlockEnd();
		this.addCurrentTrackToList();
	}

	checkSongInfo() {
		request({url: this.station.songInfo.url, json: true}, (err, res, body) => {
			const artist = jpath.resolve(body, this.station.songInfo.tags.artist)[0];
			const title = jpath.resolve(body, this.station.songInfo.tags.title)[0];
			if(!artist || !title){
				return;
			}
			const elapsed = parseFloat(moment().diff(this.startOfStream, 'seconds', true).toFixed(1));
			const timeStr = moment().format('D.M.YYYY H:mm');
			if(this.currentTrack && this.currentTrack.artist === artist && this.currentTrack.title === title){
				return;		
			}
			const track = new Track(artist, title, elapsed, timeStr, this.audioFileName);
			if(!this.currentTrack){
				// start first track
				this.currentTrack = track;
			} else {
				// save old track
				this.addCurrentTrackToList();
				// start new track
				track.complete = true;
				this.currentTrack = track;
			}
		});
	}

	addCurrentTrackToList(){
		if (!this.currentTrack){
			return;
		}
		this.currentTrack.end = parseFloat(moment().diff(this.startOfStream, 'seconds', true).toFixed(1));
		this.trackListManager.addTrack(this.currentTrack);
	}
}

module.exports = Recorder;




