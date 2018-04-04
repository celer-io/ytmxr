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

const videoSamples = require('./videoSamples')
var model, vDom

const init = () => {
  model = {
    tracks: [],
    nextId: 0,
    newVideoId: '',
    dirty: true,
    patchLoop: null,
    patchLoopCount: 0
  }

  vDom = h('section#app.hero.is-fullheight.is-light', [
    h('div.hero-body', [
      h('div.container', {style: {
        display: 'flex',
        justifyContent: 'center'
      }}, [
        h('h1.title', 'YTMXR'),
        h('h2.subtitle', 'Youtube api not loaded yet...')
      ])
    ])
  ])

  patch(document.getElementById('app'), vDom)
}

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

const updateView = model => {
  model.dirty = true
  if (model.patchLoop) {
    model.patchLoopCount = 0
  } else {
    model.patchLoop = setInterval(() => {
      if (model.dirty) {
        let newvDom = view(model)
        patch(vDom, newvDom)
        vDom = newvDom
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
  var rand = Math.floor(Math.random() * videoSamples.length)
  addTrack(videoSamples[rand].videoId)
}

const addTrack = videoId => {
  model.tracks.push(Track.init(videoId, 'player' + model.nextId))
  model.nextId++
  updateView(model)
}

const view = model => h('div#app', [
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
      h('div.field.is-grouped.is-grouped-multiline',
      R.map(
        sample => h('p.control', [
          h('a.button.is-primary', {on: {click: () => addTrack(sample.videoId)}}, sample.name)
        ]),
        videoSamples)
      )
    ])
  ]),
  h('section.section', [
    h('div.container', R.map(t => Track.view(t), model.tracks))
  ])
])

init()
