export interface Inwarded {
    AWBId: number;
    latestCheckinHubId: number;
    tripLineItemId: number;
  }


  export interface Outwarded {
    AWBId: number;
    nextDestinationId: number;
    tripLineItemId: number;
    latestCheckinHubId: number;
  }