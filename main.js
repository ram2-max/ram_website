const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainFilePath = path.join(app.getPath('documents'), 'quicknote.txt');

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('save-note', async (event, text) => {
    fs.writeFileSync(mainFilePath, text, 'utf-8');
    return true;
});

ipcMain.handle('save-as', async (event, text) => {
    const result = await dialog.showSaveDialog({
        title: 'Save As',
        defaultPath: 'note.txt'
    });

    if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, text, 'utf-8');
        return true;
    }
    return false;
});

ipcMain.handle('load-note', async () => {
    if (fs.existsSync(mainFilePath)) {
        return fs.readFileSync(mainFilePath, 'utf-8');
    }
    return '';
});

ipcMain.handle('delete-notes', async () => {
    if (fs.existsSync(mainFilePath)) {
        fs.unlinkSync(mainFilePath);
    }
    return true;
});

ipcMain.handle('new-note', async () => {
    const result = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['Discard', 'Cancel'],
        defaultId: 1,
        message: 'Start new note? Unsaved changes will be lost.'
    });

    return result.response === 0;
});