// src/sdk/utils.ts
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@project-serum/anchor';
import idl from './idl/ido_launchpad.json';

export const IDO_PROGRAM_ID = new PublicKey("3775vYyKQQXM2Uyewo6HmZ7uvrJLuGFcC6E1B554tV1Y");

export const getProgram = (wallet: any, connection: Connection) => {
    const provider = new AnchorProvider(
        connection,
        wallet,
        {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: true
        }
    );
    
    return new Program(
        idl as Idl,
        IDO_PROGRAM_ID,
        provider
    );
};