import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';

// import authRoutes from './routes/authRoutes';
// import apiRoutes from './routes/apiRoutes';
// import { tokenAuth } from './middleware/auth';
// import { handleErrors } from './middleware/errorHandler';

// ... other imports
import path from 'path';
import * as url from 'url';
import { Database, Resource, getModelByName } from "@adminjs/prisma";
import { PrismaClient } from '@prisma/client';
import {validateUser} from "./services/userService.js";
import {DefaultAuthProvider} from "adminjs";
import {componentLoader, components} from "./adminJs/component.js";
import {customImportHandler} from "./adminJs/components/importHandler.js";
import {bundleComponent} from "@adminjs/import-export";
import {buildFeature} from "adminjs";
import { postActionHandler } from './import-export-handler/utils.js';
import { importHandler } from './import-export-handler/import.handler.js';
import { importConnectivityPlannerHandler } from './import-export-handler/importConnectivityPlanner.handler.js';
import importExportFeature from './import-export-handler/importExportFeature.js';
import logger from  './scripts/logger.js';
const prisma = new PrismaClient();

// const importComponent = bundleComponent(componentLoader, 'ImportComponent');


const app = express();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

app.use(express.static(path.join(__dirname, "../public")));
AdminJS.registerAdapter({ Database, Resource });
const navigationBlock = {
  AWBNavigation: {
    name: 'AirwayBills',
  },
  tripsNavigation: {
    name: 'Trips',
  },
  hlfNavigation: {
    name: 'Hub Load Factor (HLF)',
  },
  depsNavigation: {
    name: 'DEPS',
    icon: 'Admin'
  },
  customersNavigation: {
    name: 'Customers',
    icon: 'Admin'
  },
  mastersNavigation: {
    name: 'Masters',
    icon: 'Admin'
  },
  usersNavigation : {
    name: 'Users',
    icon: 'User',
  },

  ViewFilter: {
    name: 'ViewFilter',
  }
}

const adminOptions = {
  resources: [
    {
      resource: { model: getModelByName('AirWayBill'), client: prisma },
      options: {
      properties:
      {
       id: {
         isVisible: { list: false, show: true, edit: false, filter: false }
       },
       AWBCode: {
          isTitle: true,
          position: 1,
          isVisible: { list: true, show: true, edit: false, filter: true }
       },
       consignor: {
         position: 2,
         isVisible: { list: true, show: true, edit: true, filter: true }
       },
       consignee: {
         position: 3,
         isVisible: { list: true, show: true, edit: true, filter: true }
       },
       fromBranch: {
         position: 4,
         isVisible: { list: true, show: true, edit: true, filter: true }
       },
       toBranch: {
         position: 5,
         isVisible: { list: true, show: true, edit: true, filter: true }
       },
       numOfArticles: {
         position: 6,
         isVisible: { list: true, show: true, edit: true, filter: true }
       },
       invoiceNumber: {
         position: 7,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       invoiceValue: {
         position: 8,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       ewayBillNumber: {
         position: 9,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       weightKgs: {
         position: 10,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       ratePerKg: {
         position: 11,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       rollupVolume: {
         position: 12,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       rollupWeight: {
         position: 13,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       rollupArticleCnt: {
         position: 14,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       rollupChargedWtInKgs: {
         position: 15,
         isVisible: { list: true, show: true, edit: true, filter: true }
       },
       rollupArticleWeightKg: {
         position: 16,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       chargedWeightWithCeiling: {
         position: 17,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       rollupCwWeight: {
         position: 18,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       rollupSKU: {
         position: 19,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       subTotal: {
         position: 20,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       grandTotal: {
         position: 21,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       articleGenFlag: {
         position: 22,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       contract: {
         position: 23,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       appointmentDate: {
         position: 24,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       fileUpload: {
         position: 25,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       CDM: {
         position: 26,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       completeFlag: {
         position: 27,
         isVisible: { list: false, show: true, edit: true, filter: true }
       },
       createdOn: {
         isVisible: { list: false, show: true, edit: false, filter: true }
       },
       modifiedOn: {
         isVisible: { list: false, show: true, edit: false, filter: true }
       },
     },
     navigation: navigationBlock.AWBNavigation,
      actions: {
          import: {handler: customImportHandler }
      }
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('AwbLineItem'), client: prisma },
    options: {
      properties:
       {
        id: {
          position: 1,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        AWB: {
          position: 1,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        lineItemDescription: {
          position: 2,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        numOfArticles: {
          position: 3,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        articleWeightKg: {
          position: 4,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        weightKgs: {
          position: 5,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        actualFactorWeight: {
          position: 6,
          isVisible: { list: false, show: true, edit: true, filter: true }
        },
        volumetricFactorWeight: {
          position: 7,
          isVisible: { list: false, show: true, edit: true, filter: true }
        },
        lengthCms: {
          position: 8,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        breadthCms: {
          position: 9,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        heightCms: {
          position: 10,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        volume: {
          position: 11,
          isVisible: { list: false, show: true, edit: true, filter: true }
        },
        SKUId: {
          position: 12,
          isVisible: { list: false, show: true, edit: true, filter: true }
        },
        SKUCode: {
          position: 13,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        boxType: {
          position: 14,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        ratePerBox: {
          position: 15,
          isVisible: { list: false, show: true, edit: true, filter: true }
        },
        createdOn: {
          isVisible: { list: false, show: true, edit: false, filter: true }
        },
        modifiedOn: {
          isVisible: { list: false, show: true, edit: false, filter: true }
        }
      },
      navigation: navigationBlock.AWBNavigation,
      actions: {
        import: { handler: customImportHandler }
      }
    },
    features: [
      importExportFeature({ componentLoader })
    ],
  },
  {
    resource: { model: getModelByName('AwbArticle'), client: prisma },
    options: {
      properties: {
        id: {
          isVisible: { list: true, show: true, edit: false, filter: false },
        },
        articleCode: {
          isTitle: true,
          isVisible: { list: true, show: true, edit: true, filter: false },
        },
        AWB: {
          isVisible: { list: true, show: true, edit: true, filter: false },
        },
        articleIndex: {
          isVisible: { list: true, show: true, edit: true, filter: false },
        },
        status: {
          isVisible: { list: true, show: true, edit: false, filter: false },
        },
        createdOn: {
          isVisible: { list: false, show: true, edit: false, filter: false },
        },
        modifiedOn: {
          isVisible: { list: false, show: true, edit: false, filter: false },
        },
      },
      navigation: navigationBlock.AWBNavigation,
      actions: {
        import: { handler: customImportHandler },
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('AwbArticleTripLogs'), client: prisma },
    options: {
      properties: {
        id: { position: 1, isVisible: { list: true, show: true, edit: false, filter: true } },
        AwbArticle: {
          position: 2,
          label: 'AWB Article',
          isVisible: { list: true, show: true, edit: false, filter: true },
        },
        TripDetails: {
          position: 3,
          label: 'Trip Details',
          isVisible: { list: true, show: true, edit: false, filter: true },
        },
        TripLineItem: {
          position: 4,
          label: 'Trip Line Item',
          isVisible: { list: true, show: true, edit: false, filter: true },
        },
        scanType: {
          position: 5,
          label: 'Scan Type',
          isVisible: { list: true, show: true, edit: false, filter: true },
        },
        createdOn: {
          position: 6,
          label: 'Created On',
          isVisible: { list: true, show: true, edit: false, filter: true },
        },
      },
      navigation: navigationBlock.AWBNavigation,
      actions: {
        import: { handler: customImportHandler },
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('TripDetails'), client: prisma },
    options: {
      properties: {
        id: {
          position: 1,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        tripCode: {
          isRequired: true,
          isTitle: true,
          position: 2,
          isVisible: { list: true, show: true, edit: true, filter: true }

        },
        route: {
          position: 3,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        tripStatus: {
          position: 4,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        vehicle: {
          isRequired: true,
          position: 5,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        vendor: {
          isRequired: true,
          position: 6,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        checkinBranch: {
          position: 7,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        latestCheckinType: {
          position: 8,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        latestCheckinTime: {
          position: 9,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        costPerKg: {
          position: 10,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        localTripNumber: {
          position: 11,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        ftlLocalNumber: {
          position: 12,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        numberOfAwb: {
          position: 13,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        numberOfArticles: {
          position: 14,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        chargedWeight: {
          position: 15,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        hireAmount: {
          position: 16,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        advanceAmount: {
          position: 17,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        tdsAmount: {
          position: 18,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        balance: {
          position: 19,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        openingKms: {
          position: 20,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        closingKms: {
          position: 21,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        totalKms: {
          position: 22,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        tripClosingTime: {
          position: 23,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        documentStatus: {
          position: 24,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        invoiceStatus: {
          position: 25,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        remarks: {
          position: 26,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        paymentReqDate: {
          position: 27,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        utrDetails: {
          position: 28,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        ePODsCleared: {
          position: 29,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        originalPODReceived: {
          position: 30,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        createdOn: {
          position: 31,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        modifiedOn: {
          position: 32,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        driver:{
          isRequired: true,
          position: 33,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        originBranch: {
          position: 34,
          isVisible: { list: false, show: true, edit: true, filter: false }
        }
      },
      navigation: navigationBlock.tripsNavigation,
      actions: {
        new: {
          layout: [  "tripCode", "route", "vendor", "vehicle", "driver", "originBranch", "localTripNumber", "ftlLocalNumber", "hireAmount", "advanceAmount", "tdsAmount", "balance"]  // Array with the properties
        },
        import: { handler: customImportHandler },
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('TripLineItem'), client: prisma },
    options: {
      properties: {
        id: { position: 1, isVisible: { list: false, show: true, edit: false, filter: true } },
        trip: { position: 2, isVisible: { list: true, show: true, edit: true, filter: true } },
        AirWayBill: {isTitle: true, position: 3, isVisible: { list: true, show: true, edit: true, filter: true } },
        status: { position: 4, label: 'AirwayBill (AWB)', isVisible: { list: true, show: true, edit: true, filter: true } },
        loadlocation: { position: 5, label: 'Load Location', isVisible: { list: true, show: true, edit: true, filter: true } },
        nextBranch: { position: 6, label: 'Unload Location', isVisible: { list: true, show: true, edit: true, filter: true } },
        finalBranch: { position: 7, isVisible: { list: true, show: true, edit: true, filter: true } },
        ePODReceived: { position: 8, label: 'ePODs Received', isVisible: { list: true, show: true, edit: true, filter: true } },
        originalPODReceived: { position: 9, label: 'Original POD Received', isVisible: { list: true, show: true, edit: true, filter: true } },
        rollupScanCount: { position: 10, isVisible: { list: false, show: true, edit: true, filter: true } },
        rollupDepsCount: { position: 11, isVisible: { list: false, show: true, edit: true, filter: true } },
        latestScanTime: { position: 12, isVisible: { list: false, show: true, edit: true, filter: true } },
        modifiedOn: {
          position: 13,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        createdOn: {
          position: 14,
          isVisible: { list: true, show: true, edit: false, filter: true }
        }
      },
      navigation: navigationBlock.tripsNavigation,
      actions: {
        ImportConnectivityPlanner: { handler: postActionHandler(importConnectivityPlannerHandler),
          component: components.connectivitPlanner,
          actionType: 'resource',
        },
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('TripCheckIn'), client: prisma },
    options: {
      properties: {
        id: { position: 1, isVisible: { list: true, show: true, edit: false, filter: true } },
        trip: { position: 2, isVisible: { list: true, show: true, edit: true, filter: true } },
        type: { position: 3, isVisible: { list: true, show: true, edit: true, filter: true } },
        branch: { position: 4, isVisible: { list: true, show: true, edit: true, filter: true } },
        odometerReading: { position: 5, isVisible: { list: true, show: true, edit: true, filter: true } },
        FileUpload: { position: 6, label: 'File Upload', isVisible: { list: true, show: true, edit: true, filter: false } },
        time: { position: 7, isVisible: { list: true, show: true, edit: true, filter: true } },
        createdOn: { position: 8, isVisible: { list: false, show: true, edit: false, filter: false } },
        modifiedOn: { position: 9, isVisible: { list: false, show: true, edit: false, filter: false } },
      },
      navigation: navigationBlock.tripsNavigation,
      actions: {
        import: { handler: customImportHandler },
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('VendorMaster'), client: prisma },
    options: {
      properties: {
        id: { position: 1, isVisible: { list: true, show: true, edit: false, filter: true } },
        vendorName: { isTitle: true, position: 2, label: 'Vendor Name', isVisible: { list: true, show: true, edit: true, filter: true } },
        vendorCode: { position: 3, label: 'Vendor Code', isVisible: { list: true, show: true, edit: true, filter: true } },
        publicName: {  position: 4, label: 'Public Name', isVisible: { list: false, show: true, edit: true, filter: true } },
        address1: { position: 5, isVisible: { list: false, show: true, edit: true, filter: true } },
        city: { position: 6, isVisible: { list: true, show: true, edit: true, filter: true } },
        state: { position: 7, isVisible: { list: false, show: true, edit: true, filter: true } },
        Pincode: { position: 8, label: 'Pincode', isVisible: { list: false, show: true, edit: true, filter: true } },
        gstNumber: { position: 9, label: 'GST Number', isVisible: { list: false, show: true, edit: true, filter: true } },
        panNumber: { position: 10, label: 'PAN Number', isVisible: { list: false, show: true, edit: true, filter: true } },
        tanNumber: { position: 11, label: 'TAN Number', isVisible: { list: false, show: true, edit: true, filter: true } },
        tdsPercentageSlab: { position: 12, label: 'TDS Percentage Slab', isVisible: { list: false, show: true, edit: true, filter: true } },
        contactPerson: { position: 13, label: 'Contact Person', isVisible: { list: false, show: true, edit: true, filter: true } },
        phone1: { position: 14, label: 'Phone 1', isVisible: { list: true, show: true, edit: true, filter: true } },
        phone2: { position: 15, label: 'Phone 2', isVisible: { list: true, show: true, edit: true, filter: true } },
        email: { position: 16, isVisible: { list: false, show: true, edit: true, filter: true } },
        accountHolderName: { position: 17, label: 'Account Holder Name', isVisible: { list: false, show: true, edit: true, filter: true } },
        bankName: { position: 18, label: 'Bank Name', isVisible: { list: false, show: true, edit: true, filter: true } },
        branchName: { position: 19, label: 'Branch Name', isVisible: { list: false, show: true, edit: true, filter: true } },
        bankAddress: { position: 20, label: 'Bank Address', isVisible: { list: false, show: true, edit: true, filter: true } },
        branchPincode: { position: 21, label: 'Branch Pincode', isVisible: { list: false, show: true, edit: true, filter: true } },
        accountNumber: { position: 22, label: 'Account Number', isVisible: { list: false, show: true, edit: true, filter: true } },
        ifscCode: { position: 23, label: 'IFSC Code', isVisible: { list: false, show: true, edit: true, filter: true } },
        servicesOffered: { position: 24, label: 'Services Offered', isVisible: { list: true, show: true, edit: true, filter: true } },
        createdOn: { position: 25, isVisible: { list: false, show: true, edit: false, filter: false } },
        modifiedOn: { position: 26, isVisible: { list: false, show: true, edit: false, filter: false } },
      },
      navigation: navigationBlock.tripsNavigation,
      actions: {
        import: { handler: customImportHandler },
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('DriverMaster'), client: prisma },
    options: {
      properties: {
        id: { position: 1, isVisible: { list: true, show: true, edit: false, filter: true } },
        driverName: {isTitle: true, position: 2, label: 'Driver Name', isVisible: { list: true, show: true, edit: true, filter: true } },
        phone1: { position: 3, label: 'Phone 1', isVisible: { list: true, show: true, edit: true, filter: true } },
        phone2: { position: 4, label: 'Phone 2', isVisible: { list: true, show: true, edit: true, filter: true } },
        licenseNumber: { position: 5, label: 'License Number', isVisible: { list: false, show: true, edit: true, filter: true } },
        panNumber: { position: 6, label: 'PAN Number', isVisible: { list: false, show: true, edit: true, filter: true } },
        aadharNumber: { position: 7, label: 'Aadhar Number', isVisible: { list: false, show: true, edit: true, filter: true } },
        address1: { position: 8, label: 'Address 1', isVisible: { list: true, show: true, edit: true, filter: true } },
        city: { position: 9, isVisible: { list: true, show: true, edit: true, filter: true } },
        state: { position: 10, isVisible: { list: false, show: true, edit: true, filter: true } },
        district: { position: 11, isVisible: { list: false, show: true, edit: true, filter: true } },
        Pincode: { position: 12, label: 'Pincode', isVisible: { list: false, show: true, edit: true, filter: true } },
        createdOn: { position: 13, isVisible: { list: false, show: true, edit: false, filter: false } },
        modifiedOn: { position: 14, isVisible: { list: false, show: true, edit: false, filter: false } },
      },
      navigation: navigationBlock.tripsNavigation,
      actions: {
        new: {
          layout: ['driverName', 'phone1', 'licenseNumber', 'aadharNumber'],
        },
        import: { handler: customImportHandler },
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('VehicleMaster'), client: prisma },
    options: {
      properties: {
        id: { position: 1, isVisible: { list: true, show: true, edit: false, filter: true } },
        vehicleNum: { isTitle: true, position: 2, label: 'Vehicle Number', isVisible: { list: true, show: true, edit: true, filter: true } },
        vehicleType: { position: 3, label: 'Vehicle Type', isVisible: { list: true, show: true, edit: true, filter: true } },
        vehicleCapacity: { position: 4, label: 'Vehicle Capacity', isVisible: { list: true, show: true, edit: true, filter: true } },
        vehiclePermit: { position: 5, label: 'Vehicle Permit', isVisible: { list: true, show: true, edit: true, filter: true } },
        vendor: { position: 6, isVisible: { list: true, show: true, edit: true, filter: true } },
        createdOn: { position: 7, isVisible: { list: false, show: true, edit: false, filter: false } },
        modifiedOn: { position: 8, isVisible: { list: false, show: true, edit: false, filter: false } },
      },
      navigation: navigationBlock.tripsNavigation,
      actions: {
        new: {
          layout: ['vehicleNum', 'vehicleType', 'vehicleCapacity', 'vehiclePermit', 'vendor' ]
        },
        import: { handler: customImportHandler },
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('HLFLineItem'), client: prisma },
    options: {
      properties: {
        id: { position: 1, isVisible: { list: false, show: true, edit: false, filter: false } },
        AirWayBill: {
          position: 2,
          label: 'AWB',
          isVisible: { list: true, show: true, edit: true, filter: true },
        },
        branch: {
          position: 3,
          isVisible: { list: true, show: true, edit: true, filter: true },
        },
        AWBCWeightInKgs: {
          position: 4,
          label: 'AWB Weight In Kgs',
          isVisible: { list: true, show: true, edit: true, filter: true },
        },
        AWBVolumeInKgs: {
          position: 5,
          label: 'AWB Volume In Kgs',
          isVisible: { list: true, show: true, edit: true, filter: true },
        },
        createdOn: {
          position: 6,
          label: 'Created On',
          isVisible: { list: false, show: true, edit: false, filter: false },
        },
        modifiedOn: {
          position: 7,
          label: 'Modified On',
          isVisible: { list: false, show: true, edit: false, filter: false },
        },
      },
      navigation: navigationBlock.hlfNavigation,
      actions: {
        import: { handler: customImportHandler },
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },

  {
    resource: { model: getModelByName('DEPS'), client: prisma },
    options: {
      properties: {
        id: {
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        DEPSType: {
          position: 1,
          isVisible: { list: true, show: true, edit: false, filter: true }
        },
        DEPSSubType: {
          position: 2,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        depsStatus: {
          position: 3,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        caseComment: {
          position: 4,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        AirWayBill: {
          position: 5,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        HLFLineItem: {
          position: 6,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        trip: {
          position: 7,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        numberOfDepsArticles: {
          position: 8,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        vehicle: {
          position: 9,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        connectedDate: {
          position: 10,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        branch: {
          position: 11,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        loadUser: {
          position: 12,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        unloadUser: {
          position: 13,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        sealNumber: {
          position: 14,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        createdOn: {
          position: 15,
          isVisible: { list: false, show: true, edit: false, filter: true }
        },
        modifiedOn: {
          position: 16,
          isVisible: { list: false, show: true, edit: false, filter: true }
        },
      },
      navigation: navigationBlock.depsNavigation,
      actions: {
        import: { handler: customImportHandler }
      }
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('DEPSImages'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.depsNavigation
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('Consignor'), client: prisma },
    options: {
      properties: {
        consignorId: {
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        consignorCode: {
          position: 1,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        publicName: {
          isTitle: true,
          position: 2,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        legalName: {
          position: 3,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        industryType: {
          position: 4,
          isVisible: { list: false, show: true, edit: true, filter: true }
        },
        commodity: {
          position: 5,
          isVisible: { list: false, show: true, edit: true, filter: true }
        },
        address1: {
          position: 6,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        address2: {
          position: 7,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        city: {
          position: 8,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        disstrict: {
          position: 9,
          isVisible: { list: false, show: true, edit: true, filter: true }
        },
        state: {
          position: 10,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        gstNumber: {
          position: 11,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        panNumber: {
          position: 12,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        tanNumber: {
          position: 13,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        cinNumber: {
          position: 14,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        gst: {
          position: 15,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        gstExemptFile: {
          position: 16,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        taxCategory: {
          position: 17,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        parentConsignor: {
          position: 18,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        branch: {
          position: 19,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        wareHouse: {
          position: 20,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        keyContactName: {
          position: 21,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        keyContactDesignation: {
          position: 22,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        keyContactAddress: {
          position: 23,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        distanceFromBranchKms: {
          position: 24,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        createdOn: {
          position: 25,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        modifiedOn: {
          position: 26,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
      },
      navigation: navigationBlock.customersNavigation,
      actions: {
        import: { handler: customImportHandler }
      }
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('Consignee'), client: prisma },
    options: {
      properties: {
        consigneeId: {
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        consigneeName: {
          isTitle: true,
          position: 1,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        consignor: {
          position: 2,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        email: {
          position: 3,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        phone1: {
          position: 4,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        phone2: {
          position: 5,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        address1: {
          position: 6,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        address2: {
          position: 7,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        city: {
          position: 8,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        district: {
          position: 9,
          isVisible: { list: false, show: true, edit: true, filter: true }
        },
        state: {
          position: 10,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        branch: {
          position: 11,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        distanceToBranchKms: {
          position: 12,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        odaType: {
          position: 13,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        tatNumber: {
          position: 14,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        createdOn: {
          position: 15,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        modifiedOn: {
          position: 16,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
      },
      navigation: navigationBlock.customersNavigation,
      actions: {
        import: { handler: customImportHandler }
      }
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('Contract'), client: prisma },
    options: {
      properties: {
        id: {
          position: 1,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        consignorId: {
          position: 2,
          isVisible: { list: false, show: true, edit: true, filter: true }
        },
        consignor: {
          position: 3,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        consignorContractType: {
          position: 4,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        ContractType: {
          position: 5,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        isActive: {
          position: 6,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        startDate: {
          position: 7,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        endDate: {
          position: 8,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        PTlRateType: {
          position: 9,
          isVisible: { list: false, show: true, edit: true, filter: false }
        },
        monthlyMinCommitVolume: {
          position: 10,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        minimumAWBValue: {
          position: 11,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        docketChargeValue: {
          position: 12,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        fovOfCoustomersInvoiceValue: {
          position: 13,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        liabilityClause: {
          position: 14,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        articleChargeMandatory: {
          position: 15,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        articleChargeMinAmount: {
          position: 16,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        articleChargeMaxAmount: {
          position: 17,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        actualWeightFactor: {
          position: 18,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        volumetricWeightFactor: {
          position: 19,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        cwCeiling: {
          position: 20,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        createdOn: {
          position: 21,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        modifiedOn: {
          position: 22,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        AWBContractTypes: {
          position: 23,
          isVisible: { list: false, show: true, edit: false, filter: false }
        }
      },
      navigation: navigationBlock.customersNavigation,
      actions: {
        import: { handler: customImportHandler }
      }
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('ConsignorRateTable'), client: prisma },
    options: {
      properties: {
        id: {
          position: 1,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        consignorId: {
          position: 2,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        consignor: {
          position: 3,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        branchId: {
          position: 4,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        branch: {
          position: 5,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        ratePerKg: {
          position: 6,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        ratePerBox: {
          position: 7,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        boxType: {
          position: 8,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        status: {
          position: 9,
          isVisible: { list: true, show: true, edit: true, filter: true }
        },
        createdOn: {
          position: 10,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
        modifiedOn: {
          position: 11,
          isVisible: { list: false, show: true, edit: false, filter: false }
        },
      },
      navigation: navigationBlock.customersNavigation,
      actions: {
        import: { handler: customImportHandler }
      }
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('SKU'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.customersNavigation,
      properties: {
        branchName: {
          isTitle: true,
        }
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('ODA'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.customersNavigation,
      properties: {
        branchName: {
          isTitle: true,
        }
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('User'), client: prisma },
    options: {
      actions: {
        import: { handler: customImportHandler }
      },
      navigation: navigationBlock.usersNavigation,
      properties: {
        id: { position: 1, isVisible: { list: false, show: true, edit: false, filter: false } },
        employeeId: { position: 2, isVisible: { list: true, show: true, edit: true, filter: true } },
        hashedPassword: { position: 3, isVisible: { list: false, show: true, edit: true, filter: false } },
        firstName: { position: 4, isVisible: { list: true, show: true, edit: true, filter: true } },
        lastName: { position: 5, isVisible: { list: true, show: true, edit: true, filter: true } },
        email: { position: 6, isVisible: { list: true, show: true, edit: true, filter: true } },
        phone1: { position: 7, isVisible: { list: true, show: true, edit: true, filter: true } },
        phone2: { position: 8, isVisible: { list: true, show: true, edit: true, filter: true } },
        title: { position: 9, isVisible: { list: true, show: true, edit: true, filter: true } },
        role: { position: 10, isVisible: { list: true, show: true, edit: true, filter: true } },
        profile: { position: 11, isVisible: { list: true, show: true, edit: true, filter: true } },
        isActiveUser: { position: 12, isVisible: { list: true, show: true, edit: true, filter: true } },
        address1: { position: 13, isVisible: { list: true, show: true, edit: true, filter: true } },
        address2: { position: 14, isVisible: { list: true, show: true, edit: true, filter: true } },
        cityId: { position: 15, isVisible: { list: true, show: true, edit: true, filter: true } },
        city: { position: 16, isVisible: { list: true, show: true, edit: true, filter: true } },
        districtId: { position: 17, isVisible: { list: true, show: true, edit: true, filter: true } },
        district: { position: 18, isVisible: { list: true, show: true, edit: true, filter: true } },
        stateId: { position: 19, isVisible: { list: true, show: true, edit: true, filter: true } },
        state: { position: 20, isVisible: { list: true, show: true, edit: true, filter: true } },
        createdOn: { position: 21, isVisible: { list: true, show: true, edit: false, filter: true } },
        depsLoadingUserIds: { position: 22, isVisible: { list: false, show: true, edit: true, filter: false } },
        depsUnloadingUserIds: { position: 23, isVisible: { list: false, show: true, edit: true, filter: false } }
      }
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('Branch'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.mastersNavigation,
      properties: {
        branchName: {
          isTitle: true,
        }
      },
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('CityMaster'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.mastersNavigation,
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },{
    resource: { model: getModelByName('DistrictMaster'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.mastersNavigation,
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },{
    resource: { model: getModelByName('StateMaster'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.mastersNavigation,
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('PincodesMaster'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.mastersNavigation,
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },{
    resource: { model: getModelByName('GstMaster'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.mastersNavigation,
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('CommodityMaster'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.mastersNavigation,
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
  {
    resource: { model: getModelByName('IndustryTypeMaster'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.mastersNavigation,
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
{
    resource: { model: getModelByName('FileUpload'), client: prisma },
    options: {
      actions: {
        import: {handler: customImportHandler }
      },
      navigation: navigationBlock.mastersNavigation
    },
    features: [
      importExportFeature({ componentLoader }),
    ],
  },
    {
      resource: { model: getModelByName('ViewHubLoadFactor'), client: prisma },
      options: {
        navigation: navigationBlock.ViewFilter
      },
      features: [
        importExportFeature({ componentLoader }),
      ],
    },

  ],
  branding: {
    companyName: 'Vroomster Private Ltd.',
  },
  assets: {
    styles: ["/adminjstheme.css"],
},
  componentLoader
}


// app.use('/uploads', express.static(path.join(__dirname,'..','uploads')));

// app.use(express.json());
// app.use('/auth', authRoutes);
// app.use('/api',tokenAuth, apiRoutes);
// app.use(handleErrors);

const PORT = process.env.PORT || 3001;

// app.listen(PORT, () => {
//   console.log(`Server is running on port number ${PORT}`);
// });

const admin = new AdminJS(adminOptions)
admin.watch();

const authenticate = async (employeeId: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { employeeId } });

  if (!user) {
    return null;
  }
  const response = await validateUser(employeeId, password);

  if (response?.isValid){
    return user;
  }
  else {
    return null;
  }
};


//const adminRouter = AdminJSExpress.buildRouter(admin);
const router = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate: async (employeeId, password) => {
    const user = await authenticate(employeeId, password);
    if (user) {
      return { ...user, email: user.email }; // AdminJS requires email field
    }
    return null;
    },
  cookiePassword: 'iodfhglkhjdfkjlgndfogoeffdslkjfl435345dksfj',
  },
    null,
    {
      secret: 'test',
      resave: false,
      saveUninitialized: true,

    });

app.use(admin.options.rootPath, router);

app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  next(err);
});
app.listen(PORT, () => {
  console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`);
})
