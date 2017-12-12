# RadioGrab

RadioGrab is a desktop app to record radio stations. It shows a list of the collected tracks in a table. The tracks can be played individually and also be saved as MP3 file.

## Screenshots

<img src="doc/screenshot1.png">

<img src="doc/screenshot2.png">

<img src="doc/screenshot3.png">

<img src="doc/screenshot4.png">

## Motivation

I started this project because I wanted to have an open-source alternative for Radio.fx/ClipInc, and there was none. At the same time, this is my playground to discover the electron framework (that allows to develop desktop apps using web technologies).

## Technologies

* Desktop app framework: [electron](https://electron.atom.io/)
* Frontend: [vue](https://vuejs.org/)
* Track extraction: [FFmpeg](https://www.ffmpeg.org/download.html)

## Development Setup

1. Clone this repo.
2. Run `yarn install`.
3. Make sure that [FFmpeg](https://www.ffmpeg.org/download.html) is installed on your computer and in your PATH.
4. `npm start` starts the app in development mode.
5. `npm build` builds executables for all platforms supported by electron. See the package.json file for other build commands.

## Configuration Files

The configuration files are created during the first start of the application in the directory /data/config.

### stations.json

This file contains a JSON array representing the list of radio stations which have been imported into RadioGrab. A radio station can be defined as follows:

```
{
	"name": "Radio FG",
	"logo": "http://www.radiofg.com/upload/design/598c2af5081d74.63866449.png",
	"stream": {
		"url": "http://radiofg.impek.com/fg",
		"format": "mp3"
	},
	"recording": false,
	"songInfo": {
		"method": "http",
		"url": "https://api.radioking.com/radio/accounts/getcurrenttitle?app=radiofg&apikey=7cfde934f1cee6fdac926f92baadbb9fb6852f14&idsite=5079&typetitrage=web&idserveur=8&username=&host=radiofg.impek.com&port=80&radiouid=&mount=fg&url=http://radiofg.impek.com/fg",
		"tags": {
			"artist": "/results/title",
			"title": "/results/artist"
		}
	}
}
```
The `songInfo` object is optional. It defines the way RadioGrab records the current track name and artist. At the moment, it is only possible to get this information via repeated HTTP requests to a web api. In the future, other methods might be implemented. If this information is not provided, RadioGrab will only record the stream without any track information. 

Management of radio stations is only rudimentary implemented yet, so it is likely that you have to edit this file manually from time to time.

### settings.json

This file contains a JSON object with values such as the volume or the folder in which extracted tracks are saved. Normally you don't have to touch this file as a user.