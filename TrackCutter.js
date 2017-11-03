const { exec } = require('child-process-promise');
const constants = require('./constants');

class TrackCutter {

	async saveTrack(track, station, outputFolder){
		const source = constants.recordingsFolder + station.name + '/' + track.take;
		const dest = outputFolder + '/' + track.artist + ' - ' + track.title + '.' + station.stream.format;
		const cmd = 'ffmpeg -i "' + source + '" -ss ' + track.start + ' -to ' + track.end + ' -y "' + dest + '"';
		try {
			await exec(cmd);
		} catch(e){
			console.log(e);
		}
	}
}

module.exports = TrackCutter;