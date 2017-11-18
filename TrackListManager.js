const fs = require('fs-extra');
const moment = require('moment');
const constants = require('./constants');
const Track = require('./Track');

class TrackListManager {

	constructor(name) {
		this.name = name;
		this.tracks = [];
		this.loadTracks();
	}

	getTracksFile(){
		return constants.recordingsFolder + this.name + '/tracks.json';
	}

	loadTracks() {
		try {
			const json = fs.readFileSync(this.getTracksFile());
			this.tracks = JSON.parse(json).map(track => new Track(track));
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
		const json = JSON.stringify(this.tracks, null, 4);
		await fs.writeFile(this.getTracksFile(), json);	
	}

	getTracksFilteredAndSorted(searchTerm, sortColumn, sortOrder){
		return this.tracks.filter(track => 
			track.artist.toUpperCase().includes(searchTerm.toUpperCase())
			|| track.title.toUpperCase().includes(searchTerm.toUpperCase())
		).sort((track1, track2) => {
			if(sortColumn === 'artist' && sortOrder === 'asc'){
				return (track1.artist.toUpperCase() < track2.artist.toUpperCase()) ? -1 : 1;
			} else if(sortColumn === 'artist' && sortOrder === 'desc'){
				return (track1.artist.toUpperCase() > track2.artist.toUpperCase()) ? -1 : 1;
			} else if(sortColumn === 'title' && sortOrder === 'asc'){
				return (track1.title.toUpperCase() < track2.title.toUpperCase()) ? -1 : 1;
			} else if(sortColumn === 'title' && sortOrder === 'desc'){
				return (track1.title.toUpperCase() > track2.title.toUpperCase()) ? -1 : 1;
			} else if(sortColumn === 'length' && sortOrder === 'asc'){
				return (track1.getLength() < track2.getLength()) ? -1 : 1;
			} else if(sortColumn === 'length' && sortOrder === 'desc'){
				return (track1.getLength() > track2.getLength()) ? -1 : 1;
			} else if(sortColumn === 'time' && sortOrder === 'asc'){
				return (moment(track1.time, 'D.M.YYYY H:mm')
					.isBefore(moment(track2.time, 'D.M.YYYY H:mm'))) ? -1 : 1;
			} else if(sortColumn === 'time' && sortOrder === 'desc'){
				return (moment(track1.time, 'D.M.YYYY H:mm')
					.isAfter(moment(track2.time, 'D.M.YYYY H:mm'))) ? -1 : 1;
			} else {
				return 0;
			}
		});
	}
}

module.exports = TrackListManager;