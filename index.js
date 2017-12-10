const Vue = require('./node_modules/vue/dist/vue.min');
const open = require('open');
const moment = require('moment');
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
			track: null,
			fileName: null,
			isSaving: false,
			finishedSaving: false
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
		blocks: function(){
			return this.selectedStation.blocksManager.blocks
				.filter(block => !!block.duration)
				.map(block => Object.assign({}, block, {
					height: Math.round(block.duration * this.timelineScale) + 'px',
					startTime: moment(block.start).format('D.M.YYYY H:mm'),
					endTime: moment(block.start + block.duration * 1000).format('D.M.YYYY H:mm')
				}));
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
		},
		liveBlock: function(){
			const block = this.selectedStation.blocksManager.liveBlock;
			if(!block){
				return null;
			}
			return Object.assign({}, block, {
				height: Math.round(this.selectedStation.recorder.duration * this.timelineScale) + 'px',
				startTime: moment(block.start).format('D.M.YYYY H:mm')
			});
		},
		saveFolderDisplay: function(){
			let path = this.settings.saveFolder;
			if(!path){
				return '';
			}
			if (path.length > 40){
				path = path.substr(0, 20) + '...' + path.substr(path.length - 20, 20);
			}
			return path;
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
			this.settingsManager.setDisplayMode('timeline');
			setTimeout(() => document.getElementById('timeline-arrow').scrollIntoView(false, {
				behavior: 'smooth', block: 'start'
			}), 0);
		},
		showTracklist: function(){
			this.displayMode = 'tracklist';
			this.settingsManager.setDisplayMode('tracklist');
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
			this.newTrackDialog.end = Math.round(Math.min(start + 90, block.duration));
			this.newTrackDialog.take = block.file;
			this.newTrackDialog.blockStart = moment(block.start);
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
			track.edited = true;
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
		deleteEditedTrack: function(){
			this.selectedStation.trackListManager.removeTrack(this.editTrackDialog.track);
			this.editTrackDialog.visible = false;
		},
		testCut: function(track, testTime){
			const start = parseFloat(testTime);
			this.audioPlayer.playTrackCut(track, this.selectedStation.name, start);
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
		openSaveFileDialog: function(track){
			this.saveFileDialog.visible = true;
			this.saveFileDialog.track = track;
			this.saveFileDialog.fileName = track.artist + ' - ' + track.title 
				+ '.' + this.selectedStation.stream.format;
			this.saveFileDialog.isSaving = false;
			this.saveFileDialog.finishedSaving = false;
		},
		saveTrack: async function(){
			const track = this.saveFileDialog.track;
			const fileName = this.saveFileDialog.fileName.replace(/\//g, '');
			if(!track || !fileName || !this.settings.saveFolder || !this.settings.saveFolder.length){
				return;
			}
			this.saveFileDialog.isSaving = true;
			this.saveFileDialog.finishedSaving = false;
			await this.trackCutter.saveTrack(track, this.selectedStation, 
				this.settings.saveFolder, fileName);
			this.saveFileDialog.isSaving = false;
			this.saveFileDialog.finishedSaving = true;
			track.saved = true;
			this.selectedStation.trackListManager.saveTracks();
		},
		timelineZoomIn: function(){
			this.timelineScale *= 1.6;
			this.settingsManager.setTimelineScale(this.timelineScale);
		},
		timelineZoomOut: function(){
			this.timelineScale /= 1.6;
			this.settingsManager.setTimelineScale(this.timelineScale);
		},
		getTracksOfBlock: function(block){
			return this.selectedStation.trackListManager.tracks
				.filter(track => track.take === block.file)
				.map(track => Object.assign({}, track, {
					height: Math.round(track.getLength() * this.timelineScale) + 'px',
					bottom: Math.round(track.start * this.timelineScale) + 'px',
					filtered: !this.tracks.includes(track),
					ref: track // reference to original object, otherwise we cannot edit from the timeline
				}));
		},
		playInBlock: function(block, e, isLive){
			const start = (e.target.clientHeight - e.offsetY) / this.timelineScale;
			this.audioPlayer.playTimeline(block, start, isLive);
		},
		applySettings: function(){
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
	
			if (this.settings.displayMode){
				this.displayMode = this.settings.displayMode;
			}
	
			if (this.settings.timelineScale){
				this.timelineScale = this.settings.timelineScale;
			}
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
		this.applySettings();
	}
});