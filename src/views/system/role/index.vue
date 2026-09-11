<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import { useBoolean } from '@/hooks'
import { fetchDeleteRole, fetchRolePage, fetchUpdateRole } from '@/service'
import { NButton, NPopconfirm, NSpace, NSwitch, NTag } from 'naive-ui'
import TableModal from './components/TableModal.vue'

/* 前端约定：status 1=启用 0=禁用（后端 0=正常/1=停用，加载时已翻转） */
interface RoleRow {
  id: number
  roleName: string
  roleKey: string
  status: 0 | 1
  remark?: string
  createTime?: string
}

const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)
const modalRef = ref()

const searchModel = ref({
  roleName: '',
  roleKey: '',
})

const listData = ref<RoleRow[]>([])
const count = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

async function getRoleList() {
  startLoading()
  const { data, isSuccess } = await fetchRolePage({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    roleName: searchModel.value.roleName || undefined,
    roleKey: searchModel.value.roleKey || undefined,
  }) as any
  if (isSuccess) {
    listData.value = (data.list || []).map((item: any) => ({
      ...item,
      status: item.status === 0 ? 1 : 0,
    }))
    count.value = data.total || 0
  }
  endLoading()
}

function handleResetSearch() {
  searchModel.value = { roleName: '', roleKey: '' }
  pageNum.value = 1
  getRoleList()
}

function changePage(page: number, size: number) {
  pageNum.value = page
  pageSize.value = size
  getRoleList()
}

async function deleteRole(id: number) {
  const { isSuccess } = await fetchDeleteRole(id)
  if (isSuccess) {
    window.$message.success('删除成功')
    getRoleList()
  }
}

async function handleUpdateDisabled(value: 0 | 1, id: number) {
  // 前端 1=启用 → 后端 0=正常
  const { isSuccess } = await fetchUpdateRole(id, { status: value === 1 ? 0 : 1 })
  if (isSuccess) {
    const index = listData.value.findIndex(item => item.id === id)
    if (index > -1)
      listData.value[index].status = value
  }
  else {
    getRoleList()
  }
}

const columns: DataTableColumns<RoleRow> = [
  {
    title: '角色名称',
    key: 'roleName',
  },
  {
    title: '权限字符',
    key: 'roleKey',
    render: (row) => {
      return (
        <NTag type="info">{row.roleKey}</NTag>
      )
    },
  },
  {
    title: '状态',
    align: 'center',
    key: 'status',
    render: (row) => {
      return (
        <NSwitch
          value={row.status}
          checked-value={1}
          unchecked-value={0}
          onUpdateValue={(value: 0 | 1) =>
            handleUpdateDisabled(value, row.id)}
        >
          {{ checked: () => '启用', unchecked: () => '禁用' }}
        </NSwitch>
      )
    },
  },
  {
    title: '备注',
    key: 'remark',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '创建时间',
    key: 'createTime',
  },
  {
    title: '操作',
    align: 'center',
    key: 'actions',
    width: '15em',
    render: (row) => {
      return (
        <NSpace justify="center">
          <NButton
            size="small"
            onClick={() => modalRef.value.openModal('view', row)}
          >
            查看
          </NButton>
          <NButton
            size="small"
            onClick={() => modalRef.value.openModal('edit', row)}
          >
            编辑
          </NButton>
          <NPopconfirm onPositiveClick={() => deleteRole(row.id)}>
            {{
              default: () => '确认删除',
              trigger: () => <NButton size="small" type="error">删除</NButton>,
            }}
          </NPopconfirm>
        </NSpace>
      )
    },
  },
]

onMounted(() => {
  getRoleList()
})
</script>

<template>
  <NSpace vertical class="flex-1">
    <n-card>
      <n-form :model="searchModel" label-placement="left" inline :show-feedback="false">
        <n-flex>
          <n-form-item label="角色名称" path="roleName">
            <n-input v-model:value="searchModel.roleName" placeholder="请输入" clearable />
          </n-form-item>
          <n-form-item label="权限字符" path="roleKey">
            <n-input v-model:value="searchModel.roleKey" placeholder="请输入" clearable />
          </n-form-item>
          <n-flex class="ml-auto">
            <NButton type="primary" @click="getRoleList">
              <template #icon>
                <icon-park-outline-search />
              </template>
              搜索
            </NButton>
            <NButton strong secondary @click="handleResetSearch">
              <template #icon>
                <icon-park-outline-redo />
              </template>
              重置
            </NButton>
          </n-flex>
        </n-flex>
      </n-form>
    </n-card>

    <n-card class="flex-1">
      <template #header>
        <NButton type="primary" @click="modalRef.openModal('add')">
          <template #icon>
            <icon-park-outline-add-one />
          </template>
          新建角色
        </NButton>
      </template>
      <NSpace vertical>
        <n-data-table :columns="columns" :data="listData" :loading="loading" />
        <Pagination :count="count" @change="changePage" />
      </NSpace>

      <TableModal ref="modalRef" modal-name="角色" @success="getRoleList" />
    </n-card>
  </NSpace>
</template>