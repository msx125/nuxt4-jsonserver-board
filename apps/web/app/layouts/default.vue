<template>
  <div class="layout">
    <Header />

    <div class="page-wrap">
      <div class="container">
        <div class="body">
          <Lnb class="lnb" />
          <main class="main">
            <slot />
          </main>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
// Nuxt는 components 자동 임포트가 기본값이라 import 불필요
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #fafafa;
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

/* 반응형 - 태블릿 이하: LNB 숨김, 메인은 전체폭 */
@media (max-width: 1024px) {
  .body {
    grid-template-columns: 1fr;
  }
  .lnb {
    display: none;
  }
}

.main {
  min-height: 480px;
}
</style>