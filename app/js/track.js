// const R = require('ramda')
const h = require('snabbdom/h').default

const init = (videoId, key) => ({
  key: key,
  videoId: videoId,
  playerState: -1,
  ytInstance: null
})

// h('i.fas.fa-x2.fa-play-circle')
const view = model => h('div.box', {key: model.key}, [
  h('article.media', [
    h('div.media-left', [
      h('figure#' + model.key + '.image.is-96x96')
    ]),
    h('div.media-content', [
      h('button.button.is-large', {on: {click: () => togglePlay(model)}}, [
        h('span.icon.is-medium', h('i.fas.fa-x2.' + getStateIcon(model)))
      ]),
      h('button.button.is-large', {on: {click: () => stop(model)}}, [
        h('span.icon.is-medium', h('i.fas.fa-x2.fa-stop'))
      ])
    ]),
    h('div.media-right', [
      h('button.delete', {on: {click: () => console.log('model :', model)}})
    ])
  ])
])

const getStateIcon = model => {
  switch (model.playerState) {
    case -1: //  – unstarted
    case 3 : // – buffering
      return 'fa-spinner.fa-pulse'
    case 0 : // – ended
    case 2 : // – paused
    case 5 : // – video cued
      return 'fa-play'
    case 1 : // – playing
      return 'fa-pause'
  }
}

const togglePlay = model => {
  if (model.playerState === 1) model.ytInstance.pauseVideo()
  else model.ytInstance.playVideo()
}

const stop = model => {
  model.ytInstance.stopVideo()
}

module.exports = {
  init,
  view
}
