import request from '../utils/request'
import api from '../utils/api'
import { createState } from '../utils/state'

import { getAuth } from './auth'
import { checkSession } from './default'

const state = createState({
  localNs: 'profile'
})

export const getUserInfo = async ({ force } = { force: false }) => {
  let userInfo = state.get('userInfo')
  if (userInfo && !force) {
    return userInfo
  }
  const { openid } = await getAuth()
  userInfo = await request({
    url: 'wxapi/login',
    method: 'POST',
    data: { openid }
  })
  state.set({ userInfo })
  return userInfo
}

export const registerMember = async (userInfo) => {
  const data = {
    ...userInfo
  }
  await request({
    url: 'wxapi/member',
    method: 'POST',
    data
  })
}

export const updateUserInfo = async (userInfo) => {
  const data = {
    ...state.get('userInfo'),
    ...userInfo
  }
  await request({
    url: 'wxapi/member',
    method: 'PUT',
    data
  })
}

export const getWeRunData = async () => {
  try {
    await checkSession()
  } catch (e) {
    // re-login for refresh session_key
    await getAuth({ force: true })
  }
  const res = await api.getWeRunData()
  const userInfo = getUserInfo()
  const {
    encryptedData,
    iv
  } = res
  return await request({
    url: 'wxapi/workout',
    method: 'POST',
    data: {
      encryptedData,
      iv,
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      days: (new Date()).getDay()
    }
  })
}

