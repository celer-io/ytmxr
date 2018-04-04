/* global YT, CustomEvent */
const R = require('ramda')
const h = require('snabbdom/h').default

const init = (videoId, key) => ({
  key: key,
  videoId: videoId,
  playerState: -1,
  ytInstance: null,
  record: {
    start: null,
    end: null
  },
  recording: false,
  loopInterval: null
})

const view = model => h('div.box', {key: model.key + 'box'}, [
  h('article.media', [
    h('div.media-left', [
      h('figure#' + model.key, {
        hook: {
          insert: createYtPlayer(model)
        }
      })
    ]),
    h('div.media-content', [
      h('div.field.is-grouped.is-grouped-multiline', [
        h('p.control', [
          h('button.button.is-large', {on: {click: () => stepBackward(model)}}, [
            h('span.icon.is-medium', h('i.fas.fa-x2.fa-step-backward'))
          ])
        ]),
        h('p.control', [
          h('button.button.is-large', {on: {click: () => togglePlay(model)}}, [
            h('span.icon.is-medium', h('i.fas.fa-x2.' + getStateIcon(model)))
          ])
        ]),
        h('p.control', [
          h('button.button.is-large', {on: {click: () => stepForward(model)}}, [
            h('span.icon.is-medium', h('i.fas.fa-x2.fa-step-forward'))
          ])
        ]),
        h('p.control', [
          h('button.button.is-large', {on: {click: () => rec(model)}}, [
            h('span.icon.is-medium.has-text-danger', h('i.fas.fa-x2.fa-circle', {class: {'fa-blink': model.recording}}))
          ])
        ]),
        h('p.control', [
          h('button.button.is-large', {props: {disabled: !hasLoop(model)}, on: {click: () => toggleLoop(model)}}, [
            h('span.icon.is-medium', h('i.fas.fa-x2.fa-redo', {class: {'fa-pulse': model.loopInterval}}))
          ])
        ])
      ]),
      h('div.field.level.has-addons', [
        h('p.control', [
          h('span.icon.is-large', [
            h('i.fas.fa-lg.fa-volume-down')
          ])
        ]),
        h('p.control.is-expanded', [
          h('input.slider.is-fullwidth.is-medium.is-circle', {
            props: {step: 1, min: 0, max: 100, value: 50, type: 'range'},
            on: {input: e => setVolume(model, e.target.value)}
          })
        ]),
        h('p.control', [
          h('span.icon.is-large', [
            h('i.fas.fa-lg.fa-volume-up')
          ])
        ])
      ])
    ]),
    h('div.media-right', [
      h('button.delete', {on: {click: () => deleteTrack(model)}})
    ])
  ])
])

const createYtPlayer = R.curry((model, vnode) => {
  model.ytInstance = new YT.Player(model.key, {
    height: '100',
    width: '400',
    videoId: model.videoId,
    events: {
      'onReady': onPlayerReady(model),
      'onStateChange': onPlayerStateChange(model)
    },
    playerVars: {
      modestbranding: 0,
      rel: 0
    }
  })
})

// ytapi handles
const onPlayerReady = R.curry((model, event) => {
  event.target.setVolume(50)
  event.target.playVideo()
})

const onPlayerStateChange = R.curry((model, event) => {
  model.playerState = event.data
  callRedraw()
})

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

const setVolume = (model, value) => {
  model.ytInstance.setVolume(value)
}

const rec = model => {
  if (!model.recording) {
    model.recording = true
    model.record = {
      start: model.ytInstance.getCurrentTime(),
      end: null
    }
  } else {
    model.recording = false
    model.record.end = model.ytInstance.getCurrentTime()
  }
  callRedraw()
}

const hasLoop = model => {
  return model.record.start < model.record.end
}

const toggleLoop = model => {
  if (!model.loopInterval) {
    var loopDurationMili = (model.record.end - model.record.start) * 1000
    model.ytInstance.seekTo(model.record.start)
    model.loopInterval = setInterval(() => model.ytInstance.seekTo(model.record.start), loopDurationMili)
  } else {
    clearInterval(model.loopInterval)
    model.loopInterval = null
  }
  callRedraw()
}

const stepForward = model => {
  model.ytInstance.seekTo(model.ytInstance.getCurrentTime() + 5, true)
}
const stepBackward = model => {
  model.ytInstance.seekTo(model.ytInstance.getCurrentTime() - 5, true)
}

const togglePlay = model => {
  if (model.playerState === 1) model.ytInstance.pauseVideo()
  else model.ytInstance.playVideo()
}

const callRedraw = () => {
  document.dispatchEvent(new CustomEvent('call-redraw'))
}

const deleteTrack = model => {
  model.ytInstance.destroy()
  document.dispatchEvent(new CustomEvent('delete-track', {'detail': model.key}))
}

module.exports = {
  init,
  view
}
