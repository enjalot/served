var d3 = require('d3');
var ipc = require("electron").ipcRenderer

var servers = []
// TODO: get serialized list of ports and filepaths

var inputElement = document.getElementById("new-file");
inputElement.addEventListener("change", handleFiles, false);
function handleFiles(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var files = this.files
  if(!files && evt.dataTransfer) files = evt.dataTransfer.files

  console.log("handled", files)
  if(!files[0]) return; // TODO: error

  var file = files[0];
  console.log("file", file.name, file.path)
  ipc.send("new-server", {name: file.name, path: file.path})
  // clear out the file once we've read it in
}

ipc.on("new-server", function(event, filepath, port) {
  console.log("PORT!", filepath, port)
  servers.push({
    path: filepath,
    port: port
  })

  renderServers()
  document.getElementById("new-file-form").reset()
})

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  console.log("DRAG")
}

var dropZone = document.getElementById('content');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFiles, false);

function renderServers() {
  console.log("servers", servers)
  var sdivs = d3.select("#servers").selectAll("div.server")
    .data(servers)

  var sdivsEnter = sdivs.enter().append("div").classed("server", true)
  sdivsEnter.append("span").classed("path", true)
    .text(function(d) { return d.path })
  sdivsEnter.append("a").classed("port", true)
    .text(function(d) {  return "http://localhost:" + d.port })
    .attr("href", function(d) {  return "http://localhost:" + d.port })
    .attr("target", "_blank")

}