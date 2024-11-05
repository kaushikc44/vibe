// src/types/ido.ts
import { PublicKey } from '@solana/web3.js';

export interface IDOPool {
    authority: PublicKey;
    tokenMint: PublicKey;
    tokenVault: PublicKey;
    treasury: PublicKey;
    totalAllocation: number;
    remainingAllocation: number;
    tokenPrice: number;
    minAllocation: number;
    maxAllocation: number;
    startTime: number;
    endTime: number;
    paused: boolean;
    finalized: boolean;
    bump: number;
}

export interface IDOInstruction {
    version: "0.1.0";
    name: "ido_launchpad";
    instructions: [
        {
            name: "initializePool";
            accounts: [
                {
                    name: "pool";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "authority";
                    isMut: true;
                    isSigner: true;
                },
                {
                    name: "tokenMint";
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: "tokenVault";
                    isMut: true;
                    isSigner: true;
                },
                {
                    name: "authorityTokenAccount";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "treasury";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "tokenProgram";
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: "systemProgram";
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: "rent";
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [
                {
                    name: "totalAllocation";
                    type: "u64";
                },
                {
                    name: "tokenPrice";
                    type: "u64";
                },
                {
                    name: "minAllocation";
                    type: "u64";
                },
                {
                    name: "maxAllocation";
                    type: "u64";
                },
                {
                    name: "startTime";
                    type: "i64";
                },
                {
                    name: "endTime";
                    type: "i64";
                }
            ];
        },
        {
            name: "participate";
            accounts: [
                {
                    name: "pool";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "user";
                    isMut: true;
                    isSigner: true;
                },
                {
                    name: "tokenVault";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "userTokenAccount";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "treasury";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "tokenProgram";
                    isMut: false;
                    isSigner: false;
                },
                {
                    name: "systemProgram";
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [
                {
                    name: "amount";
                    type: "u64";
                }
            ];
        },
        {
            name: "finalizePool";
            accounts: [
                {
                    name: "pool";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "authority";
                    isMut: false;
                    isSigner: true;
                },
                {
                    name: "tokenVault";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "authorityTokenAccount";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "tokenProgram";
                    isMut: false;
                    isSigner: false;
                }
            ];
            args: [];
        },
        {
            name: "setPoolStatus";
            accounts: [
                {
                    name: "pool";
                    isMut: true;
                    isSigner: false;
                },
                {
                    name: "authority";
                    isMut: false;
                    isSigner: true;
                }
            ];
            args: [
                {
                    name: "paused";
                    type: "bool";
                }
            ];
        }
    ];
}