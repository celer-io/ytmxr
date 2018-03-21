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
const track = require('./track')

var container = document.getElementById('container')

var vnode = h('div#container.two.classes', {on: {click: () => console.log('wesh')}}, [
  h('span', {style: {fontWeight: 'bold'}}, 'This is bold'),
  ' and this is just normal text',
  h('a', {props: {href: '/foo'}}, 'I\'ll take you places!')
])
// Patch into empty DOM element – this modifies the DOM as a side effect
// patch(toVNode(container), vnode)
patch(container, vnode)

const model = {
  tracks: [],
  nextId: 0,
  newVideoId: ''
}

global.onYouTubeIframeAPIReady = () => {
  addPlayer('76c0LIXn_P0')
}

function addPlayer (videoId) {
  model.tracks.push(track.init(videoId, 'player' + model.nextId))
  model.nextId++
  var newvNode = h(
    'div#container.container.two.classes',
    [
      h('div#controls', [
        h('input', {
          props: {
            placeholder: 'Enter a Youtube Id',
            value: model.newVideoId
          },
          on: {input: e => { model.newVideoId = e.target.value }}
        }),
        h('button', {on: {click: () => addPlayer(model.newVideoId)}}, 'Go'),
        h('button', {on: {click: openRandom}}, 'Rand')
      ]),
      h('div#tracks', R.map(p => p.vnode, model.tracks))
    ]
  )
  patch(vnode, newvNode)
  vnode = newvNode // Need statefull FRP shit ?
  var newTrack = R.last(model.tracks)
  newTrack.ytInstance = new YT.Player(newTrack.vnode.key, {
    height: '80',
    width: '600',
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

var exampleVideos = ['76c0LIXn_P0', 'oIa4mUM9Rjw', 'qd2Dx6MIvb0', '2YjQlLg6bUM']
const openRandom = () => {
  var rand = Math.floor(Math.random() * exampleVideos.length)
  addPlayer(exampleVideos[rand])
}

// global.onVolumeChange = () => {
//   var newValue = 50
//   var videoId = '76c0LIXn_P0'
//   var player = players.find((player) => player.videoId === videoId)
//   player.ytInstance.setVolume(newValue)
// }

// 4. The API will call this function when the video player is ready.
function onPlayerReady (event) {
  event.target.playVideo()
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
// var done = false
function onPlayerStateChange (event) {
  console.log('event :', event)
  // console.log('event.data :', event.data)
  // console.log('YT.PlayerState :', YT.PlayerState)
  // if (event.data === YT.PlayerState.PLAYING && !done) {
  //   setTimeout(stopVideo, 6000)
  //   done = true
  // }
}
// function stopVideo () {
//   players[0].stopVideo()
// }
