class Track {

	constructor(artist, title, start, time, take){
		this.artist = artist;
		this.title = title;
		this.start = start;
		this.end = null;
		this.time = time;
		this.take = take;
		this.complete = false;
		this.length = null;
	}
}

module.exports = Track;