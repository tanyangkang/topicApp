const decorate = (flag, fn) => (message, ...args) => {
    message = `[${flag}] ${message}`
    return fn(message, ...args)
  }

export const getLogger = (ns) => {
  const instance = {
    log: decorate(ns, console.log),
    error: decorate(ns, console.error),
    info: decorate(ns, console.info),
    warn: decorate(ns, console.warn),
  }
  return instance
}
