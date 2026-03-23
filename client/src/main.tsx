import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './theme.css';
import App from './App.tsx';
import { AppQueryClientProvider } from './providers/AppQueryClientProvider.tsx';

createRoot(document.getElementById('root')!).render(
    <AppQueryClientProvider>
        <StrictMode>
            <App />
        </StrictMode>
    </AppQueryClientProvider>
);
