// src/app/admin/page.tsx
'use client';

import { AdminPoolCreation } from '@/components/admin/AdminPoolCreation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export default function AdminPage() {
    const { connected } = useWallet();

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
        <div className="min-h-screen bg-base-200 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">IDO Admin</h1>
                    <WalletMultiButton className="btn btn-primary" />
                </div>
                <AdminPoolCreation />
            </div>
        </div>
    );
}