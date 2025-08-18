<!-- html 작성 -->
<template>
  <section class="card">
    <div class="card-head">
      <h1>1:1 문의 내역</h1>

      <!-- 탭: 간단 집계(선택) -->
      <div class="tabs">
        <button class="tab active">자격관련 ({{ counts['자격관련'] || 0 }})</button>
        <button class="tab">영역자격 ({{ counts['영역자격'] || 0 }})</button>
        <button class="tab">현장실습 ({{ counts['현장실습'] || 0 }})</button>
        <button class="tab">보수교육 ({{ counts['보수교육'] || 0 }})</button>
        <button class="tab">기타 ({{ counts['기타'] || 0 }})</button>
      </div>
    </div>

    <div class="card-body">
      <div class="table-wrap">
        <table class="table">
          <colgroup>
            <col style="width: 80px" />
            <col />
            <col style="width: 120px" />
            <col style="width: 140px" />
            <col style="width: 100px" />
          </colgroup>
          <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>답변 여부</th>
            <th>등록일</th>
            <th>첨부파일</th>
          </tr>
          </thead>
          <tbody>
          <!-- 로딩/에러/빈 상태 -->
          <tr v-if="pending"><td colspan="5">불러오는 중…</td></tr>
          <tr v-else-if="error"><td colspan="5">목록을 불러오지 못했습니다.</td></tr>
          <tr v-else-if="!inquiries?.length" class="empty">
            <td colspan="5">등록된 문의가 없습니다.</td>
          </tr>

          <!-- 데이터 렌더 -->
          <tr v-else v-for="row in inquiries" :key="row.id">
            <td>{{ row.id }}</td>
            <td>
              <NuxtLink :to="`/inquiries/${row.id}`">
                {{ row.title }}
              </NuxtLink>
            </td>
            <td>{{ row.answered ? '답변완료' : '대기' }}</td>
            <td>{{ fmtDate(row.createdAt) }}</td>
            <td class="attach-cell">
              <span v-if="row.files?.length">📎</span>
              <span v-else>&nbsp;</span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="toolbar">
        <button class="btn" @click="refresh">새로고침</button>
        <button class="btn primary" @click="writeNew">1:1 문의 작성</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type FileMeta = { name: string; size: number; type: string }
type Inquiry = {
  id: number
  center: string
  type: string
  source: string
  title: string
  content: string
  files?: FileMeta[]
  answered: boolean
  createdAt: string
  // (선택) 탭 카테고리 필드가 있다면 여기에 추가하세요: category?: string
}

const { public: { apiBase } } = useRuntimeConfig()

// 목록 로드 (최신 id 순)
const { data, pending, error, refresh } = await useAsyncData<Inquiry[]>(
    'inquiries-list',
    () => $fetch('/inquiries', {
      baseURL: apiBase,
      query: { _sort: 'id', _order: 'desc' }
    })
)

const inquiries = computed(() => data.value ?? [])
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : '')

const writeNew = () => navigateTo('/new')

// (선택) 탭 카운트용 간단 집계
const counts = computed<Record<string, number>>(() => {
  const c: Record<string, number> = {}
  for (const row of inquiries.value) {
    // 분류 기준을 정하세요: row.category 가 있다면 그걸 사용
    // 없으면 임시로 문의 유형(type)으로 집계
    const key = (row as any).category || row.type || '기타'
    c[key] = (c[key] || 0) + 1
  }
  return c
})
</script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.card-head { padding: 20px 20px 8px; border-bottom: 1px solid #f3f4f6; }
.card-head h1 { margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #111827; }

.tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.tab { border: 1px solid #e5e7eb; background: #fff; padding: 6px 10px; border-radius: 8px; font-size: 13px; color: #374151; }
.tab.active { background: #2955d1; border-color: #2955d1; color: #fff; }

.card-body { padding: 20px; }
.table-wrap { overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 10px; }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table thead th { background: #f9fafb; color: #374151; text-align: left; padding: 12px 14px; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
.table tbody td { padding: 14px; border-bottom: 1px solid #f3f4f6; color: #111827; }
.table tbody tr:last-child td { border-bottom: 0; }
.table .empty td { text-align: center; color: #6b7280; }
.attach-cell { text-align: center; }

.toolbar { margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px; }

.btn { appearance: none; border: 1px solid #d1d5db; background: #fff; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn.primary { border-color: #2955d1; background: #2955d1; color: #fff; }

@media (max-width: 480px) { .card-head h1 { font-size: 18px; } }
</style>
