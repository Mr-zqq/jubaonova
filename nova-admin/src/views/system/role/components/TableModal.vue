<script setup lang="ts">
import { useBoolean } from '@/hooks'
import { fetchAllRoutes, fetchCreateRole, fetchRoleDetail, fetchUpdateRole } from '@/service'
import { arrayToTree } from '@/utils'

interface Props {
  modalName?: string
}

const {
  modalName = '',
} = defineProps<Props>()

const emit = defineEmits<{
  open: []
  close: []
  success: []
}>()

const { bool: modalVisible, setTrue: showModal, setFalse: hiddenModal } = useBoolean(false)
const { bool: submitLoading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

const formDefault = {
  roleName: '',
  roleKey: '',
  status: 1,
  remark: '',
  menuIds: [] as number[],
}
const formModel = ref({ ...formDefault })

type ModalType = 'add' | 'view' | 'edit'
const modalType = shallowRef<ModalType>('add')
const modalTitle = computed(() => {
  const titleMap: Record<ModalType, string> = {
    add: '添加',
    view: '查看',
    edit: '编辑',
  }
  return `${titleMap[modalType.value]}${modalName}`
})

const menuTree = ref<any[]>([])
async function getMenuTree() {
  const { data, isSuccess } = await fetchAllRoutes() as any
  if (isSuccess) {
    // 保留按钮权限节点：编辑回显的 menuIds 包含按钮权限 id，过滤掉会导致保存时丢失
    const rows = Array.isArray(data) ? data : []
    menuTree.value = arrayToTree(rows)
  }
}

async function openModal(type: ModalType = 'add', data: any) {
  emit('open')
  modalType.value = type
  showModal()
  getMenuTree()
  if (type === 'add') {
    formModel.value = { ...formDefault }
    return
  }
  if (!data)
    return
  // 编辑/查看：拉详情（含菜单关联），回显菜单勾选
  const { data: detail, isSuccess } = await fetchRoleDetail(data.id) as any
  const source = isSuccess && detail ? detail : data
  formModel.value = {
    ...formDefault,
    ...source,
    status: source.status === 0 ? 1 : 0,
    menuIds: (source.menus || []).map((m: any) => m.id),
  }
}

function closeModal() {
  hiddenModal()
  endLoading()
  emit('close')
}

defineExpose({
  openModal,
})

const formRef = ref()
async function submitModal() {
  const handlers = {
    async add() {
      const { isSuccess } = await fetchCreateRole({
        ...formModel.value,
        status: formModel.value.status === 1 ? 0 : 1,
      })
      if (isSuccess) {
        window.$message.success('新增成功')
        return true
      }
      return false
    },
    async edit() {
      if (!(formModel.value as any).id)
        return false
      const { isSuccess } = await fetchUpdateRole((formModel.value as any).id, {
        ...formModel.value,
        status: formModel.value.status === 1 ? 0 : 1,
      })
      if (isSuccess) {
        window.$message.success('编辑成功')
        return true
      }
      return false
    },
    async view() {
      return true
    },
  }
  await formRef.value?.validate()
  startLoading()
  const ok = await handlers[modalType.value]()
  endLoading()
  if (ok) {
    closeModal()
    emit('success')
  }
}

const rules = {
  roleName: {
    required: true,
    message: '请输入角色名称',
    trigger: 'blur',
  },
  roleKey: {
    required: true,
    message: '请输入权限字符',
    trigger: 'blur',
  },
}
</script>

<template>
  <n-modal
    v-model:show="modalVisible" :mask-closable="false" preset="card" :title="modalTitle"
    class="w-700px"
    :segmented="{
      content: true,
      action: true,
    }"
  >
    <n-form ref="formRef" :rules="rules" label-placement="left" :model="formModel" :label-width="100" :disabled="modalType === 'view'">
      <n-grid :cols="2" :x-gap="18">
        <n-form-item-grid-item :span="1" label="角色名称" path="roleName">
          <n-input v-model:value="formModel.roleName" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="权限字符" path="roleKey">
          <n-input v-model:value="formModel.roleKey" :disabled="modalType === 'edit'" placeholder="如 admin" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="角色状态" path="status">
          <n-switch
            v-model:value="formModel.status"
            :checked-value="1" :unchecked-value="0"
          >
            <template #checked>
              启用
            </template>
            <template #unchecked>
              禁用
            </template>
          </n-switch>
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="2" label="菜单权限" path="menuIds">
          <n-tree
            v-model:checked-keys="formModel.menuIds"
            block-line
            checkable
            :cascade="false"
            key-field="id"
            label-field="title"
            children-field="children"
            :data="menuTree"
          />
        </n-form-item-grid-item>
      </n-grid>
    </n-form>
    <template #action>
      <n-space justify="center">
        <n-button @click="closeModal">
          取消
        </n-button>
        <n-button type="primary" :loading="submitLoading" @click="submitModal">
          提交
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
