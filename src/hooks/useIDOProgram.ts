import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import {getProgram} from "../utils/anchor"

export const useIDOProgram = () => {
    const { connection } = useConnection();
    const wallet = useWallet();

    const program = useMemo(() => {
        if (!wallet) return null;
        return getProgram(wallet, connection);
    }, [wallet, connection]);

    const initializePool = async (
        totalAllocation: number,
        tokenPrice: number,
        minAllocation: number,
        maxAllocation: number,
        startTime: number,
        endTime: number
    ) => {
        if (!program) throw new Error("Program not initialized");

        try {
            await program.methods
                .initializePool(
                    totalAllocation,
                    tokenPrice,
                    minAllocation,
                    maxAllocation,
                    startTime,
                    endTime
                )
                .rpc();
        } catch (error) {
            console.error("Error initializing pool:", error);
            throw error;
        }
    };

    const participate = async (amount: number) => {
        if (!program) throw new Error("Program not initialized");

        try {
            await program.methods
                .participate(amount)
                .rpc();
        } catch (error) {
            console.error("Error participating:", error);
            throw error;
        }
    };

    const finalizePool = async () => {
        if (!program) throw new Error("Program not initialized");

        try {
            await program.methods
                .finalizePool()
                .rpc();
        } catch (error) {
            console.error("Error finalizing pool:", error);
            throw error;
        }
    };

    return {
        program,
        initializePool,
        participate,
        finalizePool
    };
};