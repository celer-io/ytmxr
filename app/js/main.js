/* global YT */
var snabbdom = require('snabbdom')
const R = require('ramda')
var patch = snabbdom.init([ // Init patch function with chosen modules
  require('snabbdom/modules/class').default, // makes it easy to toggle classes
  require('snabbdom/modules/props').default, // for setting properties on DOM elements
  require('snabbdom/modules/style').default, // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners').default // attaches event listeners
])
var h = require('snabbdom/h').default // helper function for creating vnodes
const Track = require('./track')

var exampleVideos = ['UlPkNR83XOo', 'nDqP7kcr-sc', '2OyuMJMrCRw', 'XT6BMrbjvRs']
const model = {
  tracks: [],
  nextId: 0,
  newVideoId: ''
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
  view(model)
}

document.addEventListener('discusting-non-functional-message', () => view(model))
document.addEventListener('delete-track', e => {
  model.tracks = R.reject(R.propEq('key', e.detail), model.tracks)
  view(model)
})

function addTrack (videoId) {
  // TODO: make those updates with ramda ?
  model.tracks.push(Track.init(videoId, 'player' + model.nextId))
  model.nextId++

  view(model)

  var newTrack = R.last(model.tracks)
  newTrack.ytInstance = new YT.Player(newTrack.key, {
    height: '100',
    width: '400',
    videoId: videoId,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    },
    playerVars: {
      modestbranding: 0,
      rel: 0
    }
  })
}

const view = model => {
  var newvNode = h('div#app', [
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
  ]
)
  patch(vnode, newvNode)
  vnode = newvNode // Need statefull FRP shit ?
}

const openRandom = () => {
  var rand = Math.floor(Math.random() * exampleVideos.length)
  addTrack(exampleVideos[rand])
}

// ytapi handles
function onPlayerReady (event) {
  var track = R.find(R.propEq('key', event.target.a.id), model.tracks)
  console.log('track ready :', track)
  event.target.setVolume(50)
  event.target.playVideo()
}

function onPlayerStateChange (event) {
  var track = R.find(R.propEq('key', event.target.a.id), model.tracks)
  track.playerState = event.data // Oulah grosse mutation !!!
  view(model)
}

// function stopVideo () {
//   players[0].stopVideo()
// }
