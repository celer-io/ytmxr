// const R = require('ramda')
const h = require('snabbdom/h').default

const init = (videoId, key) => ({
  videoId: videoId,
  ytInstance: null,
  vnode: h('div.track', {key: key}, [
    videoId,
    h('div#' + key)
  ])
})

module.exports = {
  init
}
