<template>
  <section class="card">
    <div class="card-head">
      <h1>1:1 문의 내역</h1>

      <div class="tabs">
        <button class="tab active">자격관련 (0)</button>
        <button class="tab">영역자격 (0)</button>
        <button class="tab">현장실습 (0)</button>
        <button class="tab">보수교육 (0)</button>
        <button class="tab">기타 (0)</button>
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
          </colgroup>
          <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>답변 여부</th>
            <th>등록일</th>
          </tr>
          </thead>
          <tbody>
          <!-- 실제 데이터는 주지 말라는 요청: 빈 상태 -->
          <tr class="empty">
            <td colspan="4">등록된 문의가 없습니다.</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="toolbar">
        <button class="btn primary">1:1 문의 작성</button>
      </div>
    </div>
  </section>
</template>

<script setup></script>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.card-head {
  padding: 20px 20px 8px;
  border-bottom: 1px solid #f3f4f6;
}
.card-head h1 {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 800;
  color: #111827;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tab {
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
}
.tab.active {
  background: #2955d1;
  border-color: #2955d1;
  color: #fff;
}

.card-body {
  padding: 20px;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table thead th {
  background: #f9fafb;
  color: #374151;
  text-align: left;
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.table tbody td {
  padding: 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
}

.table tbody tr:last-child td {
  border-bottom: 0;
}

.table .empty td {
  text-align: center;
  color: #6b7280;
}

.toolbar {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.btn {
  appearance: none;
  border: 1px solid #d1d5db;
  background: #fff;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.btn.primary {
  border-color: #2955d1;
  background: #2955d1;
  color: #fff;
}

@media (max-width: 480px) {
  .card-head h1 {
    font-size: 18px;
  }
}
</style>
