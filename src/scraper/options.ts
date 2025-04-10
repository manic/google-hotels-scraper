export interface GoogleHotelsOptions {
    entity: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfAdults: number;
    numberOfChildren: number;
    currencyCode: string;
    maxResults?: number;
}
