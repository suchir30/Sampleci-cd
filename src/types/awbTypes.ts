export interface AWBCreateData {
    AWBCode: string;
    consignorId: number;
    consigneeId?: number;
    fromBranchId: number;
    toBranchId: number;
    numOfArticles: number;
}