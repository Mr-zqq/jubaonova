import { createAlovaInstance } from './alova'

/* 解析后端地址：构建值里的 localhost 按页面主机名替换，
   本机打开走 localhost，局域网同事打开走本机 LAN IP */
function resolveBaseURL() {
  try {
    const raw = (__URL_MAP__ as any)?.url?.path as string | undefined
    if (raw) {
      const u = new URL(raw)
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        const host = window.location.hostname
        return `${u.protocol}//${host}${u.port ? `:${u.port}` : ''}`
      }
      return raw
    }
  }
  catch {
    // 忽略解析异常，使用兜底地址
  }
  return `http://${window.location.hostname}:3001`
}

export const request = createAlovaInstance({
  baseURL: resolveBaseURL(),
})

export const blankInstance = createAlovaInstance({
  baseURL: '',
})
