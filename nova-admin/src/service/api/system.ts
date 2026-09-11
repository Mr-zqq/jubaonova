import { request } from '../http'

// 获取所有路由信息
export function fetchAllRoutes() {
  return request.Get<Service.ResponseResult<AppRoute.RowRoute[]>>('/getUserRoutes')
}

// 获取所有用户信息
export function fetchUserPage() {
  return request.Get<Service.ResponseResult<Entity.User[]>>('/userPage')
}

/* 前端用户表单 → 后端用户 DTO 字段映射 */
function mapUserToDto(data: Partial<Entity.User> & { password?: string }) {
  const body: Record<string, any> = {}
  if (data.userName !== undefined)
    body.username = data.userName
  if (data.nickname !== undefined)
    body.nickName = data.nickname
  if (data.email !== undefined)
    body.email = data.email
  if (data.tel !== undefined)
    body.phone = data.tel
  // 前端 1=男/0=女 → 后端 male/female
  if (data.gender !== undefined)
    body.gender = data.gender === 1 ? 'male' : 'female'
  // 前端 1=启用/0=禁用 → 后端 0=正常/1=停用
  if (data.status !== undefined)
    body.status = data.status === 1 ? 0 : 1
  if (data.remark !== undefined)
    body.remark = data.remark
  if (data.avatar !== undefined)
    body.avatar = data.avatar
  // 前端角色 id 数组 → 后端 roleIds
  if (data.role !== undefined)
    body.roleIds = data.role as number[]
  return body
}

// 新建用户
export function fetchCreateUser(data: Entity.User & { password?: string }) {
  return request.Post('/user', {
    ...mapUserToDto(data),
    password: data.password || '123456',
  })
}

// 更新用户
export function fetchUpdateUser(id: number, data: Partial<Entity.User>) {
  return request.Patch(`/user/${id}`, mapUserToDto(data))
}

// 删除用户
export function fetchDeleteUser(id: number) {
  return request.Delete(`/user/${id}`)
}

// 角色分页
export function fetchRolePage(params?: Record<string, any>) {
  return request.Get('/role', { params })
}
// 新建角色
export function fetchCreateRole(data: any) {
  return request.Post('/role', data)
}
// 更新角色
export function fetchUpdateRole(id: number, data: any) {
  return request.Patch(`/role/${id}`, data)
}
// 删除角色
export function fetchDeleteRole(id: number) {
  return request.Delete(`/role/${id}`)
}
// 角色详情（含菜单/部门关联）
export function fetchRoleDetail(id: number) {
  return request.Get(`/role/${id}`)
}

// 部门扁平列表
export function fetchDeptList() {
  return request.Get('/dept')
}
// 部门下拉树
export function fetchDeptOptions() {
  return request.Get('/dept/options')
}
// 新建部门
export function fetchCreateDept(data: any) {
  return request.Post('/dept', data)
}
// 更新部门
export function fetchUpdateDept(id: number, data: any) {
  return request.Patch(`/dept/${id}`, data)
}
// 删除部门
export function fetchDeleteDept(id: number) {
  return request.Delete(`/dept/${id}`)
}

// 登录日志分页
export function fetchLoginLogPage(params?: Record<string, any>) {
  return request.Get('/login-log', { params })
}
// 删除登录日志（逗号分隔 id）
export function fetchDeleteLoginLog(ids: string) {
  return request.Delete(`/login-log/${ids}`)
}
// 清空登录日志
export function fetchCleanLoginLog() {
  return request.Delete('/login-log/clean')
}

// 服务状态
export function fetchServerStatus() {
  return request.Get('/server-status')
}
// 获取所有角色列表
export function fetchRoleList() {
  return request.Get<Service.ResponseResult<Entity.Role[]>>('/role/list')
}

/**
 * 请求获取字典列表
 *
 * @param code - 字典编码，用于筛选特定的字典列表
 * @returns 返回的字典列表数据
 */
export function fetchDictList(code?: string) {
  const params = { code }
  return request.Get<Service.ResponseResult<Entity.Dict[]>>('/dict/list', { params })
}
