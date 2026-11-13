import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import 'github-markdown-css/github-markdown.css';
import './styles.css';

import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

import {App} from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container #root is missing in index.html');
}

createRoot(container).render(
  <StrictMode>
    <Theme theme={neutralTheme}>
      <App />
    </Theme>
  </StrictMode>,
);
