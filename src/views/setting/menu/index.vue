<script setup lang="tsx">
import type { DataTableColumns } from 'naive-ui'
import { useBoolean } from '@/hooks'
import { fetchAllRoutes } from '@/service'
import { arrayToTree, createIcon } from '@/utils'
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { renderProCopyableText } from 'pro-naive-ui'
import TableModal from './components/TableModal.vue'

const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

const { t } = useI18n()
function deleteData(id: number) {
  window.$message.success(t('menu.deleteToast', { id }))
}
const tableModalRef: any = ref<InstanceType<typeof TableModal>>()
const columns = computed<DataTableColumns<AppRoute.RowRoute>>(() => [
  {
    type: 'selection',
    width: 30,
  },
  {
    title: t('menu.name'),
    key: 'name',
    width: 200,
  },
  {
    title: t('menu.icon'),
    align: 'center',
    key: 'icon',
    width: '6em',
    render: (row) => {
      return row.icon && createIcon(row.icon, { size: 20 })
    },
  },
  {
    title: t('menu.title'),
    align: 'center',
    key: 'title',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: t('menu.path'),
    key: 'path',
    render: row => renderProCopyableText(row.path),
  },
  {
    title: t('menu.componentPath'),
    key: 'componentPath',
    ellipsis: {
      tooltip: true,
    },
    render: (row) => {
      return row.componentPath || '-'
    },
  },
  {
    title: t('menu.order'),
    key: 'order',
    align: 'center',
    width: '6em',
  },
  {
    title: t('menu.menuType'),
    align: 'center',
    key: 'menuType',
    width: '6em',
    render: (row) => {
      const menuType = row.menuType || 'page'
      const menuTagType: Record<string, NaiveUI.ThemeColor> = {
        dir: 'primary',
        page: 'warning',
      }
      const menuTypeText: Record<string, string> = { dir: t('menu.menuTypeDir'), page: t('menu.menuTypePage'), permission: t('menu.menuTypePermission') }; return <NTag type={menuTagType[menuType]}>{menuTypeText[menuType] || menuType}</NTag>
    },
  },
  {
    title: t('menu.actions'),
    align: 'center',
    key: 'actions',
    width: '15em',
    render: (row) => {
      return (
        <NSpace justify="center">
          <NButton
            size="small"
            onClick={() => tableModalRef.value.openModal('view', row)}
          >
            {t('menu.view')}
          </NButton>
          <NButton
            size="small"
            onClick={() => tableModalRef.value.openModal('edit', row)}
          >
            {t('menu.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => deleteData(row.id)}>
            {{
              default: () => t('menu.confirmDelete'),
              trigger: () => <NButton size="small" type="error">{t('menu.delete')}</NButton>,
            }}
          </NPopconfirm>
        </NSpace>
      )
    },
  },
])

const tableData = ref<AppRoute.RowRoute[]>([])

onMounted(() => {
  getAllRoutes()
})
async function getAllRoutes() {
  startLoading()
  const { data } = await fetchAllRoutes()
  tableData.value = arrayToTree(data)
  endLoading()
}

const checkedRowKeys = ref<number[]>([])
async function handlePositiveClick() {
  window.$message.success(t('menu.batchDeleteToast', { ids: checkedRowKeys.value.join(',') }))
}
</script>

<template>
  <n-card>
    <template #header>
      <NButton type="primary" @click="tableModalRef.openModal('add')">
        <template #icon>
          <icon-park-outline-add-one />
        </template>
        {{ $t('menu.add') }}
      </NButton>
    </template>

    <template #header-extra>
      <n-flex>
        <NButton type="primary" secondary @click="getAllRoutes">
          <template #icon>
            <icon-park-outline-refresh />
          </template>
          {{ $t('menu.refresh') }}
        </NButton>
        <NPopconfirm
          @positive-click="handlePositiveClick"
        >
          <template #trigger>
            <NButton type="error" secondary>
              <template #icon>
                <icon-park-outline-delete-five />
              </template>
              {{ $t('menu.batchDelete') }}
            </NButton>
          </template>
          {{ $t('menu.confirmBatchDelete') }}
        </NPopconfirm>
      </n-flex>
    </template>
    <n-data-table
      v-model:checked-row-keys="checkedRowKeys"
      :row-key="(row:AppRoute.RowRoute) => row.id" :columns="columns" :data="tableData"
      :loading="loading"
      size="small"
      :scroll-x="1200"
    />
    <TableModal ref="tableModalRef" :all-routes="tableData" :modal-name="$t('menu.modalName')" />
  </n-card>
</template>
