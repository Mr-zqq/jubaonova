<script setup lang="ts">
import { useBoolean } from '@/hooks'
import { fetchCreateDept, fetchDeptOptions, fetchUpdateDept } from '@/service'

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
  deptName: '',
  parentId: 0,
  sort: 0,
  leader: '',
  phone: '',
  email: '',
  status: 1,
  remark: '',
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

const parentOptions = ref<any[]>([{ label: '顶级部门', value: 0 }])
async function getParentOptions() {
  const { data, isSuccess } = await fetchDeptOptions() as any
  if (isSuccess && Array.isArray(data))
    parentOptions.value = [{ label: '顶级部门', value: 0 }, ...data]
}

async function openModal(type: ModalType = 'add', data: any) {
  emit('open')
  modalType.value = type
  showModal()
  getParentOptions()
  if (type === 'add') {
    formModel.value = {
      ...formDefault,
      parentId: data && typeof data.id === 'number' ? data.id : 0,
    }
    return
  }
  if (!data)
    return
  formModel.value = {
    ...formDefault,
    ...data,
    status: data.status === 0 ? 1 : 0,
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
      const { isSuccess } = await fetchCreateDept({
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
      const { isSuccess } = await fetchUpdateDept((formModel.value as any).id, {
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
  deptName: {
    required: true,
    message: '请输入部门名称',
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
        <n-form-item-grid-item :span="1" label="部门名称" path="deptName">
          <n-input v-model:value="formModel.deptName" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="上级部门" path="parentId">
          <n-tree-select
            v-model:value="formModel.parentId"
            key-field="value"
            label-field="label"
            :options="parentOptions"
            clearable
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="显示顺序" path="sort">
          <n-input-number v-model:value="formModel.sort" :min="0" class="w-full" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="负责人" path="leader">
          <n-input v-model:value="formModel.leader" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="联系电话" path="phone">
          <n-input v-model:value="formModel.phone" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="邮箱" path="email">
          <n-input v-model:value="formModel.email" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="部门状态" path="status">
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
