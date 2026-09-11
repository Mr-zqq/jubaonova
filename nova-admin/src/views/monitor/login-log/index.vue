<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import { useBoolean } from '@/hooks'
import { fetchCleanLoginLog, fetchDeleteLoginLog, fetchLoginLogPage } from '@/service'
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui'

interface LoginLogRow {
  id: number | string
  username: string
  ipaddr?: string
  loginLocation?: string
  browser?: string
  os?: string
  status: number
  msg?: string
  loginTime?: string
}

const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

const searchModel = ref({
  username: '',
  status: undefined as undefined | 0 | 1,
})

const statusOptions = [
  { label: '成功', value: 0 },
  { label: '失败', value: 1 },
]

const listData = ref<LoginLogRow[]>([])
const count = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const checkedRowKeys = ref<Array<number | string>>([])

async function getLogList() {
  startLoading()
  const { data, isSuccess } = await fetchLoginLogPage({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    username: searchModel.value.username || undefined,
    status: searchModel.value.status,
  }) as any
  if (isSuccess) {
    listData.value = data.list || []
    count.value = data.total || 0
  }
  endLoading()
}

function handleResetSearch() {
  searchModel.value = { username: '', status: undefined }
  pageNum.value = 1
  getLogList()
}

function changePage(page: number, size: number) {
  pageNum.value = page
  pageSize.value = size
  getLogList()
}

async function deleteBatch() {
  if (checkedRowKeys.value.length === 0) {
    window.$message.warning('请先勾选要删除的日志')
    return
  }
  const { isSuccess } = await fetchDeleteLoginLog(checkedRowKeys.value.join(','))
  if (isSuccess) {
    window.$message.success('删除成功')
    checkedRowKeys.value = []
    getLogList()
  }
}

async function cleanAll() {
  const { isSuccess } = await fetchCleanLoginLog()
  if (isSuccess) {
    window.$message.success('已清空')
    checkedRowKeys.value = []
    getLogList()
  }
}

const columns: DataTableColumns<LoginLogRow> = [
  {
    type: 'selection',
    width: 40,
  },
  {
    title: '用户名',
    key: 'username',
    width: 120,
  },
  {
    title: '登录IP',
    key: 'ipaddr',
    width: 140,
  },
  {
    title: '登录地点',
    key: 'loginLocation',
    width: 100,
  },
  {
    title: '浏览器',
    key: 'browser',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '操作系统',
    key: 'os',
    width: 120,
  },
  {
    title: '状态',
    align: 'center',
    key: 'status',
    width: 90,
    render: (row) => {
      return row.status === 0
        ? (<NTag type="success">成功</NTag>)
        : (<NTag type="error">失败</NTag>)
    },
  },
  {
    title: '提示信息',
    key: 'msg',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: '登录时间',
    key: 'loginTime',
    width: 180,
  },
]

onMounted(() => {
  getLogList()
})
</script>

<template>
  <NSpace vertical class="flex-1">
    <n-card>
      <n-form :model="searchModel" label-placement="left" inline :show-feedback="false">
        <n-flex>
          <n-form-item label="用户名" path="username">
            <n-input v-model:value="searchModel.username" placeholder="请输入" clearable />
          </n-form-item>
          <n-form-item label="状态" path="status">
            <n-select
              v-model:value="searchModel.status"
              :options="statusOptions"
              placeholder="全部"
              clearable
              class="w-160px"
            />
          </n-form-item>
          <n-flex class="ml-auto">
            <NButton type="primary" @click="getLogList">
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
        <n-flex>
          <NPopconfirm @positive-click="deleteBatch">
            <template #trigger>
              <NButton type="error" secondary>
                <template #icon>
                  <icon-park-outline-delete-five />
                </template>
                批量删除
              </NButton>
            </template>
            确认删除选中的日志？
          </NPopconfirm>
          <NPopconfirm @positive-click="cleanAll">
            <template #trigger>
              <NButton type="warning" secondary>
                <template #icon>
                  <icon-park-outline-clear />
                </template>
                清空日志
              </NButton>
            </template>
            确认清空全部登录日志？此操作不可恢复。
          </NPopconfirm>
        </n-flex>
      </template>
      <template #header-extra>
        <NButton type="primary" secondary @click="getLogList">
          <template #icon>
            <icon-park-outline-refresh />
          </template>
          刷新
        </NButton>
      </template>
      <NSpace vertical>
        <n-data-table
          v-model:checked-row-keys="checkedRowKeys"
          :row-key="(row: LoginLogRow) => row.id"
          :columns="columns"
          :data="listData"
          :loading="loading"
        />
        <Pagination :count="count" @change="changePage" />
      </NSpace>
    </n-card>
  </NSpace>
</template>
