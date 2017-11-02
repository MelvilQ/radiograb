const Vue = require('./node_modules/vue/dist/vue');
const open = require('open');
const StationManager = require('./StationManager');
const AudioPlayer = require('./AudioPlayer');
const TrackCutter = require('./TrackCutter');
const constants = require('./constants');

new Vue({
	el: '#app',
	data: {
		stationManager: new StationManager(),
		audioPlayer: new AudioPlayer(),
		trackCutter: new TrackCutter(),
		selectedStation: null,
		selectedTrack: null,
		searchTerm: '',
		sortColumn: 'time',
		sortOrder: 'desc'
	},
	computed: {
		stations: function(){
			return this.stationManager.stations;
		},
		currentTrack: function(){
			if (this.audioPlayer.mode === 'live'){
				return this.selectedStation.recorder.currentTrack;
			} else if(this.audioPlayer.mode === 'recording'){
				return this.selectedTrack;
			}
		},
		tracks: function() {
			return this.selectedStation.trackListManager.getTracksFilteredAndSorted(
				this.searchTerm,
				this.sortColumn,
				this.sortOrder
			);
		},
		isLivePossible: function(){
			return (!!this.selectedStation && this.selectedStation.recording);
		}
	},
	methods: {
		selectStation: function(station){
			this.selectedStation = station;
		},
		changeSorting: function(column){
			if(this.sortColumn === column){
				this.sortOrder = (this.sortOrder === 'asc') ? 'desc' : 'asc'; 
			} else {
				this.sortColumn = column;
				this.sortOrder = 'asc';
			}
		},
		selectTrack: function(track){
			this.selectedTrack = track;
		},
		selectTrackAndPlay: function(track){
			this.selectTrack(track);
			const file = constants.recordingsFolder + this.selectedStation.name 
				+ '/' + track.take;
			this.audioPlayer.playRecording(file, track.start, this.selectedStation.offset);
		},
		saveTrack: function(track){
			this.trackCutter.saveTrack(track, this.selectedStation, './data');
		},
		live: function(){
			this.audioPlayer.playLive(this.selectedStation.stream.url);
		},
		formatLength: function(length){
			const minutes = Math.floor(length / 60).toString();
			const seconds = ('0' + (length % 60)).slice(-2);
			return minutes + ':' + seconds;
		},
		open // opens a link in the default web browser
	},
	watch: {
		'audioPlayer.volume': function(){
			this.audioPlayer.applyVolume();
		}
	},
	created: function(){
		if(this.stationManager.stations.length){
			this.selectStation(this.stationManager.stations[0]);
		}
		this.stationManager.startRecording();
	}
});