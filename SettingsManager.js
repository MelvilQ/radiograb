const fs = require('fs-extra');
const constants = require('./constants');

class SettingsManager {

	constructor(){
		this.settings = {};
		this.loadSettings();
	}

	loadSettings(){
		try {
			const json = fs.readFileSync(constants.settingsFile);
			this.settings = JSON.parse(json);
		} catch(e){
			console.log('no settings.json for station ' + this.name);
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

	async saveSettings(){
		await fs.writeFile(constants.settingsFile, JSON.stringify(this.settings, null, 4));
	}
}

module.exports = SettingsManager;