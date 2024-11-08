// src/sdk/utils.ts
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@project-serum/anchor';
import idl from './idl/ido_launchpad.json';

export const IDO_PROGRAM_ID = new PublicKey("GUaR6jXdr2DatWNTMpKxyAcKJi3LCkevGyxsJD1hz9WK");

export const getProgram = (wallet: any, connection: Connection) => {
    const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
    );
    
    return new Program(idl as Idl, IDO_PROGRAM_ID, provider);
};