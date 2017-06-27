import { app, screen, BrowserWindow, ipcMain, dialog } from 'electron';
import { join as pathJoin } from 'path';
import { readdir } from 'fs-promise';
import { format as urlFormat } from 'url';
import { on as processOn } from 'process';
import { Config, Event as ConfigEvent } from './config';
import { IpcEvent as NoteManagerIpcEvent, archiveNotes, syncNotes } from './note-manager';
import ServiceLocator from './service-locator';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let config: Config;

function initConfig() {
    config = ServiceLocator.config;

    config.on(ConfigEvent.change, (name, newVal, oldVal) => {
        switch (name) {
            case 'debug':
                if (newVal) {
                    mainWindow.webContents.toggleDevTools();
                }
                break;
            case 'git.remote':
                if (ServiceLocator.git.hasRepository()) {
                    // only set remote if git repository is created
                    ServiceLocator.git.setRemote(newVal);
                }
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

function quit() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    let logger = ServiceLocator.logger;

    // truncate log file
    logger.clear();

    initConfig();

    processOn('uncaughtException', (e) => {
        logger.error(e);
        if (config.debug) {
            throw e;
        }
    });

    createWindow();

    ipcMain.on(NoteManagerIpcEvent.sync, (event) => {
        syncNotes(event.sender).catch((e) => {
            logger.error(e);
            event.sender.send(NoteManagerIpcEvent.syncFailed);
        });
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (!config.noteDir) {
        quit();
    }

    readdir(config.noteDir).then((files) => {
        if (!files.length) {
            return Promise.resolve();
        }

        if (config.git.remote) {
            return syncNotes();
        } else {
            return archiveNotes();
        }
    }).then(() => {
        quit();
    }).catch((e) => {
        ServiceLocator.logger.error(e);
        dialog.showErrorBox('Error', `Error occurs during app close.\nCheck log: ${ServiceLocator.logger.logfile} for details`);
    });
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});