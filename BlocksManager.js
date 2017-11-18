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
			const duration = await this.determineDuration(filePath);
			const timestampStart = parseInt(recording.replace('.' + this.format));
			const timestampEnd = timestampStart + 1000 * duration;
			const block = {
				name: recording,
				file: filePath,
				start: moment(timestampStart),
				end: moment(timestampEnd),
				length: duration
			};
			this.blocks.push(block);
		}
	}

	async determineDuration(filePath){
		if(this.format === 'mp3'){
			return await mp3Duration(filePath);
		}
		return null;
	}

	addBlock(block){
		this.blocks.push(block);
	}
}

module.exports = BlocksManager;