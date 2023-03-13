const defaultOptions = {
  localNs: '',
  initial: null
}

export const createState = ({ localNs, initial } = defaultOptions) => {
  const state = {
    ...initial
  }

  const setState = (payload) => {
    Object.assign(state, payload)
    if (localNs) {
      wx.setStorageSync(localNs, state)
    }
  }

  const getState = (key) => state[key]

  if (localNs) {
    // sync with local storage
    const cache = wx.getStorageSync(localNs)
    setState(cache)
  }

  return {
    set: setState,
    get: getState,
  }
}
