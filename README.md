Snapshot
=========

Current build is under /build. Note that build bundle may not have been minified/uglified. To rebuild app:

1. clone repo
2. download node if it's not already installed
3. navigate to /snapshot and run `npm install`
4. to rebuild dev bundle, run `npm run build:js`
5. to build production bundle, run `npm run build:prod` 
6. if using browser-sync, run `npm run watch`, and navigate to localhost:3000/build/
