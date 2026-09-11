<script setup lang="ts">
import { useBoolean } from '@/hooks'
import { fetchServerStatus } from '@/service'

const { bool: loading, setTrue: startLoading, setFalse: endLoading } = useBoolean(false)

const serverInfo = ref<any>({})

async function getServerStatus() {
  startLoading()
  const { data, isSuccess } = await fetchServerStatus() as any
  if (isSuccess)
    serverInfo.value = data || {}
  endLoading()
}

onMounted(() => {
  getServerStatus()
})
</script>

<template>
  <NSpace vertical class="flex-1">
    <n-card>
      <template #header>
        服务状态
      </template>
      <template #header-extra>
        <n-button type="primary" secondary :loading="loading" @click="getServerStatus">
          <template #icon>
            <icon-park-outline-refresh />
          </template>
          刷新
        </n-button>
      </template>
      <n-grid :x-gap="16" :y-gap="16" :cols="2" item-responsive responsive="screen">
        <n-gi span="2 m:1">
          <n-card title="主机信息" embedded>
            <n-descriptions label-placement="left" :column="1" bordered size="small">
              <n-descriptions-item label="主机名">
                {{ serverInfo.hostname || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="操作系统">
                {{ serverInfo.os?.type || serverInfo.os?.platform || '-' }}
                {{ serverInfo.os?.release || '' }}
                {{ serverInfo.os?.arch || '' }}
              </n-descriptions-item>
              <n-descriptions-item label="系统运行时长">
                {{ serverInfo.os?.uptime || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="系统负载">
                {{ serverInfo.os?.load || '未知（Windows 平台无此指标）' }}
              </n-descriptions-item>
            </n-descriptions>
          </n-card>
        </n-gi>
        <n-gi span="2 m:1">
          <n-card title="进程信息" embedded>
            <n-descriptions label-placement="left" :column="1" bordered size="small">
              <n-descriptions-item label="进程 ID">
                {{ serverInfo.process?.pid || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="Node 版本">
                {{ serverInfo.process?.nodeVersion || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="进程运行时长">
                {{ serverInfo.process?.uptime || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="主要 IPv4">
                {{ serverInfo.network?.primaryIPv4 || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="网卡数量">
                {{ serverInfo.network?.interfaceCount || '-' }}
              </n-descriptions-item>
            </n-descriptions>
          </n-card>
        </n-gi>
        <n-gi span="2 m:1">
          <n-card title="CPU" embedded>
            <n-descriptions label-placement="left" :column="1" bordered size="small">
              <n-descriptions-item label="型号">
                {{ serverInfo.cpu?.model || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="核心数">
                {{ serverInfo.cpu?.cores || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="主频">
                {{ serverInfo.cpu?.speed || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="用户使用率">
                {{ serverInfo.cpu?.userUsage ?? '-' }}%
              </n-descriptions-item>
              <n-descriptions-item label="系统使用率">
                {{ serverInfo.cpu?.systemUsage ?? '-' }}%
              </n-descriptions-item>
              <n-descriptions-item label="空闲率">
                {{ serverInfo.cpu?.idle ?? '-' }}%
              </n-descriptions-item>
            </n-descriptions>
          </n-card>
        </n-gi>
        <n-gi span="2 m:1">
          <n-card title="内存" embedded>
            <n-space vertical :size="12">
              <n-progress
                type="line"
                :percentage="Number(serverInfo.memory?.usedPercent) || 0"
                :height="18"
                border-radius="4"
              />
              <n-descriptions label-placement="left" :column="1" bordered size="small">
                <n-descriptions-item label="总内存">
                  {{ serverInfo.memory?.total || '-' }}
                </n-descriptions-item>
                <n-descriptions-item label="已用内存">
                  {{ serverInfo.memory?.used || '-' }}
                </n-descriptions-item>
                <n-descriptions-item label="空闲内存">
                  {{ serverInfo.memory?.free || '-' }}
                </n-descriptions-item>
              </n-descriptions>
            </n-space>
          </n-card>
        </n-gi>
      </n-grid>
    </n-card>
  </NSpace>
</template>
