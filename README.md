# Test App with back + frontend

1. Clone the repo
2. Run `npm i`
3. Run `npm setup` (will prompt for password - need for SSL certs to do local https)
4. Make sure you have a twitch extension that's looking for files to load from `localhost:8080`
5. `npm start` will host at `https://localhost:8080`. This will be watching `test_folder_to_watch` for any changes
6. `npm run watch` will run the frontend bundler and watch your frontend/client files

* Extra note: I've fixed the version of `ws@3.3.2` in my package.json because the bundler i'm using breaks on `3.3.3` ([See here](https://github.com/parcel-bundler/parcel/issues/315), will probably be fixed in a day or two)
