// src/hooks/useIDOProgram.ts
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { getProgram } from '@/sdk/utils';
import { 
    PublicKey, 
    SystemProgram, 
    SYSVAR_RENT_PUBKEY,
    Connection,
    TransactionInstruction,
    Transaction,
    Commitment,
} from '@solana/web3.js';
import { 
    TOKEN_PROGRAM_ID, 
    getAssociatedTokenAddress,
    ASSOCIATED_TOKEN_PROGRAM_ID,createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import BN from 'bn.js';

// Types
interface InitializePoolAccounts {
    tokenMint: string;
    treasury: string;
}

interface Pool {
    address: string;
    data: {
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
    };
}


interface InitializePoolParams {
    totalAllocation: number;
    tokenPrice: number;
    minAllocation: number;
    maxAllocation: number;
    startTime: number;
    endTime: number;
}

interface ParticipateParams {
    poolAddress: string;
    amount: number;
}

const RPC_ENDPOINT = 'https://rpc.devnet.soo.network/rpc';
const DEFAULT_COMMITMENT: Commitment = 'confirmed';

// Create connection with proper configuration
const createConnection = () => {
    return new Connection(RPC_ENDPOINT, {
        commitment: DEFAULT_COMMITMENT,
        confirmTransactionInitialTimeout: 60000,
        disableRetryOnRateLimit: false,
    });
};


export const useIDOProgram = () => {
    const connection = useMemo(() => createConnection(), []);
    const wallet = useWallet();

    const program = useMemo(() => {
        if (!wallet) return null;
        return getProgram(wallet, connection);
    }, [wallet, connection]);

    const validatePoolAccounts = async (
        tokenMint: PublicKey,
        treasury: PublicKey
    ) => {
        try {
            // Validate token mint
            const tokenMintInfo = await connection.getAccountInfo(tokenMint);
            if (!tokenMintInfo) {
                throw new Error('Invalid token mint address');
            }

            // Validate treasury
            const treasuryInfo = await connection.getAccountInfo(treasury);
            if (!treasuryInfo) {
                throw new Error('Invalid treasury address');
            }

            return true;
        } catch (error) {
            console.error('Account validation error:', error);
            throw error;
        }
    };

    const initializePool = async (
        accountParams: InitializePoolAccounts,
        instructionParams: InitializePoolParams
    ) => {
        if (!program || !wallet.publicKey) {
            throw new Error("Program not initialized or wallet not connected");
        }
        const validateTokenMint = async (tokenMint: PublicKey): Promise<boolean> => {
            try {
                // Get mint info
                const mintInfo = await connection.getParsedAccountInfo(tokenMint);
                if (!mintInfo.value) {
                    throw new Error('Token mint account not found');
                }
        
                // Get ATA
                const ata = await getAssociatedTokenAddress(
                    tokenMint,
                    wallet.publicKey!
                );
        
                // Check if ATA exists
                const ataInfo = await connection.getParsedAccountInfo(ata);
                if (!ataInfo.value) {
                    throw new Error('Associated Token Account not found. Please create it first.');
                }
        
                return true;
            } catch (error) {
                console.error('Token validation error:', error);
                throw error;
            }
        };
        

        try {
            // Convert string addresses to PublicKeys
            const tokenMintPubkey = new PublicKey(accountParams.tokenMint);
            console.log("Token Mint:", tokenMintPubkey.toString());
            await validateTokenMint(tokenMintPubkey);
            console.log("Starting pool initialization...");
        
        // Convert and log addresses
        
       
        
        const treasuryPubkey = new PublicKey(accountParams.treasury);
        console.log("Treasury:", treasuryPubkey.toString());

        // Get and log token account info
        const tokenInfo = await connection.getParsedAccountInfo(tokenMintPubkey);
        console.log("Token Info:", tokenInfo.value ? "Found" : "Not Found");

        // Get and log ATA
        const ata = await getAssociatedTokenAddress(
            tokenMintPubkey,
            wallet.publicKey
        );
        console.log("ATA Address:", ata.toString());

        const ataInfo = await connection.getParsedAccountInfo(ata);
        console.log("ATA Info:", ataInfo.value ? "Found" : "Not Found");

        // Find PDAs
        const [poolAddress] = PublicKey.findProgramAddressSync(
            [Buffer.from("pool"), tokenMintPubkey.toBuffer()],
            program.programId
        );
        console.log("Pool Address:", poolAddress.toString());

        const [tokenVault] = PublicKey.findProgramAddressSync(
            [Buffer.from("token_vault"), poolAddress.toBuffer()],
            program.programId
        );
        console.log("Token Vault:", tokenVault.toString());

        // Get authority token account
        const authorityTokenAccount = await getAssociatedTokenAddress(
            tokenMintPubkey,
            wallet.publicKey
        );
        console.log("Authority Token Account:", authorityTokenAccount.toString());

        console.log("Creating transaction...");
        const tx = await program.methods
            .initializePool(
                new BN(instructionParams.totalAllocation),
                new BN(instructionParams.tokenPrice),
                new BN(instructionParams.minAllocation),
                new BN(instructionParams.maxAllocation),
                new BN(instructionParams.startTime),
                new BN(instructionParams.endTime)
            )
            .accounts({
                pool: poolAddress,
                authority: wallet.publicKey,
                tokenMint: tokenMintPubkey,
                tokenVault: tokenVault,
                authorityTokenAccount: authorityTokenAccount,
                treasury: treasuryPubkey,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            })
            .rpc({
                skipPreflight: true,
                commitment: 'confirmed'
            });

        console.log("Transaction sent:", tx);
        
        const confirmation = await connection.confirmTransaction(tx, 'confirmed');
        console.log("Transaction confirmed:", confirmation);
        
        return tx;

    } catch (error) {
        console.error("Detailed error:", error);
        
        // Enhanced error handling
        if (error instanceof Error) {
            if (error.message.includes("TokenMint")) {
                throw new Error("Invalid token mint: Please check if the token account exists and you own it");
            }
            if (error.message.includes("account not found")) {
                throw new Error("Account not found: Make sure all accounts exist and are properly funded");
            }
            throw error;
        }
        
        throw new Error("An unknown error occurred");
    }
};

const participate = async ({ poolAddress, amount }: ParticipateParams) => {
    if (!program || !wallet.publicKey) {
        throw new Error("Program not initialized or wallet not connected");
    }

    try {
        console.log('Starting participation with:', { poolAddress, amount });
        
        // Convert pool address string to PublicKey
        const poolPubkey = new PublicKey(poolAddress);
        
        // Fetch pool data
        const poolAccount:any = await program.account.idoPool.fetch(poolPubkey);
        console.log('Pool account:', poolAccount);

        // Get user's token account
        const userTokenAccount = await getAssociatedTokenAddress(
            poolAccount.tokenMint,
            wallet.publicKey
        );
        console.log('User token account:', userTokenAccount.toString());

        // Create token account if it doesn't exist
        const tokenAccountInfo = await connection.getAccountInfo(userTokenAccount);
        if (!tokenAccountInfo) {
            console.log('Creating associated token account...');
            
            // Create ATA instruction
            const createAtaIx = createAssociatedTokenAccountInstruction(
                wallet.publicKey, // payer
                userTokenAccount, // ata
                wallet.publicKey, // owner
                poolAccount.tokenMint // mint
            );

            // Send create ATA transaction
            const createAtaTx = new Transaction().add(createAtaIx);
            const signature = await wallet.sendTransaction(createAtaTx, connection);
            await connection.confirmTransaction(signature, 'confirmed');
            console.log('Token account created:', signature);
        }

        // Now proceed with participation
        console.log('Sending participate transaction...');
        const tx = await program.methods
            .participate(new BN(amount))
            .accounts({
                pool: poolPubkey,
                user: wallet.publicKey,
                tokenVault: poolAccount.tokenVault,
                userTokenAccount: userTokenAccount,
                treasury: poolAccount.treasury,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .rpc({
                skipPreflight: true,
                commitment: 'confirmed'
            });

        console.log('Participation transaction sent:', tx);
        await connection.confirmTransaction(tx, 'confirmed');
        console.log('Transaction confirmed');

        return tx;
    } catch (error) {
        console.error("Detailed participation error:", error);
        if (error instanceof Error) {
            if (error.message.includes("insufficient funds")) {
                throw new Error("Insufficient SOL balance");
            }
            if (error.message.includes("TokenAccount")) {
                throw new Error("Token account creation failed");
            }
            throw error;
        }
        throw new Error("Failed to participate in pool");
    }
};

    const finalizePool = async (poolAddress: string) => {
        if (!program || !wallet.publicKey) {
            throw new Error("Program not initialized or wallet not connected");
        }

        try {
            const poolPubkey = new PublicKey(poolAddress);
            const poolAccount:any = await program.account.idoPool.fetch(poolPubkey);
            
            // Get authority token account
            const authorityTokenAccount = await getAssociatedTokenAddress(
                poolAccount.tokenMint,
                wallet.publicKey
            );

            // Check if authority token account exists, if not create it
            const tokenAccount = await connection.getAccountInfo(authorityTokenAccount);
            
            let instructions: TransactionInstruction[] = [];
            
            if (!tokenAccount) {
                instructions.push(
                    createAssociatedTokenAccountInstruction(
                        wallet.publicKey,
                        authorityTokenAccount,
                        wallet.publicKey,
                        poolAccount.tokenMint
                    )
                );
            }

            // Add finalize pool instruction
            const finalizeIx = await program.methods
                .finalizePool()
                .accounts({
                    pool: poolPubkey,
                    authority: wallet.publicKey,
                    tokenVault: poolAccount.tokenVault,
                    authorityTokenAccount: authorityTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .instruction();

            instructions.push(finalizeIx);

            // Create and send transaction
            const tx = new Transaction().add(...instructions);
            const signature = await wallet.sendTransaction(tx, connection, {
                skipPreflight: true,
            });

            await connection.confirmTransaction(signature, 'confirmed');
            return signature;

        } catch (error) {
            console.error("Error finalizing pool:", error);
            if (error.message.includes("TokenAccount")) {
                throw new Error("Failed to create token account");
            }
            throw new Error("Failed to finalize pool: " + error.message);
        }
    };

    const getAllPools = async (): Promise<Pool[]> => {
        if (!program) throw new Error("Program not initialized");
    
        try {
            console.log("Fetching all pools...");
            const allPools = await program.account.idoPool.all();
            console.log("Fetched pools:", allPools);
            
            return allPools.map(pool => ({
                address: pool.publicKey.toString(),
                data: {
                    authority: pool.account.authority,
                    tokenMint: pool.account.tokenMint,
                    tokenVault: pool.account.tokenVault,
                    treasury: pool.account.treasury,
                    totalAllocation: Number(pool.account.totalAllocation),
                    remainingAllocation: Number(pool.account.remainingAllocation),
                    tokenPrice: Number(pool.account.tokenPrice),
                    minAllocation: Number(pool.account.minAllocation),
                    maxAllocation: Number(pool.account.maxAllocation),
                    startTime: Number(pool.account.startTime),
                    endTime: Number(pool.account.endTime),
                    paused: pool.account.paused,
                    finalized: pool.account.finalized
                }
            })) as any;
        } catch (error) {
            console.error("Error fetching pools:", error);
            throw error;
        }
    };
    const getPoolInfo = async (poolAddress: string) => {
        if (!program) throw new Error("Program not initialized");
    
        try {
            const poolPubkey = new PublicKey(poolAddress);
            const poolAccount = await program.account.idoPool.fetch(poolPubkey);
            
            return {
                authority: poolAccount.authority,
                tokenMint: poolAccount.tokenMint,
                tokenVault: poolAccount.tokenVault,
                treasury: poolAccount.treasury,
                totalAllocation: Number(poolAccount.totalAllocation),
                remainingAllocation: Number(poolAccount.remainingAllocation),
                tokenPrice: Number(poolAccount.tokenPrice),
                minAllocation: Number(poolAccount.minAllocation),
                maxAllocation: Number(poolAccount.maxAllocation),
                startTime: Number(poolAccount.startTime),
                endTime: Number(poolAccount.endTime),
                paused: poolAccount.paused,
                finalized: poolAccount.finalized
            };
        } catch (error) {
            console.error("Error fetching pool info:", error);
            throw error;
        }
    };

    const getUserPoolParticipation = async (): Promise<Pool[]> => {
        if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
    
        try {
            // Get all pools
            const allPools = await program.account.idoPool.all();
            const userParticipation = await Promise.all(
                allPools.map(async (pool) => {
                    try {
                        // Get user's token account for this pool
                        const userTokenAccount = await getAssociatedTokenAddress(
                            pool.account.tokenMint as any,
                            wallet.publicKey!
                        );
    
                        // Check if token account exists and get balance
                        const tokenAccount = await connection.getParsedAccountInfo(userTokenAccount);
                        const balance = tokenAccount.value 
                            ? (tokenAccount.value.data as any).parsed.info.tokenAmount.uiAmount 
                            : 0;
    
                        // Only return pools where user has tokens
                        if (balance > 0) {
                            return {
                                address: pool.publicKey.toString(),
                                data: {
                                    authority: pool.account.authority,
                                    tokenMint: pool.account.tokenMint,
                                    tokenVault: pool.account.tokenVault,
                                    treasury: pool.account.treasury,
                                    totalAllocation: Number(pool.account.totalAllocation),
                                    remainingAllocation: Number(pool.account.remainingAllocation),
                                    tokenPrice: Number(pool.account.tokenPrice),
                                    minAllocation: Number(pool.account.minAllocation),
                                    maxAllocation: Number(pool.account.maxAllocation),
                                    startTime: Number(pool.account.startTime),
                                    endTime: Number(pool.account.endTime),
                                    paused: pool.account.paused,
                                    finalized: pool.account.finalized,
                                    userBalance: balance
                                }
                            };
                        }
                        return null;
                    } catch (error) {
                        console.error('Error checking participation:', error);
                        return null;
                    }
                })
            );
    
            // Filter out null values and return only pools where user has participated
            return userParticipation.filter(pool => pool !== null) as Pool[];
        } catch (error) {
            console.error("Error fetching user participation:", error);
            throw error;
        }
    };

    return {
        program,
        initializePool,
        participate,
        finalizePool,
        getPoolInfo,
        getAllPools,
        getUserPoolParticipation
    };
};

export default useIDOProgram
