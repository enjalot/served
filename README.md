# served

Quickly create localhost HTTP servers for any directory. 
Intended to be as easy to use as possible so web developers who aren't comfortable with the command line yet can get a simple server started quicker.


## Development

`npm install`  
`npm start`

### files

The "backend"

`main.js` - This initializes the express servers when new files/folders are dragged-and-dropped.
`package.json` - Determines the packages available to both the frontend and backend

The "frontend"

`app.js` - This handles the file selection as well as rendering the GUI.
`index.html` - The markup for the GUI
`style.css` - The style for the GUI
