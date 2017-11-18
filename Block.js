class Block {

	constructor(start, file, path){
		if(start && arguments.length === 1){
			// construct from object
			const block = start;
			Object.assign(this, block);
		} else {
			// construct from params
			this.start = start;
			this.name = start.toString();
			this.file = file;
			this.path = path;
			this.duration = null;
		}
	}

}

module.exports = Block;