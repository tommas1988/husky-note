import { app, screen, BrowserWindow } from 'electron';
import { join as pathJoin } from 'path';
import { format as urlFormat } from 'url';
import { Config, Event as ConfigEvent } from './config';
import ServiceLocator from './service-locator';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let config: Config;

function init() {
    config = ServiceLocator.config;

    // config change handler
    config.on(ConfigEvent.change, (name, newVal, oldVal) => {
        switch (name) {
            case 'debug':
                if (newVal) {
                    mainWindow.webContents.toggleDevTools();
                }
                break;
            case 'git.username':
                // update git config
                ServiceLocator.git.setConfig('user.name', newVal);
                break;
            case 'git.userEmail':
                // update git config
                ServiceLocator.git.setConfig('user.email', newVal);
                break;
        }
    });
}

function createWindow() {
    // Create the browser window.
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    mainWindow = new BrowserWindow({
        width,
        height,
        autoHideMenuBar: true,
    });
    mainWindow.maximize();

    // and load the index.html of the app.
    mainWindow.loadURL(urlFormat({
        pathname: pathJoin(__dirname, '../index.html'),
        protocol: 'file:',
        slashes: true,
    }));

    if (config.debug) {
        mainWindow.webContents.toggleDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    init();

    createWindow();

    // if set remote repo, sync first
    if (config.git.remote) {
        ServiceLocator.noteManager.sync(mainWindow.webContents);
    }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // commit note and/or push
    let noteManager = ServiceLocator.noteManager;
    if (config.git.remote) {
        noteManager.sync();
    } else {
        noteManager.archive();
    }

    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});