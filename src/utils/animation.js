import api from './api'

export const rotate = (ctx, key, delay = 0) => {
  const animation = api.createAnimation({
    duration: 1000,
    timingFunction: 'ease'
  })
  if (ctx && key) {
    setTimeout(() => {
      ctx.setData({
        [key]: animation.rotate(360).step().export()
      })
    }, 0)
  }
  return animation.rotate(360).step().export()
}

export const increase = (ctx, key, width, delay = 100) => {
  const animation = api.createAnimation({
    duration: 1000,
    timingFunction: 'ease'
  })
  if (ctx && key) {
    setTimeout(() => {
      ctx.setData({
        [key]: animation.width(`${width}%`).step().export()
      })
    }, delay)
  }
  return animation.width(`${width}%`).step().export()
}
