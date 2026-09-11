import type { MenuOption } from 'naive-ui'
import type { RouteRecordRaw } from 'vue-router'
import { usePermission } from '@/hooks'
import Layout from '@/layouts/index.vue'
import { $t, arrayToTree, renderIcon } from '@/utils'
import { clone, min, omit, pick } from 'radash'
import { RouterLink } from 'vue-router'

const metaFields: AppRoute.MetaKeys[]
  = ['title', 'icon', 'requiresAuth', 'roles', 'keepAlive', 'hide', 'order', 'href', 'activeMenu', 'withoutTab', 'pinTab', 'menuType']

function standardizedRoutes(route: AppRoute.RowRoute[]) {
  return clone(route).map((i) => {
    const route = omit(i, metaFields)

    Reflect.set(route, 'meta', pick(i, metaFields))
    return route
  }) as AppRoute.Route[]
}

/* 后端菜单 path → 本地视图别名（后端 component 与本地视图路径不一致时使用） */
const componentAlias: Record<string, string> = {
  '/system/user': '/setting/account/index.vue',
  '/system/menu': '/setting/menu/index.vue',
  '/system/dict': '/setting/dictionary/index.vue',
}

/* 本地无对应视图的菜单统一渲染占位页，避免路由 component 为空导致白屏 */
const FALLBACK_VIEW = '/build-in/route-placeholder/index.vue'

function resolveViewComponent(modules: Record<string, any>, row: AppRoute.Route) {
  if (row.componentPath && modules[`/src/views${row.componentPath}`])
    return modules[`/src/views${row.componentPath}`]
  const alias = componentAlias[row.path]
  if (alias && modules[`/src/views${alias}`])
    return modules[`/src/views${alias}`]
  return modules[`/src/views${FALLBACK_VIEW}`]
}

export function createRoutes(routes: AppRoute.RowRoute[]) {
  const { hasPermission } = usePermission()

  // Structure the meta field
  let resultRouter = standardizedRoutes(routes)

  // Route permission filtering + 剔除按钮权限行（无 path，不能注册为路由）
  resultRouter = resultRouter
    .filter(i => hasPermission(i.meta.roles))
    .filter(i => i.meta.menuType !== 'permission' && !!i.path)

  // Generate routes, no need to import files for those with redirect
  const modules: Record<string, any> = import.meta.glob('@/views/**/*.vue')
  resultRouter = resultRouter.map((item: AppRoute.Route) => {
    // 重定向行：保持无 component（嵌套/跳转记录）
    if (item.redirect)
      return item
    const menuType = (item.meta as any)?.menuType
    // 目录行：setRedirect 稍后会补 redirect，保持无 component 才能让子路由嵌套渲染；
    // 若给了占位组件，子页面会被吞掉只显示占位页
    if (menuType === 'dir' || menuType === 'directory')
      return item
    // 页面行：直连本地视图 → 别名映射 → 占位页兜底
    item.component = resolveViewComponent(modules, item)
    return item
  })

  // Generate route tree
  resultRouter = arrayToTree(resultRouter) as AppRoute.Route[]

  const appRootRoute: RouteRecordRaw = {
    path: '/appRoot',
    name: 'appRoot',
    redirect: import.meta.env.VITE_HOME_PATH,
    component: Layout,
    meta: {
      title: '',
      icon: 'icon-park-outline:home',
    },
    children: [],
  }

  // Set the correct redirect path for the route
  setRedirect(resultRouter)

  // Insert the processed route into the root route
  appRootRoute.children = resultRouter as unknown as RouteRecordRaw[]
  return appRootRoute
}

// Generate an array of route names that need to be kept alive
export function generateCacheRoutes(routes: AppRoute.RowRoute[]) {
  return routes
    .filter(i => i.keepAlive)
    .map(i => i.name)
}

function setRedirect(routes: AppRoute.Route[]) {
  routes.forEach((route) => {
    if (route.children) {
      if (!route.redirect) {
        // Filter out a collection of child elements that are not hidden
        const visibleChilds = route.children.filter(child => !child.meta.hide)

        // Redirect page to the path of the first child element by default
        let target = visibleChilds[0]

        // Filter out pages with the order attribute
        const orderChilds = visibleChilds.filter(child => child.meta.order)

        if (orderChilds.length > 0)
          target = min(orderChilds, i => i.meta.order!) as AppRoute.Route

        if (target)
          route.redirect = target.path
      }

      setRedirect(route.children)
    }
  })
}

/* 生成侧边菜单的数据 */
export function createMenus(userRoutes: AppRoute.RowRoute[]) {
  const resultMenus = standardizedRoutes(userRoutes)

  // filter menus that do not need to be displayed
  const visibleMenus = resultMenus.filter(route => !route.meta.hide)

  // generate side menu
  return arrayToTree(transformAuthRoutesToMenus(visibleMenus))
}

// render the returned routing table as a sidebar
function transformAuthRoutesToMenus(userRoutes: AppRoute.Route[]) {
  const { hasPermission } = usePermission()
  return userRoutes
    // Filter out side menus without permission
    .filter(i => hasPermission(i.meta.roles))
    //  Sort the menu according to the order size
    .sort((a, b) => {
      if (a.meta && a.meta.order && b.meta && b.meta.order)
        return a.meta.order - b.meta.order
      else if (a.meta && a.meta.order)
        return -1
      else if (b.meta && b.meta.order)
        return 1
      else return 0
    })
    // Convert to side menu data structure
    .map((item) => {
      const target: MenuOption = {
        id: item.id,
        pid: item.pid,
        label:
          (!item.meta.menuType || item.meta.menuType === 'page')
            ? () =>
                h(
                  RouterLink,
                  {
                    to: {
                      path: item.path,
                    },
                  },
                  { default: () => $t(`route.${String(item.name)}`, item.meta.title) },
                )
            : () => $t(`route.${String(item.name)}`, item.meta.title),
        key: item.path,
        icon: item.meta.icon ? renderIcon(item.meta.icon) : undefined,
      }
      return target
    })
}
