import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      less: { javascriptEnabled: true }
    }
  },
  server: {
    port: 3000,
    proxy: {
      // 匹配所有 /select 开头的接口
      '/select': {
        target: 'http://123.207.56.119:9666', // 后端根地址
        changeOrigin: true, // 伪造源，解决跨域
        rewrite: (path) => path // 路径不删除/select，接口完整匹配
      }
    }
  }
})