const Vue = require('./node_modules/vue/dist/vue');
const open = require('open');
const StationManager = require('./StationManager');
const SettingsManager = require('./SettingsManager');
const AudioPlayer = require('./AudioPlayer');
const TrackCutter = require('./TrackCutter');
const Track = require('./Track');

new Vue({
	el: '#app',
	data: {
		stationManager: new StationManager(),
		settingsManager: new SettingsManager(),
		audioPlayer: new AudioPlayer(),
		trackCutter: new TrackCutter(),
		selectedStation: null,
		displayMode: 'tracklist',
		selectedTrack: null,
		searchTerm: '',
		sortColumn: 'time',
		sortOrder: 'desc',
		timelineScale: 1.0,
		newTrackDialog: {
			visible: false,
			artist: null,
			title: null,
			start: null,
			end: null,
			take: null,
			blockStart: null
		},
		editTrackDialog: {
			visible: false,
			track: null,
			artist: null,
			title: null,
			start: null,
			end: null
		},
		saveFileDialog: {
			visible: false,
			isSaving: false
		}
	},
	computed: {
		stations: function(){
			return this.stationManager.stations;
		},
		settings: function(){
			return this.settingsManager.settings;
		},
		currentTrack: function(){
			if (this.audioPlayer.mode === 'live'){
				return this.selectedStation.recorder.currentTrack;
			} else if(this.audioPlayer.mode === 'track'){
				return this.selectedTrack;
			} else {
				return null;
			}
		},
		tracks: function() {
			return this.selectedStation.trackListManager.getTracksFilteredAndSorted(
				this.searchTerm,
				this.sortColumn,
				this.sortOrder
			);
		},
		blocks: function() {
			return this.selectedStation.blocksManager.blocks;
		},
		blockHeights: function(){
			return this.blocks.map(block => Math.round(block.length * this.timelineScale) + 'px');
		},
		isLivePossible: function(){
			return (!!this.selectedStation && this.selectedStation.recording);
		},
		currentPlayingTime: function(){
			return this.audioPlayer.currentPlayingTime;
		},
		arrowPosition: function(){
			if(!this.audioPlayer.isPlaying && !this.audioPlayer.isPaused){
				return null;
			}
			return Math.round(this.audioPlayer.playingPosition * this.timelineScale) + 'px';
		}
	},
	methods: {
		selectStation: function(station){
			this.selectedStation = station;
			this.settingsManager.setLastStation(station);
			if(this.audioPlayer.isPlaying){
				this.playSomethingOfNewStation();
			}
		},
		playSomethingOfNewStation: function(){
			if(this.audioPlayer.mode === 'live' && this.selectedStation.recording){
				this.live();
			} else if(this.audioPlayer.mode === 'track' && this.tracks.length){
				this.selectTrackAndPlay(this.tracks[0]);
			} else if(this.audioPlayer.mode === 'timeline' && this.blocks.length){
				this.audioPlayer.playTimeline(this.blocks[0], 0);
			} else {
				this.audioPlayer.stop();
			}
		},
		showTimeline: function(){
			this.displayMode = 'timeline';
		},
		showTracklist: function(){
			this.displayMode = 'tracklist';
		},
		startRecordingAndPlay: async function(){
			await this.selectedStation.recorder.record();
			this.live();
			this.stationManager.saveStations();
		},
		stopRecordingAndStop: function(){
			this.selectedStation.recorder.stop();
			this.audioPlayer.stop();
			this.stationManager.saveStations();
		},
		live: function(){
			this.audioPlayer.playLive(this.selectedStation);
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
			this.audioPlayer.playTrack(track, this.selectedStation.name);
		},
		openNewTrackDialog: function(block, e){
			const start = (e.target.clientHeight - e.offsetY) / this.timelineScale;
			this.newTrackDialog.artist = '';
			this.newTrackDialog.title = '';
			this.newTrackDialog.start = Math.round(Math.max(start - 90, 0));
			this.newTrackDialog.end = Math.round(Math.min(start + 90, block.length));
			this.newTrackDialog.take = block.name;
			this.newTrackDialog.blockStart = block.start;
			this.newTrackDialog.visible = true;
		},
		submitNewTrackDialog: function(){
			const start = parseFloat(this.newTrackDialog.start);
			const end = parseFloat(this.newTrackDialog.end);
			const track = new Track(
				this.newTrackDialog.artist, 
				this.newTrackDialog.title,
				start,
				this.newTrackDialog.blockStart.add(start).format('D.M.YYYY H:mm'),
				this.newTrackDialog.take
			);
			track.end = end;
			this.selectedStation.trackListManager.addTrack(track);
			this.newTrackDialog.visible = false;
		},
		cancelNewTrackDialog: function(){
			this.newTrackDialog.visible = false;
		},
		openEditTrackDialog: function(track){
			this.editTrackDialog.track = track;
			this.editTrackDialog.artist = track.artist;
			this.editTrackDialog.title = track.title;
			this.editTrackDialog.start = track.start;
			this.editTrackDialog.end = track.end;
			this.editTrackDialog.visible = true;
		},
		submitEditTrackDialog: function(){
			this.editTrackDialog.track.artist = this.editTrackDialog.artist;
			this.editTrackDialog.track.title = this.editTrackDialog.title;
			this.editTrackDialog.track.start = parseFloat(this.editTrackDialog.start);
			this.editTrackDialog.track.end = parseFloat(this.editTrackDialog.end);
			this.editTrackDialog.track.edited = true;
			this.selectedStation.trackListManager.saveTracks();
			this.editTrackDialog.visible = false;
		},
		cancelEditTrackDialog: function(){
			this.editTrackDialog.visible = false;
		},
		testCutStart: function(){
			const track = this.editTrackDialog.track;
			const start = parseFloat(this.editTrackDialog.start);
			this.audioPlayer.playTrackCut(track, this.selectedStation.name, start);
		},
		testCutEnd: function(){
			const track = this.editTrackDialog.track;
			const end = parseFloat(this.editTrackDialog.end);
			this.audioPlayer.playTrackCut(track, this.selectedStation.name, end);
		},
		openSaveFolderPicker: function() {
			document.getElementById('folderPicker').click();
		},
		updateSaveFolder: function(){
			const folder = document.getElementById('folderPicker').files[0].path;
			if(!folder || !folder.length){
				return;
			}
			this.settings.saveFolder = folder;
			this.settingsManager.saveSettings();
		},
		saveTrack: async function(track){
			if(!this.settings.saveFolder || !this.settings.saveFolder.length){
				return;
			}
			this.saveFileDialog.visible = true;
			this.saveFileDialog.isSaving = true;
			await this.trackCutter.saveTrack(track, this.selectedStation, this.settings.saveFolder);
			this.saveFileDialog.isSaving = false;
			track.saved = true;
			this.selectedStation.trackListManager.saveTracks();
		},
		getTracksOfBlock: function(name){
			return this.tracks.filter(track => track.take === name)
				.map(track => Object.assign(track, {
					height: Math.round(track.getLength() * this.timelineScale) + 'px',
					bottom: Math.round(track.start * this.timelineScale) + 'px'
				}));
		},
		playInBlock: function(block, e){
			const start = (e.target.clientHeight - e.offsetY) / this.timelineScale;
			this.audioPlayer.playTimeline(block, start);
		},
		open // opens a link in the default web browser
	},
	watch: {
		'audioPlayer.volume': function(){
			this.audioPlayer.applyVolume();
			this.settingsManager.setVolume(this.audioPlayer.volume);
		}
	},
	created: function() {
		let candidates;
		if (this.settings.lastStation) {
			candidates = this.stations.filter(station => station.name === this.settings.lastStation);
		} else {
			candidates = this.stations;
		}
		if (candidates.length){
			this.selectStation(candidates[0]);
		}

		if (this.settings.volume){
			this.audioPlayer.volume = this.settings.volume;
		}
		
		this.stationManager.startRecording();
	}
});