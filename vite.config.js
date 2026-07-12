import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// const NORMAL_TARGET = 'http://123.207.56.119:9666';
const NORMAL_TARGET = 'http://192.168.0.109:9666';

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
      '/portfolio-overview': {
        target: NORMAL_TARGET, // 后端根地址
        changeOrigin: true, // 伪造源，解决跨域
        rewrite: (path) => path, // 路径不删除/select，接口完整匹配
        logLevel: 'info' // 打印完整转发路径日志
      },
      '/select': {
        target: NORMAL_TARGET, // 后端根地址
        changeOrigin: true, // 伪造源，解决跨域
        rewrite: (path) => path, // 路径不删除/select，接口完整匹配
        logLevel: 'info' // 打印完整转发路径日志
      },
      '/contract-execution': {
        target: NORMAL_TARGET,
        changeOrigin: true,
        rewrite: path => path,
        logLevel: 'info'
      },
      '/position-relation-history': {
        target: NORMAL_TARGET,
        changeOrigin: true,
        rewrite: path => path,
        logLevel: 'info'
      },
      '/trader': {
        target: NORMAL_TARGET,
        changeOrigin: true,
        rewrite: path => path,
        logLevel: 'info'
      },
      '/investment-strategy': {
        target: NORMAL_TARGET,
        changeOrigin: true,
        rewrite: path => path,
        logLevel: 'info'
      },
      '/risk-dashboard': {
        target: NORMAL_TARGET,
        changeOrigin: true,
        rewrite: path => path,
        logLevel: 'info'
      }
    }
  }
})