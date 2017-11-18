const fs = require('fs-extra');
const mp3Duration = require('mp3-duration');
const constants = require('./constants');
const Block = require('./Block');

class BlocksManager {

	constructor(name, format){
		this.name = name;
		this.format = format;
		this.blocks = [];
		this.liveBlock = null;
		this.loadBlocks();
	}

	getBlocksFile(){
		return constants.recordingsFolder + this.name + '/blocks.json';
	}

	loadBlocks(){
		try {
			const json = fs.readFileSync(this.getBlocksFile());
			this.blocks = JSON.parse(json).map(block => new Block(block));
		} catch(e){
			console.log('no blocks.json for station ' + this.name);
		}
	}

	notifyLiveBlockStart(blockStart){
		const folder = constants.recordingsFolder + this.name;		
		const file = blockStart + '.' + this.format;
		const path = folder + '/' + file;
		this.liveBlock = new Block(blockStart, file, path);
		this.addBlock(this.liveBlock);
	}

	notifyLiveBlockEnd(){
		this.liveBlock = null;
		this.synchronizeBlocks();
	}

	sortBlocks(){
		this.blocks.sort((block1, block2) => { // sort blocks descending (newest first)
			return (parseInt(block1.name) < parseInt(block2.name))? 1 : -1;
		});
	}

	async synchronizeBlocks(){
		for(let block of this.blocks){
			if(!block.duration){
				block.duration = await this.determineDuration(block);
				await this.saveBlocks();
			}
		}
	}

	async determineDuration(block){
		if(this.format === 'mp3'){
			return await mp3Duration(block.path);
		}
		return null;
	}

	addBlock(block){
		this.blocks.unshift(block); // we want new blocks at the top
		this.saveBlocks();
	}

	async saveBlocks(){
		const json = JSON.stringify(this.blocks, null, 4);
		await fs.writeFile(this.getBlocksFile(), json);	
	}
}

module.exports = BlocksManager;