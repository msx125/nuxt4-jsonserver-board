// https://nuxt.com/docs/api/configuration/nuxt-config
/* global defineNuxtConfig */
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@primevue/nuxt-module'],
  eslint: {
    config: {
      standalone: false,
    },
  },

   runtimeConfig: {
      public: {
          apiBase: 'http://localhost:4000'
      }
   }
})
