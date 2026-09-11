<script setup lang="ts">
import { useBoolean } from '@/hooks'
import { fetchCreateUser, fetchRoleList, fetchUpdateUser } from '@/service'

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

const formDefault: Entity.User & { password?: string } = {
  userName: '',
  email: '',
  tel: '',
  role: [],
  status: 1,
  password: '123456',
}
const formModel = ref<Entity.User & { password?: string }>({ ...formDefault })

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

async function openModal(type: ModalType = 'add', data: any) {
  emit('open')
  modalType.value = type
  showModal()
  getRoleList()
  const handlers = {
    async add() {
      formModel.value = { ...formDefault }
    },
    async view() {
      if (!data)
        return
      formModel.value = { ...data }
    },
    async edit() {
      if (!data)
        return
      formModel.value = { ...data }
    },
  }
  await handlers[type]()
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
      const { isSuccess } = await fetchCreateUser(formModel.value)
      if (isSuccess) {
        window.$message.success('新增成功')
        return true
      }
      return false
    },
    async edit() {
      if (!formModel.value.id)
        return false
      const { isSuccess } = await fetchUpdateUser(formModel.value.id, formModel.value)
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
  userName: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur',
  },
}

const options = ref()
async function getRoleList() {
  const { data } = await fetchRoleList()
  options.value = data
}
</script>

<template>
  <n-modal
    v-model:show="modalVisible"
    :mask-closable="false"
    preset="card"
    :title="modalTitle"
    class="w-700px"
    :segmented="{
      content: true,
      action: true,
    }"
  >
    <n-form ref="formRef" :rules="rules" label-placement="left" :model="formModel" :label-width="100" :disabled="modalType === 'view'">
      <n-grid :cols="2" :x-gap="18">
        <n-form-item-grid-item :span="1" label="用户名" path="userName">
          <n-input v-model:value="formModel.userName" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="性别" path="gender">
          <n-radio-group v-model:value="formModel.gender">
            <n-space>
              <n-radio :value="1">
                男
              </n-radio>
              <n-radio :value="0">
                女
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="邮箱" path="email">
          <n-input v-model:value="formModel.email" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="联系方式" path="tel">
          <n-input v-model:value="formModel.tel" />
        </n-form-item-grid-item>
        <n-form-item-grid-item v-if="modalType === 'add'" :span="1" label="密码" path="password">
          <n-input v-model:value="formModel.password" type="password" show-password-on="click" placeholder="默认 123456" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="2" label="角色" path="role">
          <n-select
            v-model:value="formModel.role" multiple filterable
            label-field="label"
            value-field="value"
            :options="options"
          />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="2" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" />
        </n-form-item-grid-item>
        <n-form-item-grid-item :span="1" label="用户状态" path="status">
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
