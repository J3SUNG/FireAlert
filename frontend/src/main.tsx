import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './app/styles/index.css';
import 'leaflet/dist/leaflet.css';

import { setupDefaultLeafletIcons } from './shared/utils/leaflet/iconSetup';

setupDefaultLeafletIcons();

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
