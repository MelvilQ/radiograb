class Track {

	constructor(artist, title, start, time, take){
		if(artist && arguments.length === 1){
			// construct from object
			const track = artist;
			Object.assign(this, track);
		} else {
			// construct from params
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

	getGoogleLink() {
		return 'https://www.google.de/search?q=' 
			+ encodeURIComponent(this.artist + ' ' + this.title);
	}

	getYoutubeLink() {
		return 'https://www.youtube.com/results?search_query=' 
			+ encodeURIComponent(this.artist + ' ' + this.title);
	}
}

module.exports = Track;