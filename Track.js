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
			this.edited = false;
			this.saved = false;
		}
	}

	getLength() {
		return Math.floor(this.end - this.start);
	}

	getLengthAsString() {
		const length = this.getLength();
		if(!length) {
			return 'unknown';
		}
		const minutes = Math.floor(length / 60).toString();
		const seconds = ('0' + (length % 60)).slice(-2);
		return minutes + ':' + seconds;
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