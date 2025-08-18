export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            apiBase: process.env.API_BASE || 'http://localhost:4000'
        }
    }
})
