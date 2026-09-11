import type { App } from 'vue'
import { local } from '@/utils'
import { createI18n } from 'vue-i18n'
import enUS from '../../locales/en_US.json'
import thTH from '../../locales/th_TH.json'
import msMY from '../../locales/ms_MY.json'
import deDE from '../../locales/de_DE.json'
import zhCN from '../../locales/zh_CN.json'

const { VITE_DEFAULT_LANG } = import.meta.env

export const i18n = createI18n({
  legacy: false,
  locale: local.get('lang') || VITE_DEFAULT_LANG, // 默认显示语言
  fallbackLocale: VITE_DEFAULT_LANG,
  messages: {
    zhCN,
    enUS,
    thTH,
    msMY,
    deDE,
  },
  // 缺失国际化键警告：后端菜单是动态数据，标识无法静态枚举，缺键时回退显示菜单标题，因此关闭警告
  missingWarn: false,

  // 缺失回退内容警告
  fallbackWarn: false,
})

export function install(app: App) {
  app.use(i18n)
}
