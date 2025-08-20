<template>
  <section class="card">
    <div class="card-head"><h1>1:1 문의 상세</h1></div>

    <div class="card-body">
      <div v-if="pending">불러오는 중…</div>
      <div v-else-if="error">존재하지 않거나 불러올 수 없습니다.</div>
      <div v-else-if="!inquiry">데이터가 없습니다.</div>

      <div v-else class="detail">
        <dl class="meta">
          <div><dt>센터</dt><dd>{{ inquiry.center }}</dd></div>
          <div><dt>유형</dt><dd>{{ inquiry.type }}</dd></div>
          <div><dt>유입</dt><dd>{{ inquiry.source || '-' }}</dd></div>
          <div><dt>등록일</dt><dd>{{ fmtDate(inquiry.createdAt) }}</dd></div>
          <div><dt>답변 여부</dt><dd>{{ inquiry.answered ? '답변완료' : '대기' }}</dd></div>
        </dl>

        <h2 class="title">{{ inquiry.title }}</h2>
        <pre class="content">{{ inquiry.content }}</pre>

        <div v-if="inquiry.files?.length" class="files">
          <h3>첨부파일</h3>
          <ul>
            <li v-for="(f,i) in inquiry.files" :key="i">
              {{ f.name }} ({{ prettySize(f.size) }})
            </li>
          </ul>
        </div>

        <div class="toolbar">
          <NuxtLink class="btn" :to="{ name: 'inquiries-id-edit', params: { id: routeId } }">수정하기</NuxtLink>
          <NuxtLink class="btn" :to="LIST_ROUTE">되돌아가기</NuxtLink>
          <button type="button" class="btn danger" @click="onDelete">삭제하기</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { createError } from 'h3'

type FileMeta = { name:string; size:number; type:string }
type Inquiry = {
  id: number | string
  center: string
  type: string
  source?: string
  title: string
  content: string
  answered: boolean
  createdAt: string
  files?: FileMeta[]
}

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const { public:{ apiBase } } = useRuntimeConfig()

// 목록 경로/키 (프로젝트에 맞게 경로를 '/' 또는 '/inquiries'로 조정)
const LIST_KEY = 'inquiries-list'
const LIST_ROUTE = '/'

const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const routeId = String(raw ?? '').trim()
const apiId   = encodeURIComponent(routeId)
if (!routeId) {
  throw createError({ statusCode: 404, statusMessage: '잘못된 경로입니다.' })
}

const { data, pending, error } = await useAsyncData<Inquiry>(
    `inquiry-detail-${apiId}`,
    () => $fetch('/inquiries/' + apiId, { baseURL: apiBase })
)

const inquiry = computed(() => data.value)

const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit' }) : ''

const prettySize = (bytes:number) => {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb/1024).toFixed(1)} MB`
}

function onDelete() {
  confirm.require({
    header: '삭제 확인',
    message: '정말 삭제하시겠습니까?',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: '취소',
    acceptLabel: '삭제',
    acceptClass: 'p-button-danger',
    async accept() {
      try {
        await $fetch('/inquiries/' + apiId, { baseURL: apiBase, method: 'DELETE' })
        await refreshNuxtData(LIST_KEY)
        toast.add({ severity: 'success', summary: '완료', detail: '삭제되었습니다.', life: 2000 })
        await router.replace(LIST_ROUTE)
      } catch (err:any) {
        toast.add({ severity: 'error', summary: '실패', detail: err?.message || '삭제 실패', life: 3000 })
      }
    }
  })
}
</script>

<style scoped>
.card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; }
.card-head { padding:20px; border-bottom:1px solid #f3f4f6; }
.card-body { padding:20px; }
.meta { display:grid; grid-template-columns: 120px 1fr; gap:8px 16px; margin-bottom:16px; }
.meta dt { color:#6b7280; }
.meta dd { margin:0; }
.title { font-size:18px; font-weight:800; margin:12px 0; }
.content { white-space:pre-wrap; background:#fafafa; border:1px solid #eee; border-radius:8px; padding:12px; }
.files h3 { margin:16px 0 8px; }
.toolbar { display:flex; gap:8px; margin-top:16px; }
.btn { appearance:none; border:1px solid #d1d5db; background:#fff; padding:8px 14px; border-radius:8px; cursor:pointer; font-weight:700; }
.btn.danger { border-color:#dc2626; background:#dc2626; color:#fff; }
.btn.danger:hover { background:#b91c1c; }
</style>
