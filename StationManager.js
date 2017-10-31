const fs = require('fs-extra');
const constants = require('./constants');
const TrackListManager = require('./TrackListManager');
const Recorder = require('./Recorder');

class StationManager {

	constructor() {
		this.loadStations();
	}

	loadStations() {
		const stationsFile = constants.stationsFile;
		this.stations = JSON.parse(fs.readFileSync(stationsFile));
		this.stations.forEach(station => {
			station.trackListManager = new TrackListManager(station.name);
			station.recorder = new Recorder(station);
		});
	}

	startRecording(){
		this.stations.forEach(station => {
			if(station.recording){
				station.recorder.record();
			}
		});
		
	}

	saveStations() {
		// TODO: implement, don't serialize trackListManager and recorder
	}
}

module.exports = StationManager;