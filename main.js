const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const io = require('socket.io-client');

const socket = io('http://localhost:3000');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('add-friend', async (event, name) => {
  try {
    const response = await axios.post('http://localhost:3000/api/friends', { name });
    event.reply('friend-added', response.data);
  } catch (error) {
    event.reply('error', error.message);
  }
});

ipcMain.on('send-message', async (event, { from, to, content }) => {
  try {
    const response = await axios.post('http://localhost:3000/api/messages', { from, to, content });
    event.reply('message-sent', response.data);
  } catch (error) {
    event.reply('error', error.message);
  }
});

socket.on('message', (message) => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach(win => win.webContents.send('new-message', message));
});
