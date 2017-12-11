const fs = require('fs-extra');
const mkdirp = require('mkdirp-promise');
const constants = require('./constants');

class SettingsManager {

	constructor(){
		this.loadSettings();
	}

	loadSettings(){
		try {
			const json = fs.readFileSync(constants.settingsFile);
			this.settings = JSON.parse(json);
		} catch(e){
			console.log('no settings.json, using defaults');
			this.settings = {
				volume: 80,
				displayMode: 'timeline',
				saveFolder: '',
				timelineScale: 0.5
			};
		}
	}

	setLastStation(station){
		this.settings.lastStation = station.name;
		this.saveSettings();
	}

	setVolume(volume){
		this.settings.volume = volume;
		this.saveSettings();
	}

	setDisplayMode(mode){
		this.settings.displayMode = mode;
		this.saveSettings();
	}

	setTimelineScale(scale){
		this.settings.timelineScale = scale;
		this.saveSettings();
	}

	async saveSettings(){
		await mkdirp(constants.configFolder);
		await fs.writeFile(constants.settingsFile, JSON.stringify(this.settings, null, 4));
	}
}

module.exports = SettingsManager;