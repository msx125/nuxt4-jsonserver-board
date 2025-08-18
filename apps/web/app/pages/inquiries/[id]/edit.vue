<!-- pages/inquiries/[id]/edit.vue -->
<template>
  <section class="page">
    <h1 class="page-title">1:1 문의 수정</h1>

    <form class="card" @submit.prevent="onSubmit">
      <!-- 분류 -->
      <div class="row">
        <div class="field">
          <label class="label required">문의 센터</label>
          <select v-model="form.center" class="select" required>
            <option value="" disabled>선택</option>
            <option value="자격관리센터">자격관리센터</option>
            <option value="현장실습센터">현장실습센터</option>
            <option value="보수교육센터">보수교육센터</option>
          </select>
        </div>

        <div class="field">
          <label class="label required">문의 유형</label>
          <select v-model="form.type" class="select" required>
            <option value="" disabled>선택</option>
            <option value="일반">일반</option>
            <option value="이의신청">이의신청</option>
            <option value="오류/버그">오류/버그</option>
          </select>
        </div>

        <div class="field">
          <label class="label">유입 선택</label>
          <select v-model="form.source" class="select">
            <option value="" disabled>선택</option>
            <option value="웹">웹</option>
            <option value="모바일">모바일</option>
            <option value="전화">전화</option>
          </select>
        </div>
      </div>

      <!-- 제목 -->
      <div class="row">
        <div class="field grow">
          <label class="label required">제목</label>
          <input v-model.trim="form.title" type="text" class="input" required />
        </div>
      </div>

      <!-- 본문 -->
      <div class="row">
        <div class="field grow">
          <label class="label required">내용</label>
          <textarea v-model.trim="form.content" class="textarea" rows="12" required />
        </div>
      </div>

      <!-- 파일 메타 (선택 즉시 반영) -->
      <div class="row">
        <div class="field grow">
          <label class="label">첨부파일</label>

          <ul class="file-list" v-if="form.files?.length">
            <li v-for="(f,i) in form.files" :key="i" class="file-item">
              <span class="name">{{ f.name }}</span>
              <span class="meta">{{ prettySize(f.size) }}</span>
              <button type="button" class="link" @click="removeFile(i)">삭제</button>
            </li>
          </ul>
          <p v-else class="empty-file">현재 첨부가 없습니다.</p>

          <div class="upload">
            <input ref="fileInput" type="file" class="file" multiple @change="onPickFiles" />
            <button type="button" class="btn" @click="fileInput?.click()">파일 추가</button>
            <button type="button" class="btn" @click="clearFiles">추가 취소</button>
            <span class="meta" style="margin-left:8px;">최대 {{ MAX_FILES }}개</span>
          </div>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="toolbar">
        <NuxtLink class="btn ghost" :to="detailHref">취소</NuxtLink>
        <button type="submit" class="btn primary" :disabled="pending || loading">저장</button>
      </div>
    </form>
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
const { public:{ apiBase } } = useRuntimeConfig()

// 라우팅용 / API용 id 분리
const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
const routeId = String(raw ?? '').trim()
const apiId   = encodeURIComponent(routeId)
if (!routeId) throw createError({ statusCode: 404, statusMessage: '잘못된 경로' })

// 상세 링크 (취소 시 복귀)
const detailHref = computed(() => '/inquiries/' + routeId)

// 기존 데이터 불러오기
const { data, pending: loading } = await useAsyncData<Inquiry | null>(
    'inquiry-detail-' + apiId,
    async () => {
      try {
        return await $fetch('/inquiries/' + apiId, { baseURL: apiBase })
      } catch {
        return null
      }
    }
)

// 제출 중 상태
const pending = ref(false)

// 폼 상태 초기값
const form = reactive<Inquiry>({
  id: routeId, center:'', type:'', source:'', title:'', content:'',
  answered:false, createdAt:'', files:[]
})

// A안: 선택 즉시 반영 + 롤백 스냅샷
const MAX_FILES = 5
const originalFiles = ref<FileMeta[]>([])

watchEffect(() => {
  if (data.value) {
    Object.assign(form, data.value)
    originalFiles.value = JSON.parse(JSON.stringify(form.files || []))
  }
})

const fileInput = ref<HTMLInputElement|null>(null)

// ✅ 파일을 고르는 즉시 form.files에 메타로 합치기
function onPickFiles (e: Event) {
  const target = e.target as HTMLInputElement
  const picked = Array.from(target.files || [])
  const metas: FileMeta[] = picked.map(f => ({ name: f.name, size: f.size, type: f.type }))

  const merged = [...(form.files || []), ...metas].slice(0, MAX_FILES)
  form.files = merged

  // 같은 파일 다시 선택 가능하도록 input 초기화
  if (fileInput.value) fileInput.value.value = ''
}

// 이번 세션 추가분 취소 → 원본으로 롤백
function clearFiles () {
  form.files = JSON.parse(JSON.stringify(originalFiles.value))
  if (fileInput.value) fileInput.value.value = ''
}

function removeFile (i:number) {
  form.files?.splice(i, 1)
}

// 표시용
const prettySize = (bytes:number) => {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb/1024).toFixed(1)} MB`
}

// 저장 (이미 form.files에 반영되어 있으므로 그대로 PATCH)
async function onSubmit () {
  if (!form.center || !form.type || !form.title || !form.content) {
    alert('필수항목을 입력해 주세요.')
    return
  }
  if (pending.value) return
  pending.value = true

  try {
    await $fetch('/inquiries/' + apiId, {
      baseURL: apiBase,
      method: 'PATCH',
      body: {
        center: form.center,
        type: form.type,
        source: form.source,
        title: form.title,
        content: form.content,
        answered: form.answered,
        files: form.files
      }
    })

    await Promise.all([
      refreshNuxtData('inquiries-list'),
      refreshNuxtData('inquiry-detail-' + apiId)
    ])

    await router.replace(detailHref.value)
  } catch (err:any) {
    alert('저장 실패: ' + (err?.message || err))
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.page { padding:16px 0 32px; }
.page-title { font-size:20px; font-weight:800; margin:0 0 14px; }
.card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:18px; }
.row { display:flex; gap:16px; margin-bottom:14px; flex-wrap:wrap; }
.field { display:flex; flex-direction:column; min-width:220px; }
.field.grow { flex:1 1 480px; }
.label { font-size:13px; color:#374151; margin-bottom:6px; }
.label.required::after { content:" *"; color:#ef4444; }
.input,.select,.textarea { width:100%; border:1px solid #d1d5db; border-radius:8px; padding:10px 12px; font-size:14px; }
.textarea { resize:vertical; }
.toolbar { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
.btn { appearance:none; border:1px solid #d1d5db; background:#fff; padding:10px 16px; border-radius:8px; cursor:pointer; font-weight:700; }
.btn.primary { border-color:#2955d1; background:#2955d1; color:#fff; }
.file-list { list-style:none; padding:0; margin:0; }
.file-item { display:flex; gap:10px; align-items:center; padding:8px 0; border-bottom:1px solid #f3f4f6; }
.file-item:last-child { border-bottom:0; }
.file-item .name { flex:1 1 auto; }
.file-item .meta { font-size:12px; color:#6b7280; }
.upload { display:flex; gap:8px; align-items:center; margin-top:8px; }
.file { display:none; }
.empty-file { font-size:13px; color:#9ca3af; }
</style>
