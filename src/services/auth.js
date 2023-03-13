import request from '../utils/request'
import api from '../utils/api'
import { createState } from '../utils/state'
import { throttleAsync } from '../utils/util'

import { setToken } from './default'

const state = createState({
  localNs: 'auth'
})

/**
 *  鉴权，判断微信授权及应用授权
 */
export const getAuth = throttleAsync(async ({ force } = { force: false }) => {
  let auth = state.get('auth')
  if (auth && !force) {
    return auth
  }
  auth = await authorize()
  state.set({ auth })
  return auth
})

export const checkAuth = () => !!state.get('auth')

export const authorize = async () => {
  const { code } = await api.login()
  const data /* { token, openid, session_key } */ = await request({
    url: `wxapi/getopenid?appid=${api.appId}`,
    method: 'POST',
    data: { code }
  })

  const { openid, token } = data

  if (!token) {
    throw new Error('token not valid')
  } else {
    setToken(token)
  }

  let userInfo = null
  try {
    userInfo = await request({
      url: 'wxapi/login',
      method: 'POST',
      data: { openid }
    })
  } catch (err) {
    console.log(err.msg || err)
  }

  return { ...data, userInfo }
}
