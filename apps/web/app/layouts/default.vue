<!-- layouts/default.vue -->
<template>
  <!-- 화면을 3등분하는 뼈대 -->
  <div class="layout">

    <ConfirmDialog />
    <Toast />
    <Header />
    <!-- 본문 영역을 나누는 뼈대 -->
    <div class="page-wrap">
      <!-- 본문의 가운데 정렬 및 폭제한 뼈대 -->
      <div class="container">
        <div class="body">
          <Lnb class="lnb" />
          <main class="main">
            <!-- pages 폴더 내 각 파일의 template 가 반영되는 구간-->
            <slot />
            <!-- pages 폴더 내 각 파일의 template 가 반영되는 구간-->
          </main>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// 모달창 컴포넌트 사용 ( 삭제 시 확인 재요청 목적 )
import ConfirmDialog from 'primevue/confirmdialog'
// 알림창 컴포넌트 사용
import Toast from 'primevue/toast'
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #fafafa; /* 배경색 */
}

/* 가운데 정렬 + 좌우 여백(PC) */
.container {
  width: 100%;
  max-width: 1160px; /* 참고 화면 감으로 맞춘 값 */
  margin: 0 auto;
  padding: 0 24px;   /* 좌우 여백 */
}

.body {
  display: grid;
  grid-template-columns: 260px 1fr; /* LNB + Main */
  gap: 24px;
  padding: 24px 0 48px;
}



.main {
  min-height: 480px;
}

/* 반응형 - 태블릿 이하: LNB 숨김, 메인은 전체폭 */
@media (max-width: 1024px) {
  .body {
    grid-template-columns: 1fr;
  }
  .lnb {
    position: sticky; top: 24px; align-self: start;
  }
}

</style>
