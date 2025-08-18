<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="container ft-grid">
        <div class="ft-col">
          <div class="ft-title">협회 안내</div>
          <ul>
            <li><a href="#">개인정보 처리방침</a></li>
            <li><a href="#">찾아오시는 길</a></li>
          </ul>
        </div>
        <div class="ft-col">
          <div class="ft-title">문의</div>
          <p>대표 전화 02)786-0xxx</p>
          <p>팩스 02)786-0xxx</p>
        </div>
        <div class="ft-col">
          <div class="ft-title">사이트</div>
          <p>Copyright © KASW</p>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container">ALL RIGHTS RESERVED.</div>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
.footer-top {
  background: #fff;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 0;
}
.ft-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.ft-title {
  font-weight: 700;
  margin-bottom: 8px;
}
.ft-col ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.ft-col a {
  color: #374151;
  text-decoration: none;
}
.footer-bottom {
  background: #0b0b0b;
  color: #9ca3af;
  font-size: 13px;
  padding: 14px 0;
}

@media (max-width: 768px) {
  .ft-grid {
    grid-template-columns: 1fr;
  }
}
</style>
