<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import { useBoolean } from '@/hooks'
import { fetchDeleteDept, fetchDeptList, fetchUpdateDept } from '@/service'
import { arrayToTree } from '@/utils'
import { NButton, NPopconfirm, NSpace, NSwitch } from 'naive-ui'
import TableModal from './components/TableModal.vue'

/* 前端约定：status 1=启用 0=禁用（后端 0=正常/1=停用，加载时已翻转） */
interface DeptRow {
  id: number
  parentId: number
  deptName: string
  sort?: number
  leader?: string
  phone?: string
  email?: string
  status: 0 | 1
  remark?: string
  children?: DeptRow[]
}

const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)
const modalRef = ref()

const tableData = ref<DeptRow[]>([])

async function getDeptList() {
  startLoading()
  const { data, isSuccess } = await fetchDeptList() as any
  if (isSuccess) {
    const rows = (Array.isArray(data) ? data : []).map((item: any) => ({
      ...item,
      status: item.status === 0 ? 1 : 0,
    }))
    tableData.value = arrayToTree(rows)
  }
  endLoading()
}

async function deleteDept(id: number) {
  const { isSuccess } = await fetchDeleteDept(id)
  if (isSuccess) {
    window.$message.success('删除成功')
    getDeptList()
  }
}

async function handleUpdateDisabled(value: 0 | 1, id: number) {
  const { isSuccess } = await fetchUpdateDept(id, { status: value === 1 ? 0 : 1 })
  if (isSuccess)
    getDeptList()
}

const columns: DataTableColumns<DeptRow> = [
  {
    title: '部门名称',
    key: 'deptName',
  },
  {
    title: '排序',
    align: 'center',
    key: 'sort',
    width: '6em',
  },
  {
    title: '负责人',
    align: 'center',
    key: 'leader',
  },
  {
    title: '联系电话',
    align: 'center',
    key: 'phone',
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
          <NPopconfirm onPositiveClick={() => deleteDept(row.id)}>
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
  getDeptList()
})
</script>

<template>
  <NSpace vertical class="flex-1">
    <n-card class="flex-1">
      <template #header>
        <NButton type="primary" @click="modalRef.openModal('add')">
          <template #icon>
            <icon-park-outline-add-one />
          </template>
          新建部门
        </NButton>
      </template>
      <template #header-extra>
        <NButton type="primary" secondary @click="getDeptList">
          <template #icon>
            <icon-park-outline-refresh />
          </template>
          刷新
        </NButton>
      </template>
      <n-data-table :row-key="(row: DeptRow) => row.id" :columns="columns" :data="tableData" :loading="loading" />

      <TableModal ref="modalRef" modal-name="部门" @success="getDeptList" />
    </n-card>
  </NSpace>
</template>
