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

      <div class="table-tools">
        <div class="searchbar">
          <select v-model="searchField" class="select">
            <option value="title">제목</option>
          </select>
          <input
              v-model.trim="keyword"
              type="text"
              placeholder="검색어를 입력하세요"
              @keydown.enter.prevent="page = 1"
              class="input"
          />
          <button class="btn" @click="page = 1">검색</button>
          <button class="btn" v-if="keyword" @click="keyword = ''">초기화</button>
        </div>
      </div>

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

      <!-- 페이지네이션 -->
      <nav class="pagination" v-if="totalPages > 1 || total === 0">
        <button
            class="page-btn"
            :disabled="page === 1"
            @click="page = Math.max(1, page - 1)"
        >
          이전
        </button>

        <button
            v-for="p in pages"
            :key="p"
            class="page-btn"
            :class="{ active: p === page }"
            @click="page = p"
        >
          {{ p }}
        </button>

        <button
            class="page-btn"
            :disabled="page === totalPages"
            @click="page = Math.min(totalPages, page + 1)"
        >
          다음
        </button>
      </nav>

      <div class="toolbar">
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
}

const page = ref(1)
const pageSize = 10

// 전체 건수
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const pages = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))

const { public: { apiBase } } = useRuntimeConfig()

// ⬇ 변경 1) useAsyncData 키를 고정, page 감시 제거
// ⬇ 변경 2) 서버에서 전체를 한 번에 가져오고(_page/_limit 제거), 헤더 대신 길이로 total 계산
const LIST_KEY = 'inquiries-list'
const { data, pending, error, refresh } = await useAsyncData<Inquiry[]>(
    LIST_KEY,
    async () => {
      const list = await $fetch<Inquiry[]>('/inquiries', {
        baseURL: apiBase,
        query: {
          _sort: 'id',
          _order: 'desc',
        },
      })
      total.value = list.length
      return list
    }
)

// ⬇ 변경 3) 현재 페이지에 보여줄 10개만 자르기
const inquiries = computed(() => {
  const list = filtered.value
  const start = (page.value - 1) * pageSize
  return list.slice(start, start + pageSize)
})

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : '')
const writeNew = () => navigateTo('/new')

// (선택) 탭 카운트: 현재 페이지 기준 그대로 두려면 inquiries 사용, 전체 기준이면 data로 변경
const counts = computed<Record<string, number>>(() => {
  const base = inquiries.value // 전체 기준으로 집계하려면 data.value 로 바꾸세요
  const c: Record<string, number> = {}
  for (const row of base) {
    const key = (row as any).category || row.type || '기타'
    c[key] = (c[key] || 0) + 1
  }
  return c
})



// 검색 관련
// 검색 상태
const searchField = ref<'title'>('title')
const keyword = ref('')

// 문자열 정규화(대소문자 무시/공백 트림)
const norm = (s?: string) => (s ?? '').toLowerCase().trim()

// 필터(전체 data → 검색 필터)
const filtered = computed(() => {
  const list = (data.value ?? [])
  const q = norm(keyword.value)
  if (!q) return list
  // 현재는 '제목'만: 향후 다른 항목 추가 시 switch-case 확장
  return list.filter(row => norm(row.title).includes(q))
})

// 검색어가 바뀌면 1페이지로 이동
watch(keyword, () => { page.value = 1 })

// total은 필터 결과 길이를 따르게(기존 ref 그대로 활용)
watch(filtered, (list) => {
  total.value = list.length
}, { immediate: true })

</script>

<style scoped>
/* 페이지 네이션*/
.pagination {
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
}

.page-btn {
  min-width: 34px;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.page-btn.active {
  background: #2955d1;
  color: #fff;
  border-color: #2955d1;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.searchbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 12px 0;
}

.searchbar.right {
  width: max-content;   /* 내용만큼만 너비 */
  margin-left: auto;    /* 오른쪽으로 붙이기 */
  margin-bottom: 12px;  /* 테이블과 간격 */
}

.input {
  height: 36px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.select {
  height: 36px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.table-tools {
  display: flex;
  justify-content: flex-end; /* → 오른쪽 붙이기 */
  margin-bottom: 12px;       /* 테이블과 간격 */
}
.table-tools .searchbar { margin: 0; } /* 기존 .searchbar margin 상쇄 */


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
.table thead th {text-align: center;}
.attach-cell { text-align: center; }
.toolbar { margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px; }
.btn { appearance: none; border: 1px solid #d1d5db; background: #fff; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn.primary { border-color: #2955d1; background: #2955d1; color: #fff; }
@media (max-width: 480px) { .card-head h1 { font-size: 18px; } }
</style>