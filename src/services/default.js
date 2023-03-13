import { createState } from '../utils/state'
import api from '../utils/api'

/**
 * Provide a appliation level common state layer
 */

const store = createState({
  localNs: 'default'
})

const TOKEN_NAME = 'tk'

export const getToken = () => store.get(TOKEN_NAME)

export const setToken = (token) => {
  store.set({ [TOKEN_NAME]: token })
}

export const checkSession = () => api.checkSession()

export default store
