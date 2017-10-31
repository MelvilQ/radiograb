const fs = require('fs-extra');
const constants = require('./constants');

class TrackListManager {

	constructor(name) {
		this.name = name;
		this.tracks = [];
		this.loadTracks();
	}

	getTracksFile(){
		return constants.recordingsFolder + this.name + '/tracks.json';
	}

	async loadTracks() {
		try {
			const json = await fs.readFile(this.getTracksFile())
			this.tracks = JSON.parse(json);
		} catch(e){
			console.log('no tracks.json for station ' + this.name);
		}
	}

	addTrack(track){
		this.tracks.push(track);
		this.saveTracks();
	}

	removeTrack(track){
		this.tracks = this.tracks.filter(t => t !== track);
		this.saveTracks();
	}

	async saveTracks(){
		await fs.writeFile(this.getTracksFile(), JSON.stringify(this.tracks));	
	}
}

module.exports = TrackListManager;