import { app, screen, BrowserWindow, dialog } from 'electron';
import { join as pathJoin } from 'path';
import { format as urlFormat } from 'url';
import { on as processOn } from 'process';
import { Config, Event as ConfigEvent } from './config';
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
    // TODO: calling sync action should after app loaded
    ServiceLocator.noteManager.sync(mainWindow.webContents);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // commit note and/or push
    let noteManager = ServiceLocator.noteManager;
    let result = noteManager.archive();
    let action = 'archive';

    if (config.git.remote) {
        action = 'sync';
        result = result.then(() => {
            return noteManager.sync();
        });
    }

    result.then(() => {
        quit();
    }).catch((e) => {
        ServiceLocator.logger.error(e);
        dialog.showErrorBox('Error', `Error occurs during ${action} notes process.\nCheck log: ${ServiceLocator.logger.logfile} for details`);
        quit();
    });
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});