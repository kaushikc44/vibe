// src/app/admin/page.tsx
'use client';

import { AdminPoolCreation } from '@/components/admin/AdminPoolCreation';
import { AdminPoolList } from '@/components/admin/AdminPoolList';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';

export default function AdminPage() {
    const { connected } = useWallet();
    const [activeTab, setActiveTab] = useState<'create' | 'view'>('view');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    if (!connected) {
        return (
            <div className="min-h-screen bg-base-200 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">IDO Admin</h1>
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Please connect your wallet</h2>
                            <WalletMultiButton className="btn btn-primary" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">IDO Admin</a>
                </div>
                <div className="flex-none">
                    <WalletMultiButton className="btn btn-primary" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                    <div className="tabs tabs-boxed justify-center">
                        <a 
                            className={`tab ${activeTab === 'create' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('create')}
                        >
                            Create Pool
                        </a>
                        <a 
                            className={`tab ${activeTab === 'view' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('view')}
                        >
                            View Pools
                        </a>
                    </div>

                    {activeTab === 'create' ? (
                        <AdminPoolCreation 
                            onPoolCreated={() => {
                                setRefreshTrigger(prev => prev + 1);
                                setActiveTab('view'); // Switch to view tab after creation
                            }} 
                        />
                    ) : (
                        <AdminPoolList key={refreshTrigger} />
                    )}
                </div>
            </div>
        </div>
    );
}