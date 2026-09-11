import type { NDateLocale, NLocale } from 'naive-ui'
import { i18n } from '@/modules/i18n'
import { dateDeDE, dateMsMY, dateThTH, dateZhCN, deDE, msMY, thTH, zhCN } from 'naive-ui'

export function setLocale(locale: App.lang) {
  i18n.global.locale.value = locale
}

export const $t = i18n.global.t

export const naiveI18nOptions: Record<App.lang, { locale: NLocale | null, dateLocale: NDateLocale | null }> = {
  zhCN: {
    locale: zhCN,
    dateLocale: dateZhCN,
  },
  enUS: {
    locale: null,
    dateLocale: null,
  },
  thTH: {
    locale: thTH,
    dateLocale: dateThTH,
  },
  msMY: {
    locale: msMY,
    dateLocale: dateMsMY,
  },
  deDE: {
    locale: deDE,
    dateLocale: dateDeDE,
  },
}
