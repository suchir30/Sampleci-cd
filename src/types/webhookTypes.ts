
export type WebhookPayload =
  | {
      event: 'trip/add';
      eventTime: Date;
      eventId: string;
      data: { trip: TripObject };
    }
  | {
      event: 'trip/update';
      eventTime: Date;
      eventId: string;
      data: { trip: TripObject };
    }
  | {
      event: 'vendor/add';
      eventTime: Date;
      eventId: string;
      data: { vendor: VendorObject };
    }
  | {
      event: 'vendor/update';
      eventTime: Date;
      eventId: string;
      data: { vendor: VendorObject };
    }
  | {
      event: 'vehicle/add';
      eventTime: Date;
      eventId: string;
      data: { vehicle: VehicleObject };
    }
  | {
      event: 'vehicle/update';
      eventTime: Date;
      eventId: string;
      data: { vehicle: VehicleObject };
    };

export type TripObject = {
        id: string;
        createdTime: Date;
        autoIdentifier: string;
        autoIdentifierNumber: number;
        identifier: string | null;
        fromPlace: string | null;
        toPlace: string | null;
        stops: string[];
        comment: string | null;
        tripStatus: TripStatus;
        consignorName: string | null;
        consigneeName: string | null;
        consignorGstin: string | null;
        consigneeGstin: string | null;
        distanceKm: number | null;
        odometerStartKm: number | null;
        odometerEndKm: number | null;
        bookingFreight: number | null;
        tripCode:string | null;
      
        broker: {
          id: string;
          autoIdentifier: string;
          identifier: string | null;
        } | null;
      
        driver: {
          id: string;
          autoIdentifier: string;
          identifier: string | null;
        } | null;
      
        vehicleOwner: {
          id: string;
          autoIdentifier: string;
          identifier: string | null;
        } | null;
      
        vehicle: {
          id: string;
          autoIdentifier: string;
          registrationNumber: string;
        } | null;
      
        customFieldValues: {
          [id: string]: any;
        };
      };
      
      type TripStatus =
        | 'NEW'
        | 'CLOSED' // terminal state
        | 'CANCELLED' // terminal state
        | 'VEHICLE_ASSIGNED'
        | 'VEHICLE_NOT_ASSIGNED'
        | 'LOADING'
        | 'IN_TRANSIT'
        | 'REPORTED'
        | 'UNLOADED'
        | 'BREAKDOWN'
        | 'IN_REPAIR'
        | 'ACCIDENT'
        | 'DELAYED'
        | 'DETAINED';
      


export type VendorObject = {
     id: string;
     createdTime: Date;
     autoIdentifier: string;
     autoIdentifierNumber: number;
     identifier: string | null;
     name: string;
     phone: string | null;
     type: string;
  // Add other vendor properties here
};

export type VehicleObject = {
  id: string;
  createdTime: Date;
  autoIdentifier: string;
  autoIdentifierNumber: number;
  registrationNumber: string;
};

