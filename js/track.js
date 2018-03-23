// const R = require('ramda')
const h = require('snabbdom/h').default

const init = (videoId, key) => ({
  key: key,
  videoId: videoId,
  playerState: -1,
  ytInstance: null,
  record: null,
  recording: false
})

// h('i.fas.fa-x2.fa-play-circle')
const view = model => h('div.box', {key: model.key}, [
  h('article.media', [
    h('div.media-left', [
      h('figure#' + model.key + '.image.is-96x96')
    ]),
    h('div.media-content', [
      h('div.field.is-grouped', [
        h('p.control', [
          h('button.button.is-large', {on: {click: () => stepBackward(model)}}, [
            h('span.icon.is-medium', h('i.fas.fa-x2.fa-step-backward'))
          ])
        ]),
        h('p.control', [
          h('button.button.is-large', {on: {click: () => fastBackward(model)}}, [
            h('span.icon.is-medium', h('i.fas.fa-x2.fa-fast-backward'))
          ])
        ]),
        h('p.control', [
          h('button.button.is-large', {on: {click: () => togglePlay(model)}}, [
            h('span.icon.is-medium', h('i.fas.fa-x2.' + getStateIcon(model)))
          ])
        ]),
        h('p.control', [
          h('button.button.is-large', {on: {click: () => stop(model)}}, [
            h('span.icon.is-medium', h('i.fas.fa-x2.fa-stop'))
          ])
        ]),
        h('p.control', [
          h('button.button.is-large', {on: {click: () => rec(model)}}, [
            h('span.icon.is-medium.has-text-danger', h('i.fas.fa-x2.fa-circle'))
          ])
        ]),
        h('p.control', [
          h('button.button.is-large', {on: {click: () => playLoop(model)}}, [
            h('span.icon.is-medium', h('i.fas.fa-x2.fa-redo'))
          ])
        ]),
        h('p.control', [
          h('button.button.is-large', {on: {click: () => fastForward(model)}}, [
            h('span.icon.is-medium', h('i.fas.fa-x2.fa-fast-forward'))
          ])
        ]),
        h('p.control', [
          h('button.button.is-large', {on: {click: () => stepForward(model)}}, [
            h('span.icon.is-medium', h('i.fas.fa-x2.fa-step-forward'))
          ])
        ])
      ]),
      h('div.field', [
        h('p.control', [
          h('input.slider.is-fullwidth.is-large.is-warning', {
            props: {step: 1, min: 0, max: 100, value: 50, type: 'range'},
            on: {input: e => setVolume(model, e.target.value)}
          })
        ])
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
  console.log('model.recording :', model.recording)
}

const playLoop = model => {
  if (model.record.start < model.record.end) {
    var loopDurationMili = (model.record.end - model.record.start) * 1000
    console.log('loopDurationMili :', loopDurationMili)
    setInterval(() => model.ytInstance.seekTo(model.record.start), loopDurationMili)
    // TODO: a bit more work on this
  }
}

const fastForward = model => {
  model.ytInstance.seekTo(model.ytInstance.getCurrentTime() + 20, true)
}

const stepForward = model => {
  model.ytInstance.seekTo(model.ytInstance.getCurrentTime() + 5, true)
}

const stepBackward = model => {
  model.ytInstance.seekTo(model.ytInstance.getCurrentTime() - 5, true)
}

const fastBackward = model => {
  model.ytInstance.seekTo(model.ytInstance.getCurrentTime() - 20, true)
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
