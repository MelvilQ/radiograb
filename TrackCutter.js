const { exec } = require('child-process-promise');
const constants = require('./constants');

class TrackCutter {

	async saveTrack(track, station, outputFolder, fileName){
		const source = constants.recordingsFolder + station.name + '/' + track.take;
		const dest = outputFolder + '/' + fileName;
		const cmd = 'ffmpeg -i "' + source + '" -ss ' + track.start + ' -to ' + track.end 
			+ ' -metadata artist="' + track.artist + '" -metadata title="' + track.title + '"'
			+ ' -y "' + dest + '"';
		try {
			await exec(cmd);
		} catch(e){
			console.log(e);
		}
	}
}

module.exports = TrackCutter;