/**
 * api.request wrapper with toast, loading, token etc,.
 */

import { getToken } from '../services/default'

import { combine, noop, debug } from './util'
import api from './api'

const callIf = (o, method, args) => {
  const f = o[method]
  if (typeof f === 'function') {
    return f.apply(o, args)
  }
  return undefined
}

export default obj => {
  const {
    showLoading,
    loading,

    // show toast when success -> { title, icon }
    toast,

    // normalize api data -> { err, data, message }
    normalize = true,

    url,
    method = 'get',

    // default to show request error (can dismiss by showError: false)
    showError,

    // some specs for wx.request(params)
    ...params
  } = obj

  if (showLoading && !toast) {
    api.showLoading({
      title: loading || ''
    })
  }

  if (!url) {
    throw new Error('Invalid api url')
  }

  let resolve
  let reject

  const promise = new Promise((r, j) => {
    resolve = r
    reject = j
  })

  const hideLoading = () => {
    if (showLoading && !toast) {
      api.hideLoading()
    }
  }

  params.header = params.header || {}

  // attach token
  const token = getToken()
  if (token) {
    params.header.authorization = `Bearer ${token}`
  }

  api.request({
    ...params,
    url: api.resolveUrl(url),
    method,
    success (resp) {
      debug(`"${method.toUpperCase()} ${url}" with parameters: ${JSON.stringify(params.data)} ->`, resp.data)
      hideLoading()

      const data = resp.data
      if (resp.statusCode !== 200 || data.errorCode) {
        if (showError !== false) {
          api.showModal({
            title: '请求失败',
            content: resp.data.errorMsg || '网络异常...',
            showCancel: false,
            confirmText: '关闭',
            confirmColor: '#4980eb'
          })
        }
        callIf(obj, 'fail', [resp])
        reject(resp)
        return
      }

      if (toast) {
        api.showToast({
          title: toast.title,
          icon: toast.icon || 'success',
          duration: 2000,
          success () {
            setTimeout(() => { callIf(obj, 'success', [resp]) }, 1000)
          }
        })
      } else {
        callIf(obj, 'success', [resp])
      }

      if (normalize) {
        // enhance result for api spec, -> { code, msg, result }
        if (['err', 'result'].every(k => data[k] !== undefined)) {
          if (data.err === 0) {
            resolve(data.result)
          } else {
            reject(data)
          }
        } else {
          resolve(data)
        }
      }
    },
    fail(err) {
      hideLoading()
      callIf(obj, 'fail', [err])
      reject(err)
    },
    complete (...args) {
      hideLoading()
      callIf(obj, 'complete', args)
    }
  })

  return promise
}
