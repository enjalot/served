var path = require('path')
var fs = require('fs')
var d3 = require('d3')
var express = require('express');
var serveIndex = require('serve-index')

const electron = require('electron');
// We can listen to messages from the renderer here:
const ipcMain = electron.ipcMain;
var webContents;

var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.


// keep track of the latest port globally
var PORT;

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
    width: 600,
    height: 500,
    'min-width': 600,
    'min-height': 200,
    'accept-first-mouse': true,
    'title-bar-style': 'hidden'
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/src/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  webContents = mainWindow.webContents;

  // open links in user's default browser
  webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('shell').openExternal(url);
  });

  //webContents.openDevTools();

  webContents.on('did-finish-load', function() {
    // We know the webpage is loaded, so we can start interacting with it now

    // servers is an object that keeps track of the path, port and express server for each directory
    var servers = loadServers()
    // our port is a global variable, we increment everytime we add a new server
    if(!PORT) PORT = 4241;
    console.log("LAST PORT", PORT)

    ipcMain.on('new-server', function(event, file) {
      var filepath = file.path;
      //console.log(filepath, path.basename(filepath), file.name)
      if(path.basename(filepath).indexOf('.') >= 0) {
        // grab the directory from the path, ignoring the filename
        filepath = path.dirname(filepath);
      }
      // don't create a new server if we've already made one for this directory
      if(servers[filepath]) return;

      PORT += 1;
      var serve = express();
      serve.use(express.static(filepath));
      serve.use(serveIndex(filepath, {'icons': true}))
      var server = serve.listen(PORT, function(err) {
        if(err) console.log("ERR", err)
        console.log("listening on", PORT, "for file", filepath)
      })
      servers[filepath] = {path: filepath, port: PORT, server: server};
      saveServers(servers);
      event.sender.send('new-server', filepath, PORT);
    });

    ipcMain.on('close-server', function(event, path) {
      console.log("close!", path)
      if(!servers[path]) return;
      servers[path].server.close();
      delete servers[path];
      setTimeout(function() {
        saveServers(servers);
      },10)
    })
  });
});


function loadServers() {
  var servers = {};
  var datadir = app.getPath('userData')
  // Yeah, yeah, this really should be async. But I'd need to try/catch the JSON parse anyway
  try {
    var contents = fs.readFileSync(datadir + "/servers.json").toString();
    servers = JSON.parse(contents.toString())
    var paths = Object.keys(servers);
    PORT = d3.max(paths, function(p) { return servers[p].port })
    paths.forEach(function(filepath) {

      var serve = express();
      serve.use(express.static(filepath));
      serve.use(serveIndex(filepath, {'icons': true}))
      var server = serve.listen(servers[filepath].port, function(err) {
        if(err) console.log("ERR", err)
        console.log("listening on", servers[filepath].port, "for file", filepath)
      })
      // keep track of the express server so we can close it if need be
      servers[filepath].server = server;
      webContents.send('new-server', filepath, servers[filepath].port)
    })
  } catch (e) {
    console.log(e)
  }
  return servers;
}

function saveServers(servers) {
  var datadir = app.getPath('userData')
  var serialized = {}
  var paths = Object.keys(servers);
  paths.forEach(function(p) {
    serialized[p] = {path: p, port: servers[p].port}
  })
  console.log("SERIALIZED", serialized)
  fs.writeFile(datadir + '/servers.json', JSON.stringify(serialized, null, 2), function(err){
    if(err) console.log("error writing", err)
  });
}