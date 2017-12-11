const fs = require('fs-extra');
const mkdirp = require('mkdirp-promise');
const _ = require('lodash');
const constants = require('./constants');
const TrackListManager = require('./TrackListManager');
const BlocksManager = require('./BlocksManager');
const Recorder = require('./Recorder');

class StationManager {

	constructor() {
		this.loadStations();
	}

	loadStations() {
		const stationsFile = constants.stationsFile;
		try {
			this.stations = JSON.parse(fs.readFileSync(stationsFile));
			this.stations.forEach(station => {
				station.trackListManager = new TrackListManager(station.name);
				station.blocksManager = new BlocksManager(station.name, station.stream.format);
				station.blocksManager.synchronizeBlocks();
				station.recorder = new Recorder(station);
			});
			this.startRecording();
		} catch(e) {
			this.stations = [];
		}
	}

	startRecording(){
		this.stations.forEach(station => {
			if(station.recording){
				station.recorder.record();
			}
		});
	}

	addStation(name, streamUrl, logoUrl) {
		const station = {name};
		station.recording = false;
		station.stream = {url: streamUrl, format: 'mp3'};
		if(logoUrl){
			station.logo = logoUrl;
		}

		station.trackListManager = new TrackListManager(station.name);
		station.blocksManager = new BlocksManager(station.name, station.stream.format);
		station.blocksManager.synchronizeBlocks();
		station.recorder = new Recorder(station);

		this.stations.push(station);
		this.saveStations();
	}

	async saveStations() {
		await mkdirp(constants.configFolder);

		// don't serialize trackListManager and recorder
		const stations = this.stations.map(
			station => _.omit(station, ['trackListManager', 'blocksManager', 'recorder'])
		);

		await fs.writeFile(constants.stationsFile, JSON.stringify(stations, null, 4));
	}
}

module.exports = StationManager;