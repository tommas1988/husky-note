## Husky
#### Husky is a cross platform notebook application.
With Husky you can:
* keep your note with markdown language
* edit your note in live preview mode
* read your note in read mode
* save and sync notes with git in backend
* and going to be more...

*Woof~~~*

## Installation
*Currently no pre-build binary package provided, so need build package yourself*

### 1. Install required packages
* npm install
* bower install
* typings install

### 2. Install electron
There are two ways to install electron:
1. Go to [electron release page](https://github.com/electron/electron/releases) to download version 1.6.5, unzip and copy the `electron` directory to `dist` in Husky repository
2. gulp --gulpfile build/gulpfile.js get-electron (__not tested yet__)

### 3. Build
npm run build

### 4. Package
Just copy `dist/electron` directory to anywhere you like, then click the `electron` binary file and start Husky

*You can also rename and change the icon of `electron` binary file. See https://electron.atom.io/docs/tutorial/application-distribution/#rebranding-with-downloaded-binaries*