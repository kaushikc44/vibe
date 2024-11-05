export interface IDOProject {
    id: number;
    name: string;
    symbol: string;
    description: string;
    totalRaise: number;
    currentRaise: number;
    tokenPrice: number;
    startTime: number;
    endTime: number;
    minAllocation: number;
    maxAllocation: number;
    status: 'active' | 'upcoming' | 'ended';
}