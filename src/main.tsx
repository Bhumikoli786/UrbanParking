import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-register and update PWA service worker
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('UrbanPark PWA: New content is available, auto-updating.');
  },
  onOfflineReady() {
    console.log('UrbanPark PWA: App is ready to work offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
