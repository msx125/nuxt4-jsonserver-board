// web/nuxt.config.ts
import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxt/eslint', '@primevue/nuxt-module'],

    primevue: {
        options: {
            theme: { preset: Aura },   // ★ 테마 적용
            ripple: true,
        },
        components: { include: ['Toast', 'ConfirmDialog'] }, // ★ 쓸 컴포넌트만
        services: { toast: true, confirmation: true },       // ★ 서비스 활성화
    },

    css: [
        'primeicons/primeicons.css',              // ★ 아이콘(Close, 경고 표시 등)
        // '~/assets/css/primevue-overrides.css', // (선택) z-index/여백 등 커스텀
    ],

    eslint: {
        config: { standalone: false },
    },

    runtimeConfig: {
        public: { apiBase: 'http://localhost:4000' }
    }
})
