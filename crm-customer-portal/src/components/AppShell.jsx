import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppShell = () => {
    return (
        <div className="min-h-screen bg-[#f8f9fb] flex">
            <Sidebar />
            <div className="flex-1 ml-[220px] flex flex-col min-w-0">
                <TopBar />
                <main className="flex-1 p-6 overflow-y-auto w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppShell;
