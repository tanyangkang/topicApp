import request from '../utils/request'
import api from '../utils/api'
import { createState } from '../utils/state'
import { throttleAsync } from '../utils/util'

import { getAuth } from './auth'

const state = createState({
  launched: false,
  auth: null,
  ready: false,
  loading: false,
})

const pendding = []

const addPendding = (cb) => {
  pendding.push(cb)
}

const processPendding = (...args) => {
  let fn
  while (fn = pendding.shift()) {
    fn(...args)
  }
}

export const initApp = throttleAsync(async () => {
  state.set({
    launched: true,
    loading: true,
    ready: false,
  })

  let auth
  let error = null

  try {
    // init auth token and userinfo
    auth = await getAuth({ force: true })
    state.set({ ready: true, auth })
  } catch (err) {
    error = err
    state.set({ ready: false })
  }

  state.set({ loading: false })
  processPendding(error, auth)

  return state
})

export const onAppReady = (callback) => {
  if (!state.get('launched')) {
    initApp().finally(() => onAppReady(callback))
    return
  }

  if (state.get('loading')) {
    addPendding(callback)
  } else if (state.get('ready')) {
      callback(null, state.get('auth'))
    } else {
      callback(new Error('app still not ready'))
    }
}
