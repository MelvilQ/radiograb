const fs = require('fs-extra');
const _ = require('lodash');
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

	async saveStations() {
		// don't serialize trackListManager and recorder
		const stations = this.stations.map(station => _.omit(station, ['trackListManager', 'recorder']));
		await fs.writeFile(constants.stationsFile, JSON.stringify(stations, null, 4));
	}
}

module.exports = StationManager;