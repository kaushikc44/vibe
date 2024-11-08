// src/hooks/useIDOProgram.ts
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { getProgram } from '@/sdk/utils';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import BN from 'bn.js';

export const useIDOProgram = () => {
    const { connection } = useConnection();
    const wallet = useWallet();

    const program = useMemo(() => {
        if (!wallet) return null;
        return getProgram(wallet, connection);
    }, [wallet, connection]);

    const initializePool = async (
        tokenMint: PublicKey,
        treasury: PublicKey,
        totalAllocation: number,
        tokenPrice: number,
        minAllocation: number,
        maxAllocation: number,
        startTime: number,
        endTime: number
    ) => {
        if (!program || !wallet.publicKey) throw new Error("Program not initialized");

        try {
            // Derive the pool PDA
            const [poolAddress] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("pool"),
                    tokenMint.toBuffer()
                ],
                program.programId
            );

            // Derive the token vault PDA
            const [tokenVault] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("vault"),
                    poolAddress.toBuffer()
                ],
                program.programId
            );

            // Get token account
            const authorityTokenAccount = await getAssociatedTokenAddress(
                tokenMint,
                wallet.publicKey
            );

            const tx = await program.methods
                .initializePool(
                    new BN(totalAllocation),
                    new BN(tokenPrice),
                    new BN(minAllocation),
                    new BN(maxAllocation),
                    new BN(startTime),
                    new BN(endTime)
                )
                .accounts({
                    pool: poolAddress,
                    authority: wallet.publicKey,
                    tokenMint: tokenMint,
                    tokenVault: tokenVault,
                    authorityTokenAccount: authorityTokenAccount,
                    treasury: treasury,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    rent: SYSVAR_RENT_PUBKEY,
                })
                .rpc();

            return tx;
        } catch (error) {
            console.error("Error initializing pool:", error);
            throw error;
        }
    };

    return {
        program,
        initializePool,
    };
};