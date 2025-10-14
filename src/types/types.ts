export type Centers = {
    id: number;
    name: string;
    acronym: string;
    createdAt: Date;
    updatedAt: Date;
    qualityLabs: {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        centerId: number;
        location: string;
        country: string;
    }[];
}[]