# served

Quickly create localhost HTTP servers for any directory. 
Intended to be as easy to use as possible so web developers who aren't comfortable with the command line yet can get a simple server started quicker.


## Development

You can edit the code and run it locally with the following commands:
```
npm install  
npm start
```

## Distribution

We package up the app using [electron-packager](https://github.com/maxogden/electron-packager), this command builds for all platforms:
```
npm run bundle -- . Served --all --version=0.36.4
```

### files

The "backend"

`main.js` - This initializes the express servers when new files/folders are dragged-and-dropped.
`package.json` - Determines the packages available to both the frontend and backend

The "frontend"

`src/app.js` - This handles the file selection as well as rendering the GUI.
`src/index.html` - The markup for the GUI
`src/style.css` - The style for the GUI
