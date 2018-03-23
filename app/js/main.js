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
  addTrack('76c0LIXn_P0')
}

function addTrack (videoId) {
  // TODO: make those updates with ramda ?
  model.tracks.push(Track.init(videoId, 'player' + model.nextId))
  model.nextId++

  view(model)

  var newTrack = R.last(model.tracks)
  newTrack.ytInstance = new YT.Player(newTrack.key, {
    height: '96',
    width: '96',
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
      h('div.container', R.map(t => Track.view(t), model.tracks))
    ])
  ]
)
  patch(vnode, newvNode)
  vnode = newvNode // Need statefull FRP shit ?
}

var exampleVideos = ['76c0LIXn_P0', 'oIa4mUM9Rjw', 'qd2Dx6MIvb0', '2YjQlLg6bUM']
const openRandom = () => {
  var rand = Math.floor(Math.random() * exampleVideos.length)
  addTrack(exampleVideos[rand])
}

// ytapi handles
function onPlayerReady (event) {
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
