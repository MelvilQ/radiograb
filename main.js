const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow(){
	mainWindow = new BrowserWindow({
		icon: path.join(__dirname, 'img', 'app-icon.png'),
		title: 'RadioGrab', 
		backgroundColor: '#5f747f'
	});
	mainWindow.maximize();
	console.log('main window created');

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));
	console.log('index.html loaded');

	mainWindow.toggleDevTools();

	mainWindow.on('closed', function () {
		mainWindow = null;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});