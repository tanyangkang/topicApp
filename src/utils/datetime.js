import dayjs from 'dayjs'

// Format time with time ago
export function fromNow (time) {
  const d = dayjs(time).toDate()
  if (!d) {
    return time
  }

  const now = Date.now()
  const diff = (now - +d) / 1000

  if (diff < 30) {
    return '刚刚'
  }
  if (diff < 3600) {
    // less 1 hour
    return `${Math.ceil(diff / 60)} 分钟前`
  }
  if (diff < 3600 * 24) {
    return `${Math.ceil(diff / 3600)} 小时前`
  }
  if (diff < 3600 * 24 * 7) {
    return `${Math.ceil(diff / (3600 * 24))} 天前`
  }
  if (diff < 3600 * 24 * 30) {
    return `${Math.ceil(diff / (3600 * 24 * 7))} 周前`
  }

  return `${d.getMonth() + 1}月${d.getDate()}日${d.getHours()}时${d.getMinutes()}分`
}
