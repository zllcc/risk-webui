import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.js'
import './global.less';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename="/tiange">
    <App />
  </BrowserRouter>,
)
