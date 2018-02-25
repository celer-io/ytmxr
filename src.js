/* global YT */
/* exported onYouTubeIframeAPIReady */

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script')

tag.src = 'https://www.youtube.com/iframe_api'
var firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var players = []
function onYouTubeIframeAPIReady () {
  var playersEl = document.getElementById('players')
  var newPLayerName = 'player' + players.length
  var playerDiv = document.createElement('div')
  playerDiv.id = newPLayerName
  playersEl.appendChild(playerDiv)
  console.log('YT :', YT)
  players.push(new YT.Player(newPLayerName, {
    height: '200',
    width: '200',
    videoId: 'M7lc1UVf-VE',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  }))
}

function openAnother () {
  console.log('openAnother :')
  var playersEl = document.getElementById('players')
  var newPLayerName = 'player' + players.length
  var playerDiv = document.createElement('div')
  playerDiv.id = newPLayerName
  playersEl.appendChild(playerDiv)
  console.log('YT :', YT)
  players.push(new YT.Player(newPLayerName, {
    height: '200',
    width: '200',
    videoId: '76c0LIXn_P0',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  }))
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady (event) {
  console.log('onPlayerReady :')
  console.log('event :', event)
  event.target.playVideo()
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
// var done = false
function onPlayerStateChange (event) {
  console.log('onPlayerStateChange :')
  console.log('event :', event)
  // if (event.data === YT.PlayerState.PLAYING && !done) {
  //   setTimeout(stopVideo, 6000)
  //   done = true
  // }
}
// function stopVideo () {
//   players[0].stopVideo()
// }
