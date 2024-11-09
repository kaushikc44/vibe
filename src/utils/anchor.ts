import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@project-serum/anchor';
import idl from '../sdk/idl/ido_launchpad.json';
import { IDOPool, IDOInstruction } from '../types/ido';

export const programId = new PublicKey("8uwSak5TPbRsJZSeU4jrWq7FhDJEDQVFMa1fw3KqLpsC");

export const getProgram = (wallet: any, connection: Connection) => {
    const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
    );
    
    return new Program(
        idl as IDOInstruction,
        programId,
        provider
    );
};