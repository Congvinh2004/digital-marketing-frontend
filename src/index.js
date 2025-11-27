import React from 'react';
import ReactDOM from 'react-dom';
import 'react-toastify/dist/ReactToastify.css';
import './styles/styles.scss';

import App from './containers/App';
import * as serviceWorker from './serviceWorker';
import IntlProviderWrapper from "./hoc/IntlProviderWrapper";


import { Provider } from 'react-redux';
import reduxStore, { persistor } from './redux';

// Cleanup function để xóa modal backdrop và reset body styles sau hot reload
const cleanupAfterHotReload = () => {
    // Remove modal backdrop nếu có
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    modalBackdrops.forEach(backdrop => backdrop.remove());

    // Remove body classes và styles từ reactstrap modal
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.pointerEvents = '';

    // Remove any overlay elements có thể block (chỉ remove nếu là modal backdrop)
    const overlays = document.querySelectorAll('[class*="backdrop"]');
    overlays.forEach(overlay => {
        const style = window.getComputedStyle(overlay);
        // Chỉ remove nếu là fixed position và có z-index cao (thường là modal backdrop)
        if (style.position === 'fixed' && parseInt(style.zIndex) > 1000) {
            overlay.remove();
        }
    });

    // Reset html element styles nếu có
    document.documentElement.style.overflow = '';
    document.documentElement.style.paddingRight = '';
};

const renderApp = () => {
    // Cleanup trước khi render
    cleanupAfterHotReload();
    
    ReactDOM.render(
        <Provider store={reduxStore}>
            <IntlProviderWrapper>
                <App persistor={persistor} />
            </IntlProviderWrapper>
        </Provider>,
        document.getElementById('root')
    );
};

renderApp();

// Cleanup khi hot module replacement xảy ra (nếu có)
if (module.hot) {
    module.hot.accept('./containers/App', () => {
        cleanupAfterHotReload();
        renderApp();
    });
}

// Cleanup khi window focus (sau khi hot reload)
window.addEventListener('focus', () => {
    setTimeout(cleanupAfterHotReload, 100);
});

// Cleanup ngay sau khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupAfterHotReload);
} else {
    cleanupAfterHotReload();
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
