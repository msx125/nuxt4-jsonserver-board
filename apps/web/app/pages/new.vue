<!-- pages/inquiries/new.vue -->
<template>
  <section class="page">
    <h1 class="page-title">1:1 문의 등록</h1>

    <form class="card" @submit.prevent="onSubmit">
      <!-- 행 1: 분류 -->
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
          <input v-model.trim="form.title" type="text" class="input" placeholder="제목을 입력하세요" required />
        </div>
      </div>

      <!-- 본문 -->
      <div class="row">
        <div class="field grow">
          <label class="label required">내용</label>
          <textarea
              v-model.trim="form.content"
              class="textarea"
              rows="12"
              placeholder="문의 내용을 입력하세요 (개인정보 포함 금지)"
              required
          />
          <p class="hint">※ 주민번호, 휴대폰 번호, 주소 등 개인정보는 입력하지 마세요.</p>
        </div>
      </div>

      <!-- 첨부파일 -->
      <div class="row">
        <div class="field grow">
          <label class="label">파일첨부 (최대 5개)</label>
          <div class="upload">
            <input
                ref="fileInput"
                type="file"
                class="file"
                multiple
                @change="onPickFiles"
            />
            <button type="button" class="btn" @click="fileInput?.click()">파일 찾기</button>
            <button type="button" class="btn" @click="clearFiles" :disabled="files.length === 0">모두 삭제</button>
          </div>

          <ul v-if="files.length" class="file-list">
            <li v-for="(f, i) in files" :key="i" class="file-item">
              <span class="name">{{ f.name }}</span>
              <span class="meta">{{ prettySize(f.size) }}</span>
              <button type="button" class="link" @click="removeFile(i)">삭제</button>
            </li>
          </ul>
          <p v-else class="empty-file">이곳에 파일을 드래그 앤 드롭하세요.</p>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="toolbar">
        <button type="button" class="btn ghost" @click="onCancel">취소</button>
        <button type="submit" class="btn primary" :disabled="pending">제출</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
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
const router = useRouter()
const { public: { apiBase } } = useRuntimeConfig()
// 뭐였지?
const LIST_KEY = 'inquiries-list'
// 목록 라우트 경로
const LIST_ROUTE = '/'
const form = reactive<InquiryCreate>({
  center: '',
  type: '',
  source: '',
  title: '',
  content: '',
  answered: false,
  createdAt: '',   // 제출 시 실제 시간으로 채움
  files: []
})
const files = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const pending = ref(false)
const MAX_FILES = 5
function onPickFiles (e: Event) {
  const target = e.target as HTMLInputElement
  const picked = Array.from(target.files || [])
  const merged = [...files.value, ...picked].slice(0, MAX_FILES)
  files.value = merged
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
  // 1) 간단 검증
  if (!form.center || !form.type || !form.title || !form.content) {
    alert('필수항목을 입력해 주세요.')
    return
  }
  // 2) 중복 클릭 방지
  if (pending.value) return
  pending.value = true
  try {
    // 3) 파일은 메타데이터만 저장(json-server는 실제 업로드 불가)
    form.files = files.value.map(f => ({ name: f.name, size: f.size, type: f.type }))
    // 4) 등록 시각은 제출 시점으로 세팅
    form.createdAt = new Date().toISOString()
    // 5) db.json에 저장 (id 자동 부여)
    const saved = await $fetch(`/inquiries`, {
      baseURL: apiBase,
      method: 'POST',
      body: form
    })
    // console.log(saved) // { id: 1, center:..., ... }
    // 6) 목록 캐시 무효화 → 다음 진입 시 최신 데이터 보이게
    await refreshNuxtData(LIST_KEY)
    // 7) 목록으로 이동
    await router.replace(LIST_ROUTE)
  } catch (err: any) {
    alert('저장에 실패했습니다: ' + (err?.message || err))
  } finally {
    pending.value = false
  }
}
function onCancel () {
  router.back() // 또는 router.replace(LIST_ROUTE)
}
</script>


<style scoped>
.page { padding: 16px 0 32px; }
.page-title { font-size: 20px; font-weight: 800; margin: 0 0 14px; }
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px;
}
.row { display: flex; gap: 16px; margin-bottom: 14px; flex-wrap: wrap; }
.field { display: flex; flex-direction: column; min-width: 220px; }
.field.grow { flex: 1 1 480px; }
.label { font-size: 13px; color: #374151; margin-bottom: 6px; }
.label.required::after { content: " *"; color: #ef4444; }
.input, .select, .textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
}
.input:focus, .select:focus, .textarea:focus { border-color: #2955d1; box-shadow: 0 0 0 3px rgba(41,85,209,0.12); }
.textarea { resize: vertical; }
.hint { margin-top: 6px; font-size: 12px; color: #6b7280; }
.upload { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.file { display: none; }
.file-list { list-style: none; padding: 0; margin: 0; }
.file-item { display: flex; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.file-item:last-child { border-bottom: 0; }
.file-item .name { flex: 1 1 auto; }
.file-item .meta { font-size: 12px; color: #6b7280; }
.empty-file { font-size: 13px; color: #9ca3af; }
.toolbar { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.btn {
  appearance: none;
  border: 1px solid #d1d5db;
  background: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}
.btn:hover { background: #f9fafb; }
.btn.primary { border-color: #2955d1; background: #2955d1; color: #fff; }
.btn.primary:disabled { opacity: .6; cursor: default; }
.btn.ghost { background: #fff; }
.btn .link, .link { background: none; border: 0; color: #2955d1; cursor: pointer; }
@media (max-width: 640px) {
  .field { min-width: 100%; }
}
</style>