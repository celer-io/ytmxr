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
// var toVNode = require('snabbdom/tovnode').default
var container = document.getElementById('container')

var vnode = h('div#container.two.classes', {on: {click: () => console.log('wesh')}}, [
  h('span', {style: {fontWeight: 'bold'}}, 'This is bold'),
  ' and this is just normal text',
  h('a', {props: {href: '/foo'}}, 'I\'ll take you places!')
])
// Patch into empty DOM element – this modifies the DOM as a side effect
// patch(toVNode(container), vnode)
patch(container, vnode)

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var players = []
global.onYouTubeIframeAPIReady = function () {
  console.log('YT :', YT)
  addPlayer('76c0LIXn_P0')
}

function createPlayerNode (videoId) {
  var playerNode = document.createElement('div')
  playerNode.id = 'player' + videoId
  return playerNode
}

function addPlayer (videoId) {
  var newPlayer = {
    videoId: videoId,
    ytInstance: null,
    element: createPlayerNode(videoId)
  }
  document.getElementById('players').appendChild(newPlayer.element)
  newPlayer.ytInstance = new YT.Player('player' + videoId, {
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
  players.push(newPlayer)
}

var exampleVideos = ['76c0LIXn_P0', 'oIa4mUM9Rjw', 'qd2Dx6MIvb0', '2YjQlLg6bUM']
global.openAnother = () => {
  var rand = Math.floor(Math.random() * exampleVideos.length)
  addPlayer(exampleVideos[rand])
}

global.onVolumeChange = () => {
  var newValue = 50
  var videoId = '76c0LIXn_P0'
  var player = players.find((player) => player.videoId === videoId)
  player.ytInstance.setVolume(newValue)
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady (event) {
  event.target.playVideo()
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
// var done = false
function onPlayerStateChange (event) {
  // if (event.data === YT.PlayerState.PLAYING && !done) {
  //   setTimeout(stopVideo, 6000)
  //   done = true
  // }
}
// function stopVideo () {
//   players[0].stopVideo()
// }
