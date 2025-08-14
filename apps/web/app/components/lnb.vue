<template>
  <aside class="lnb">
    <div class="lnb-head">나의협회</div>
    <ul class="lnb-menu">
      <li><NuxtLink to="/">홈</NuxtLink></li>
      <li><NuxtLink to="/">개인정보</NuxtLink></li>
      <li class="active"><NuxtLink to="/">1:1 문의</NuxtLink></li>
      <li><NuxtLink to="/">온라인자격신청내역</NuxtLink></li>
      <li><NuxtLink to="/">보수교육 이수내역</NuxtLink></li>
      <li><NuxtLink to="/">회원정보</NuxtLink></li>
    </ul>
  </aside>
</template>

<script setup></script>

<style scoped>
.lnb {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  height: fit-content;
}

.lnb-head {
  background: #2955d1;
  color: #fff;
  font-weight: 700;
  padding: 18px 16px;
  font-size: 16px;
}

.lnb-menu {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}
.lnb-menu li a {
  display: block;
  padding: 12px 16px;
  color: #374151;
  text-decoration: none;
  font-size: 14px;
}
.lnb-menu li.active a,
.lnb-menu li a:hover {
  background: #f3f4f6;
  color: #111827;
}
</style>
