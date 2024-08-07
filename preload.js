const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  addFriend: (name) => ipcRenderer.send('add-friend', name),
  sendMessage: (data) => ipcRenderer.send('send-message', data),
  onFriendAdded: (callback) => ipcRenderer.on('friend-added', callback),
  onMessageSent: (callback) => ipcRenderer.on('message-sent', callback),
  onNewMessage: (callback) => ipcRenderer.on('new-message', callback),
  onError: (callback) => ipcRenderer.on('error', callback)
});
