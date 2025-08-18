<template>
  <header class="header">
    <div class="container header-inner">
      <!-- 로고 -->
      <div class="logo">
        <NuxtLink to="/">게시판 만들기 미션</NuxtLink>
      </div>

      <!-- GNB -->
      <nav :class="['gnb', { open: isOpen }]">
        <NuxtLink to="/">소통</NuxtLink>
        <NuxtLink to="/">사업</NuxtLink>
        <NuxtLink to="/">정보</NuxtLink>
        <NuxtLink to="/">연구</NuxtLink>
        <NuxtLink to="/">협회</NuxtLink>
        <NuxtLink to="/">나의협회</NuxtLink>
      </nav>

      <!-- 우측 유틸 -->
      <div class="utils">
        <NuxtLink to="/">진행조회</NuxtLink>
        <NuxtLink to="/">로그인</NuxtLink>

        <!-- 햄버거 -->
        <button class="hamburger" @click="toggle" aria-label="menu">
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>

    <!-- 모바일 펼침 영역 (작게일 때만 보임) -->
    <div class="mobile-gnb container" v-show="isOpen">
      <NuxtLink to="/" @click="close">소통</NuxtLink>
      <NuxtLink to="/" @click="close">사업</NuxtLink>
      <NuxtLink to="/" @click="close">정보</NuxtLink>
      <NuxtLink to="/" @click="close">연구</NuxtLink>
      <NuxtLink to="/" @click="close">협회</NuxtLink>
      <NuxtLink to="/" @click="close">나의협회</NuxtLink>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
const isOpen = ref(false)

const open = () => (isOpen.value = true)
const close = () => (isOpen.value = false)
const toggle = () => (isOpen.value = !isOpen.value)
</script>

<style scoped>
.header {
  background: #fff;
  border-bottom: 1px solid #eaeaea;
  position: sticky;
  top: 0;
  z-index: 20;
}

.header-inner {
  height: 56px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 16px;
}

.logo a {
  font-weight: 700;
  color: #1f2937;
  text-decoration: none;
}

.gnb {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-right: 34px;
}

.gnb a {
  color: #374151;
  text-decoration: none;
  font-size: 14px;
}

.utils {
  display: flex;
  align-items: center;
  gap: 16px;
}

.utils a {
  color: #4b5563;
  text-decoration: none;
  font-size: 14px;
}

/* 햄버거 버튼: PC 숨김, 작은 화면 표시 */
.hamburger {
  display: none;
  width: 40px;
  height: 32px;
  padding: 6px 4px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
}
.hamburger span {
  display: block;
  height: 2px;
  margin: 4px 0;
  background: #1f2937;
}

/* 반응형 */
@media (max-width: 1024px) {
  .gnb {
    display: none; /* PC용 GNB 숨김 */
  }
  .hamburger {
    display: inline-block;
  }
  .mobile-gnb {
    display: grid;
    gap: 10px;
    padding: 12px 0 16px;
  }
  .mobile-gnb a {
    color: #374151;
    text-decoration: none;
    padding: 8px 0;
    border-bottom: 1px dashed #e5e7eb;
  }
}
</style>
