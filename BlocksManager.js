const fs = require('fs-extra');
const moment = require('moment');
const mp3Duration = require('mp3-duration');
const constants = require('./constants');

class BlocksManager {

	constructor(name, format){
		this.name = name;
		this.format = format;
		this.blocks = [];
		this.loadBlocks();
	}

	async loadBlocks(){
		const folder = constants.recordingsFolder + this.name;
		const recordings = await fs.readdir(folder);
		recordings.sort();
		recordings.reverse(); // sort filenames descending
		for(let recording of recordings){
			if(!recording.endsWith('.' + this.format)){
				continue;
			}
			const filePath = folder + '/' + recording;
			const duration = await mp3Duration(filePath);
			const timestampStart = parseInt(recording.replace('.' + this.format));
			const timestampEnd = timestampStart + duration;
			const block = {
				file: filePath,
				start: moment(timestampStart),
				end: moment(timestampEnd),
				length: duration,
				live: moment().isAfter(moment(timestampEnd + 3000)) // probably applies for the current recording
			};
			this.blocks.push(block);
		}
	}

	addBlock(block){
		this.blocks.push(block);
	}
}

module.exports = BlocksManager;