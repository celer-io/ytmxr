// /* global YT, localStorage */
const snabbdom = require('snabbdom')
const R = require('ramda')
const flyd = require('flyd')
const forwardTo = require('flyd-forwardto')
const Type = require('union-type')
var patch = snabbdom.init([ // Init patch function with chosen modules
  require('snabbdom/modules/class').default, // makes it easy to toggle classes
  require('snabbdom/modules/props').default, // for setting properties on DOM elements
  require('snabbdom/modules/style').default, // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners').default // attaches event listeners
])
var h = require('snabbdom/h').default // helper function for creating vnodes
const Track = require('./track')

const targetValue = ev => ev.target.value

const ifEnter = R.curry((fn, val, ev) => {
  if (ev.keyCode === 13) return fn(val)
})

// const rand = n => Math.floor(Math.random() * n)

// var exampleVideos = ['UlPkNR83XOo', 'nDqP7kcr-sc', '2OyuMJMrCRw', 'XT6BMrbjvRs']

// Model

const init = () => ({
  searchResults: ['UlPkNR83XOo', 'nDqP7kcr-sc', '2OyuMJMrCRw', 'XT6BMrbjvRs'],
  tracks: [],
  nextId: 0,
  newText: ''
})

// Actions

const Action = Type({
  ChangeNewText: [String],
  AddTrack: [String],
  Remove: [Object],
  Modify: [Object, Track.Action],
  Search: [String]
})

// Update

// action -> model -> newModel
const update = Action.caseOn({
  ChangeNewText: R.assoc('newText'),
  AddTrack: (videoId, model) => R.evolve(
    {
      tracks: R.append(Track.init(videoId, model.nextId)),
      nextId: R.inc,
      newText: R.always('')
    }, model),
  Remove: (todo, model) => R.evolve({todos: R.reject(R.eq(todo))}, model),
  Modify: (todo, action, model) => {
    const idx = R.indexOf(todo, model.tracks)
    return R.evolve({todos: R.adjust(Track.update(action), idx)}, model)
  },
  Search: (query, model) => {
    console.log('query :', query)
  }
})

// View

const viewTrack = R.curry((action$, track) => {
  return Track.view({
    action$: forwardTo(action$, Action.Modify(track)),
    remove$: forwardTo(action$, R.always(Action.Remove(track)))
  }, track)
})

const view = R.curry((action$, model) => {
  return h('div#app', [
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
                    props: {type: 'text', placeholder: 'Enter a Youtube Id'},
                    on: {
                      input: R.compose(action$, Action.ChangeNewText, targetValue),
                      keydown: ifEnter(action$, Action.Create())
                    }
                  })
                ]),
                h('p.control', [
                  h('button.button', {on: {
                    click: R.compose(action$, Action.AddTrack, model.newText)
                  }}, 'Go')
                ]),
                h('p.control', [
                  h('button.button', {on: {
                    click: R.compose(action$, Action.AddTrack, model.newText) // TODO: compose random searchResults...
                  }}, 'Rand')
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
            h('a.button.is-primary', {on: {
              click: R.compose(action$, Action.AddTrack, videoId)
            }}, videoId)
          ]), model.searchResults)
        )
      ])
    ]),
    h('section.section', [
      h('div.container', R.map(viewTrack(action$), model.tracks))
    ])
  ])
})

// Streams
const action$ = flyd.stream()
const model$ = flyd.scan(R.flip(update), init(), action$)
const vnode$ = flyd.map(view(action$), model$)

// flyd.map((model) => console.log(model), model$); // Uncomment to log state on every update

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app')
  flyd.scan(patch, container, vnode$)
})

// var vnode = h('section#app.hero.is-large.is-light', [
//   h('div.hero-body', [
//     h('div.container', [
//       h('h1.title', 'YTMXR'),
//       h('h2.subtitle', 'Youtube api not loaded yet...')
//     ])
//   ])
// ])
// patch(document.getElementById('app'), vnode)

global.onYouTubeIframeAPIReady = () => {
  console.log('onYouTubeIframeAPIReady :')
  // view(model)
}

// document.addEventListener('discusting-non-functional-message', () => view(model))
// document.addEventListener('delete-track', e => {
//   model.tracks = R.reject(R.propEq('key', e.detail), model.tracks)
//   view(model)
// })

// function addTrack (videoId) {
//   // TODO: make those updates with ramda ?
//   model.tracks.push(Track.init(videoId, 'player' + model.nextId))
//   model.nextId++
//
//   view(model)
//
//   var newTrack = R.last(model.tracks)
//   newTrack.ytInstance = new YT.Player(newTrack.key, {
//     height: '100',
//     width: '400',
//     videoId: videoId,
//     events: {
//       'onReady': onPlayerReady,
//       'onStateChange': onPlayerStateChange
//     },
//     playerVars: {
//       modestbranding: 0,
//       rel: 0
//     }
//   })
// }

// const openRandom = () => {
//   var rand = Math.floor(Math.random() * exampleVideos.length)
//   addTrack(exampleVideos[rand])
// }

// ytapi handles
// function onPlayerReady (event) {
//   var track = R.find(R.propEq('key', event.target.a.id), model.tracks)
//   console.log('track ready :', track)
//   event.target.setVolume(50)
//   event.target.playVideo()
// }
//
// function onPlayerStateChange (event) {
//   var track = R.find(R.propEq('key', event.target.a.id), model.tracks)
//   track.playerState = event.data // Oulah grosse mutation !!!
//   view(model)
// }

// function stopVideo () {
//   players[0].stopVideo()
// }
