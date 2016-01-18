var path = require('path')
const electron = require('electron');
var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

// Report crashes to our server.
//electron.crashReporter.start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform != 'darwin') {
    app.quit();
  //}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    'min-width': 500,
    'min-height': 200,
    'accept-first-mouse': true,
    'title-bar-style': 'hidden'
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');




  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  var webContents = mainWindow.webContents;

  // open links in user's default browser
  webContents.on('new-window', function(e, url) {
    e.preventDefault();
    console.log("sup?????")
    require('shell').openExternal(url);
  });

  webContents.openDevTools();

  webContents.on('did-finish-load', function() {
    // We know the webpage is loaded, so we can start interacting with it now
    webContents.send("render-test", "woot")
  })

  // We can listen to messages from the renderer here:
  const ipcMain = electron.ipcMain;


  // TODO: maintain list of ports + files
  // TODO: de-serialize and start servers on load

  var port = 4241;
  var express = require('express');
  var serveIndex = require('serve-index')

  var servers = {};

  ipcMain.on('new-server', function(event, file) {
    var app = express();
    var filepath = file.path;
    console.log(filepath, path.basename(filepath), file.name)
    if(path.basename(filepath).indexOf('.') >= 0) {
      // grab the directory from the path, ignoring the filename
      filepath = path.dirname(filepath);
    }
    console.log("filepath", filepath)
    if(servers[filepath]) return;

    port += 1;
    app.use(express.static(filepath));
    app.use(serveIndex(filepath, {'icons': true}))
    var server = app.listen(port, function() {
      console.log("listening on", port, "for file", filepath)
    })
    servers[filepath] = server;
    event.sender.send('new-server', filepath, port);
  });

  ipcMain.on('close-server', function(event, path) {
    console.log("close!", path)
    if(!servers[path]) return;
    servers[path].close();
    delete servers[path];
  })
});