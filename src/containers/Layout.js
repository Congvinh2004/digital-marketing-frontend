import React from 'react';
import Sidebar from './SideBar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ marginLeft: '200px', padding: '20px', flex: 1 }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
