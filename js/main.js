// /* global YT */
const snabbdom = require('snabbdom')
const R = require('ramda')
const patch = snabbdom.init([ // Init patch function with chosen modules
  require('snabbdom/modules/class').default, // makes it easy to toggle classes
  require('snabbdom/modules/props').default, // for setting properties on DOM elements
  require('snabbdom/modules/style').default, // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners').default // attaches event listeners
])
const h = require('snabbdom/h').default // helper function for creating vnodes

const MAX_PATCH_LOOP = 10
const PATCH_INTERVAL = 500 // ms

const Track = require('./track')

var exampleVideos = ['UlPkNR83XOo', 'nDqP7kcr-sc', '2OyuMJMrCRw', 'XT6BMrbjvRs']
const model = {
  tracks: [],
  nextId: 0,
  newVideoId: '',
  dirty: true,
  patchLoop: null,
  patchLoopCount: 0
}

var vnode = h('section#app.hero.is-large.is-light', [
  h('div.hero-body', [
    h('div.container', [
      h('h1.title', 'YTMXR'),
      h('h2.subtitle', 'Youtube api not loaded yet...')
    ])
  ])
])
patch(document.getElementById('app'), vnode)

global.onYouTubeIframeAPIReady = () => {
  updateView(model)
}

document.addEventListener('call-redraw', () => {
  updateView(model)
})

document.addEventListener('delete-track', e => {
  model.tracks = R.reject(R.propEq('key', e.detail), model.tracks)
  updateView(model)
})

function addTrack (videoId) {
  model.tracks.push(Track.init(videoId, 'player' + model.nextId))
  model.nextId++
  updateView(model)
}

const view = model =>
h('div#app', [
  h('nav.navbar.is-light.is-fixed-top', [
    h('div.container', [
      h('div.navbar-brand', [
        h('div.navbar-item.title.is-4', 'YTMXR')
      ]),
      h('div.navbar-menu.is-active', [
        h('div.navbar-left', [
          h('div.navbar-item', [
            h('div.field.is-grouped', [
              h('p.control.is-expanded', [
                h('input.input', {
                  props: {type: 'text', placeholder: 'Enter a Youtube Id', value: model.newVideoId},
                  on: {input: e => { model.newVideoId = e.target.value }} // TODO: make this update with ramda ?
                })
              ]),
              h('p.control', [
                h('button.button', {on: {click: () => addTrack(model.newVideoId)}}, 'Go')
              ]),
              h('p.control', [
                h('button.button', {on: {click: openRandom}}, 'Rand')
              ])
            ])
          ])
        ])
      ])
    ])
  ]),
  h('section.section', [
    h('div.container', [
      h('div.field.is-grouped',
      R.map(
        videoId => h('p.control', [
          h('a.button.is-primary', {on: {click: () => addTrack(videoId)}}, videoId)
        ]),
        exampleVideos)
      )
    ])
  ]),
  h('section.section', [
    h('div.container', R.map(t => Track.view(t), model.tracks))
  ])
])

const updateView = model => {
  if (model.patchLoop) {
    model.dirty = true
    model.patchLoopCount = 0
  } else {
    model.patchLoop = setInterval(() => {
      if (model.dirty) {
        var newvNode = view(model)
        patch(vnode, newvNode)
        vnode = newvNode
        model.dirty = false
      } else if (model.patchLoopCount++ >= MAX_PATCH_LOOP) {
        model.patchLoopCount = 0
        clearInterval(model.patchLoop)
        model.patchLoop = null
      }
    }, PATCH_INTERVAL)
  }
}

const openRandom = () => {
  var rand = Math.floor(Math.random() * exampleVideos.length)
  addTrack(exampleVideos[rand])
}