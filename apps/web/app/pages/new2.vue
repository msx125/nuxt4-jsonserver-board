<template>
  <section class="page">
    <h1 class="page-title">1:1 문의 등록</h1>

    <form class="card" @submit.prevent="onSubmit">
      <div class="row">
        <div class="field">
          <label class="label required">문의 센터</label>
          <select v-model="form.center" class="select" required>
            <option value="" disabled>선택</option>
            <option value="아이디벨 센터">아이디벨 센터</option>
            <option value="하남시 센터">하남시 센터</option>
            <option value="보수교육센터">강변 SK V1 센터</option>
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

      <div class="row">
        <div class="field grow">
          <label class="label required">제목</label>
          <!-- .trim 양쪽 공백 자르기 -->
          <input v-model.trim="form.title" type="text" class="input" placeholder="제목을 입력하세요" required />
        </div>
      </div>

      <div class="row">
        <div class="field grow">
          <label class="label required">내용</label>
          <textarea v-model.trim="form.content" class="textarea" rows="12" placeholder="문의 내용을 입력하세요 (개인정보 포함 금지)" required />
          <p class="hint">※ 주민번호, 휴대폰 번호, 주소 등 개인정보는 입력하지 마세요.</p>
        </div>
      </div>

      <div class="row">
        <div class="field grow">
          <label class="label">파일첨부 (최대 {{ MAX_FILES }}개)</label>
          <div class="upload">
            <input ref="fileInput" type="file" class="file" multiple @change="onPickFiles" />
            <button type="button" class="btn" @click="fileInput?.click()">파일 찾기</button>
            <button type="button" class="btn" @click="clearFiles" :disabled="files.length === 0">모두 삭제</button>
          </div>

          <ul v-if="files.length" class="file-list">
            <li v-for="(f,i) in files" :key="i" class="file-item">
              <span class="name">{{ f.name }}</span>
              <span class="meta">{{ prettySize(f.size) }}</span>
              <button type="button" class="link" @click="removeFile(i)">삭제</button>
            </li>
          </ul>
          <p v-else class="empty-file">이곳에 파일을 드래그 앤 드롭하세요.</p>
        </div>
      </div>

      <div class="toolbar">
        <button type="button" class="btn ghost" @click="onCancel">취소</button>
        <button type="submit" class="btn primary" :disabled="pending">제출</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

// DB 정의
type InquiryCreate = {
  center: string
  type: string
  source: string
  title: string
  content: string
  answered: boolean
  createdAt: string
  files: Array<{ name: string; size: number; type: string }>
}

// 페이지 라우팅(이동) 훅
const router = useRouter()

// 알럿 및 모달 훅 - 이거 전부 다 사용되니까 컴포넌트로 빼야하나?
const confirm = useConfirm()
const toast = useToast()

// 하드코딩 안하고 nuxt.config.ts에 기재
const { public: { apiBase } } = useRuntimeConfig()

// 하드코딩된 문자열 최대한 모아두기... -> 나중에 별도 폴더로 빼기. 공식문서 디렉토리 구조에 명시된 권장 내용은 없음
const LIST_KEY = 'inquiries-list'
const LIST_ROUTE = '/'

// 데이터 담아둘 객체 & 객체를 반응형으로 추적 & 데이터 타입 지정
// template 태그 내 v-model 로 연결할 것
const form = reactive<InquiryCreate>({
  center: '',
  type: '',
  source: '',
  title: '',
  content: '',
  answered: false,
  createdAt: '',
  files: []
})


// TypeScript 로 파일만 배열로 받아서 반응형으로 추적
const files = ref<File[]>([])

// <input type="file"> DOM 요소 수정
const fileInput = ref<HTMLInputElement | null>(null)

// 임의로 만든 상태 대기
const pending = ref(false)

// 변수 나중에 어떻게 모을지 고민하기
const MAX_FILES = 5

function onPickFiles (e: Event) {
  const target = e.target as HTMLInputElement
  const picked = Array.from(target.files || [])
  const merged = [...files.value, ...picked].slice(0, MAX_FILES)
  files.value = merged
  if (fileInput.value) fileInput.value.value = ''
}

function removeFile (i: number) {
  files.value.splice(i, 1)
}

function clearFiles () {
  files.value = []
  if (fileInput.value) fileInput.value.value = ''
}

function prettySize (bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

async function onSubmit () {
  if (!form.center || !form.type || !form.title || !form.content) {
    toast.add({ severity: 'warn', summary: '확인', detail: '필수 항목을 입력해주세요.', life: 2000 })
    return
  }
  if (pending.value) return
  pending.value = true
  try {
    form.files = files.value.map(f => ({ name: f.name, size: f.size, type: f.type }))
    form.createdAt = new Date().toISOString()

    const saved = await $fetch(`/inquiries`, { baseURL: apiBase, method: 'POST', body: form })
    // saved.id 등 필요시 사용

    await refreshNuxtData(LIST_KEY)
    toast.add({ severity: 'success', summary: '저장 완료', detail: '정상적으로 등록되었습니다.', life: 1800 })
    await router.replace(LIST_ROUTE)
  } catch (err:any) {
    toast.add({ severity: 'error', summary: '실패', detail: err?.message || '저장에 실패했습니다.', life: 3000 })
  } finally {
    pending.value = false
  }
}

function onCancel () {
  confirm.require({
    header: '작성 취소',
    message: '작성 중인 내용이 사라집니다. 취소하시겠습니까?',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: '계속 작성',
    acceptLabel: '취소하기',
    acceptClass: 'p-button-danger',
    async accept() {
      await router.replace('/')
    }
  })
}

</script>

<style scoped>
.page { padding: 16px 0 32px; }
.page-title { font-size: 20px; font-weight: 800; margin: 0 0 14px; }
.card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:18px; }
.row { display:flex; gap:16px; margin-bottom:14px; flex-wrap:wrap; }
.field { display:flex; flex-direction:column; min-width:220px; }
.field.grow { flex:1 1 480px; }
.label { font-size:13px; color:#374151; margin-bottom:6px; }
.label.required::after { content:" *"; color:#ef4444; }
.input, .select, .textarea { width:100%; border:1px solid #d1d5db; border-radius:8px; padding:10px 12px; font-size:14px; outline:none; }
.input:focus, .select:focus, .textarea:focus { border-color:#2955d1; box-shadow:0 0 0 3px rgba(41,85,209,0.12); }
.textarea { resize:vertical; }
.hint { margin-top:6px; font-size:12px; color:#6b7280; }
.upload { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.file { display:none; }
.file-list { list-style:none; padding:0; margin:0; }
.file-item { display:flex; gap:10px; align-items:center; padding:8px 0; border-bottom:1px solid #f3f4f6; }
.file-item:last-child { border-bottom:0; }
.file-item .name { flex:1 1 auto; }
.file-item .meta { font-size:12px; color:#6b7280; }
.empty-file { font-size:13px; color:#9ca3af; }
.toolbar { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
.btn { appearance:none; border:1px solid #d1d5db; background:#fff; padding:10px 16px; border-radius:8px; cursor:pointer; font-weight:700; }
.btn.primary { border-color:#2955d1; background:#2955d1; color:#fff; }
.btn.primary:disabled { opacity:.6; cursor:default; }
.btn.ghost { background:#fff; }
.link { background:none; border:0; color:#2955d1; cursor:pointer; }
@media (max-width: 640px) { .field { min-width:100%; } }
</style>
