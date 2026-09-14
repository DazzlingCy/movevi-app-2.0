import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare const __APP_VERSION__: string;

const checkForNewVersion = async () => {
  try {
    const versionUrl = new URL('version.json', document.baseURI);
    versionUrl.searchParams.set('t', Date.now().toString());

    const response = await fetch(versionUrl, {cache: 'no-store'});
    if (!response.ok) return;

    const payload = (await response.json()) as {version?: string};
    const remoteVersion = payload.version;
    if (!remoteVersion || remoteVersion === __APP_VERSION__) return;

    const pageUrl = new URL(window.location.href);
    if (pageUrl.searchParams.get('v') === remoteVersion) return;

    pageUrl.searchParams.set('v', remoteVersion);
    window.location.replace(pageUrl);
  } catch {
    // 离线或弱网时继续使用当前版本，下次回到前台时再次检查。
  }
};

void checkForNewVersion();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    void checkForNewVersion();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
