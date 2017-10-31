const fs = require('fs-extra');
const request = require('request');
const jpath = require('json-path');
const moment = require('moment');
const mkdirp = require('mkdirp-promise');
const constants = require('./constants');

class Recorder {

	constructor(station){
		this.station = station;
		this.trackListManager = station.trackListManager;		
		this.stationFolder = constants.recordingsFolder + this.station.name;
		this.currentTrack = null;
		this.startOfStream = null;	
		this.audioFileName = null;	
	}

	async record() {
		await mkdirp(this.stationFolder);
		this.audioFileName = moment().valueOf() + '.' + this.station.stream.format;
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
		if(this.currentTrack){
			this.currentTrack.end = moment().diff(this.startOfStream, 'seconds', true);
			this.currentTrack.length = Math.round(this.currentTrack.end - this.currentTrack.start);
			this.currentTrack.complete = false;
			this.trackListManager.addTrack(this.currentTrack);
		}
	}

	checkSongInfo() {
		request({url: this.station.songInfo.url, json: true}, (err, res, body) => {
			const artist = jpath.resolve(body, this.station.songInfo.tags.artist)[0];
			const title = jpath.resolve(body, this.station.songInfo.tags.title)[0];
			const elapsed = moment().diff(this.startOfStream, 'seconds', true);
			if(this.currentTrack && this.currentTrack.artist === artist && this.currentTrack.title === title){
				return;		
			}
			const track = {
				artist, 
				title, 
				start: elapsed,
				time: moment().format('D.M.YYYY H:mm'),
				take: this.audioFileName
			};
			if(!this.currentTrack){
				// start first track
				track.complete = false;
				this.currentTrack = track;
			} else {
				// save old track
				this.currentTrack.end = elapsed;
				this.currentTrack.length = Math.floor(this.currentTrack.end - this.currentTrack.start);
				this.trackListManager.addTrack(this.currentTrack);
				// start new track
				track.complete = true;
				this.currentTrack = track;
			}
		});
	}
}

module.exports = Recorder;




