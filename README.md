# YTMXR

A webapp for playing multiple youtube videos at once while having every videos controls in a nice centralised UI.

See demo [here](https://crucialhawg.github.io/ytmxr/)

### Build
    npm run build

### Watch
    npm run watch

### Build CSS
    npm run build-sass
*You need to have ruby sass installed for this*

### Deploy
    git push origin `git subtree split --prefix app master`:gh-pages

#### TODO

- [x] Open 2 videos dynamically from id
- [x] Externalise js code
- [x] ~~Control~~ Change volume on click
- [x] Integrate ramda and snabbdom
- [x] Integrate bulma
- [x] Make basic functional frontend app
- [x] Make Header component
- [x] Make Track component
- [x] Find and itegrate silders UI
- [x] Allow 'record' and looping
- [ ] Load fontawsome locally
- [ ] Integrate complete functional-reactive arch with flyd and union-types <!-- yeah maybe... -->
- [ ] Assign keys for play/pause on tracks
- [ ] Assign keys seq for 'record' and looping
- [ ] Add tracks from youtube search api
