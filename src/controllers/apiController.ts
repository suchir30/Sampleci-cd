import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as masterDataService from '../services/masterDataService';
import * as consignorService from '../services/consignorService';
import * as consigneeService from '../services/consigneeService';
import * as AWBService from '../services/AWBService';
import * as tripService from '../services/tripService';
import * as PODService from '../services/PODService';
import * as invoiceAWB from '../services/invoiceAWB';
// import * as pricingServices from '../services/pricingServices';
import { AWBCreateData } from '../types/awbTypes';
import { HttpStatusCode } from '../types/apiTypes';
import { MulterFile } from '../types/multerTypes';
import { WebhookPayload } from '../types/webhookTypes'; 
import { connectivityPlanData } from '../types/connectivityDataType';
import { Inwarded, Outwarded } from '../types/outwardInwardTypes';
import { buildNoContentResponse, buildObjectFetchResponse, throwValidationError } from '../utils/apiUtils';
import { Consignee, Consignor, AwbLineItem, DEPS,ArticleLogsScanType } from '@prisma/client';
import { AWBPdfGenerator } from "../services/pdfGeneratorAWB";
import { tripsPdfGenerator } from '../services/pdfGeneratorTrips';
import { tripHirePdfGenerator } from '../services/pdfGeneratorTripHire';

import {UploadResult} from "../services/fileService.js";
import {handleFileUpload, refreshSignedUrlIfNeeded, uploadPDF,fileUploadRes} from "../services/fileService";
import { float } from 'aws-sdk/clients/cloudfront';
import { Datetime } from 'aws-sdk/clients/costoptimizationhub';


import * as fileService from '../services/fileService'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";

export const getIndustryTypes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const industryTypes = await masterDataService.getIndustryTypes();
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(industryTypes));
  } catch (err) {
    console.error('Error retrieving industry types:', err);
    next(err);
  }
}
export const getCommodities = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const commodities = await masterDataService.getCommodities();
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(commodities));
  } catch (err) {
    console.error('Error retrieving commodities:', err);
    next(err);
  }
}

export const getCities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cities = await masterDataService.getCities();
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(cities));
  } catch (err) {
    console.error('Error retrieving cities:', err);
    next(err);
  }
}

export const getDistricts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const districts = await masterDataService.getDistricts();
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(districts));
  } catch (err) {
    console.error('Error retrieving districts:', err);
    next(err);
  }
}

export const getStates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const states = await masterDataService.getStates();
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(states));
  } catch (err) {
    console.error('Error retrieving states:', err);
    next(err);
  }
}

export const getPincodes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pincodes = await masterDataService.getPincodes();
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(pincodes));
  } catch (err) {
    console.error('Error retrieving pincodes:', err);
    next(err);
  }
}


export const getBranches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isHub: boolean = req.body.isHub;
    const isConsignorPickupPoint: boolean = req.body.isConsignorPickupPoint;
    const branches = await masterDataService.getBranches(isHub,isConsignorPickupPoint);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(branches));
  } catch (err) {
    console.error('Error retrieving branches:', err);
    next(err);
  }
}

export const getGstList = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const gstListRes = await masterDataService.getGstList();
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(gstListRes));
  } catch (err) {
    console.error('Error retrieving consignees:', err);
    next(err)
  }
}

export const getEmployees = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const getEmployeesRes = await masterDataService.getEmployees();
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getEmployeesRes));
  } catch (err) {
    console.error('Error retrieving consignees:', err);
    next(err)
  }
}

export const getConsignorBranches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consignorId: number = req.body.consignorId;
    if (!consignorId) {
      throwValidationError([{ message: "No Consignor Id Provided." }]);
    }
    const getConsignorBranchesRes = await masterDataService.getConsignorBranches(consignorId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getConsignorBranchesRes));
  } catch (err) {
    console.error('Error retrieving consignees:', err);
    next(err)
  }
}
export const addConsignorBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consignorId: number = req.body.consignorId;
    const branchId: number = req.body.branchId;
    if (!consignorId) {
      throwValidationError([{ message: "No Consignor Id Provided." }]);
    }
    const addConsignorBranchRes = await masterDataService.addConsignorBranch(consignorId, branchId);
    if (addConsignorBranchRes == 'Already Exists') {
      throwValidationError([{ message: "Branch Already Exists " }]);
    }
    else {
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("Added Successfully"));
    }
  } catch (err) {
    console.error('Error retrieving consignees:', err);
    next(err)
  }
}
export const getConsignors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consignorId: number = req.body.consignorId
    const consignors = await consignorService.getConsignors(consignorId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(consignors));
  } catch (err) {
    console.error('ERROR retrieving consignors:', err);
    next(err)
  }
}
export const createConsignors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consignorsData: Consignor[] = req.body.consignorsDatax || [];
    const errors: { message: string, key?: string }[] = [];

    if (!consignorsData.length) {
      throwValidationError([{ message: "No consignors provided." }]);
    }
    consignorsData.forEach((consignor: Consignor, index: number) => {
      if (!consignor.legalName) {
        errors.push({ message: `Mandatory field 'legalName' is missing for consignor at index ${index}`, key: `consignorsData[${index}].legalName` });
      }
      if (!consignor.publicName) {
        errors.push({ message: `Mandatory field 'publicName' is missing for consignor at index ${index}`, key: `consignorsData[${index}].publicName` });
      }

    });

    if (errors.length > 0) {
      throwValidationError(errors);
    }
    const createConsignorsRes = await consignorService.createConsignors(consignorsData);
    console.log(createConsignorsRes, "ctrl**")
    if (createConsignorsRes == "alreadyExists") {
      throwValidationError([{ message: "Provided Consignor Code Already Exists" }]);
    }
    else {
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("Consignor Created Successful"));
    }
  } catch (err) {
    console.error('Error creating consignors:', err);
    next(err);
  }
}
export const getConsignees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consignorId: number = req.body.consignorId;
    const toBranchId: number = req.body.toBranchId;

    if (!consignorId) {
      throwValidationError([{ message: "No Consignor Id Provided." }]);
    }
    const consignees = await consigneeService.getConsignees(consignorId, toBranchId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(consignees));
  } catch (err) {
    console.error('Error retrieving consignees:', err);
    next(err)
  }
}

export const createConsignees = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const consigneesData: Consignee[] = req.body.consignees || [];
    //const consigneesData = req.body.consignees;
    const errors: { message: string, key?: string }[] = [];
    consigneesData.forEach((consignee: any, index: number) => {
      if (!consignee.consignorId) {
        errors.push({ message: `Mandatory field 'consignorId' is missing for consignees`, key: `consigneesData[${index}].consignorId` });
      }
      if (!consignee.consigneeName) {
        errors.push({ message: `Mandatory field 'consigneeName' is missing for consignees`, key: `consigneesData[${index}].consigneeName` });
      }
      // if (!consignee.consigneeCode) {
      //   errors.push({ message: `Mandatory field 'consigneeCode' is missing for consignees`, key: `consigneesData[${index}].consigneeCode` });
      // }
    });
    if (errors.length > 0) {
      throwValidationError(errors);
    }
    const createConsigneesRes = await consigneeService.createConsignees(consigneesData);
    if (createConsigneesRes == "alreadyExists") {
      throwValidationError([{ message: "Provided Consignee Code Already Exists" }]);
    }
    else {
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("Consignee Created Successful"));
    }

  } catch (err) {
    console.error('Error creating consignees:', err);
    next(err)
  }
}

export const getGeneratedAWB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consignorId: number = req.body.consignorId;

    const AWBStatus: string[] = req.body.AWBStatus;
    const validAWBStatusValues = ['PickUp', 'InTransit', 'atHub', 'Delivered','Cancelled'];

   // Check if AWBStatus is an array and ensure each value is valid
   if (!Array.isArray(AWBStatus) || !AWBStatus.every(status => validAWBStatusValues.includes(status))) {
    throwValidationError([{ message: "Invalid AWBStatus provided." }]);
  }

    const getGeneratedAWBRes = await AWBService.getGeneratedAWB(consignorId, AWBStatus);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getGeneratedAWBRes));
  } catch (err) {
    console.error('Error retrieving consignees:', err);
    next(err)
  }
}




export const generateBulkAWBForConsignor = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const { consignorId, awbData }: { consignorId: number, awbData: AWBCreateData[] } = req.body;
    const errors: { message: string, key?: string }[] = [];
    awbData.forEach((awbData: any, index: number) => {
      if (!awbData.toBranchId) {
        errors.push({ message: `Mandatory field 'toBranchId' is missing for consignee`, key: `consigneesData[${index}].toBranchId` });
      }
      if (!awbData.numOfArticles) {
        errors.push({ message: `Mandatory field 'numOfArticles' is missing for consignee`, key: `consigneesData[${index}].numOfArticles` });
      }
    });
    if (errors.length > 0) {
      throwValidationError(errors);
    }
    await AWBService.generateBulkAWBForConsignor(consignorId, awbData);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("Generated AWB"));
  } catch (err) {
    console.error('Error generateBulkAWBForConsignor', err);
    next(err)
  }
}

export const updateArticleCountForAWB = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const errors: { message: string, key?: string }[] = [];
    const { AWBId, newArticleCount }: { AWBId: number, newArticleCount: number } = req.body;
    if (!AWBId) {
      errors.push({ message: `Mandatory field 'AWBId' is missing`, key: `AWBId` });
    }
    if (!newArticleCount) {
      errors.push({ message: `Mandatory field 'newArticleCount' is missing`, key: `newArticleCount` });
    }
    if (errors.length > 0) {
      throwValidationError(errors);
    }
    const result = await AWBService.updateArticleCountForAWB(AWBId, newArticleCount);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(result));
  } catch (err) {
    console.error('Error updateArticleCountForAWB', err);
    next(err)
  }
}

export const getAWBArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number = req.body.AWBId;
    if (!AWBId) {
      throwValidationError([{ message: "No AWBId Provided." }]);
    }
    const getAWBArticlesRes = await AWBService.getAWBArticles(AWBId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getAWBArticlesRes));
  } catch (err) {
    console.error('Error retrieving consignees:', err);
    next(err)
  }
}

export const generateAWBArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number = req.body.AWBId;
    if (!AWBId) {
      throwValidationError([{ message: `Mandatory field AWBid is missing` }]);
    }
    const result = await AWBService.generateAWBArticles(AWBId);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("Generated AWB Articles"));
  } catch (err) {
    console.error('Error generateAWBArticles', err);
    next(err)
  }

}

export const addAWBArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number = req.body.AWBId;
    const numArticlesToAdd: number = req.body.numArticlesToAdd
    if (!AWBId || !numArticlesToAdd) {
      if (!AWBId) {
        throwValidationError([{ message: `Mandatory field AWBId is missing` }]);
      } else {
        throwValidationError([{ message: `Mandatory field numArticlesToAdd is missing` }]);
      }
    }
    const result = await AWBService.addAWBArticles(AWBId, numArticlesToAdd);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("Added AWB Articles"));
  } catch (err) {
    console.error('Error addAWBArticles', err);
    next(err)
  }
}

export const markAWBArticlesAsPrinted = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number = req.body.AWBId;
    if (!AWBId) {
      throwValidationError([{ message: `Mandatory fields AWBId missing` }]);
    }
    await AWBService.markAWBArticlesAsPrinted(AWBId);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWB Articles Printed Successfully"));
  } catch (err) {
    console.error('Error markAWBArticlesAsPrinted', err);
    next(err)
  }

}

export const markAWBArticleAsDeleted = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articleId: number = req.body.articleId;
    const AWBId: number = req.body.AWBId;
    if (!AWBId || !articleId) {
      if (!AWBId) {
        throwValidationError([{ message: `Mandatory field AWBId is missing` }]);
      } else {
        throwValidationError([{ message: `Mandatory field articleId is missing` }]);
      }
    }
    const result = await AWBService.markAWBArticleAsDeleted(articleId, AWBId);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWB Articles Deleted Successfully"));
  } catch (err) {
    console.error('Error markAWBArticlesAsDeleted', err);
    next(err)
  }
}
export const assignedTriptoAWB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number = req.body.AWBId
    const tripId: number = req.body.tripId
    const status: string = req.body.status
    const loadLocationId: number = req.body.loadLocationId
    const finalDestinationId: number = req.body.finalDestinationId  //toBranch(ConsigneeBranch)
    if (!AWBId) {
      throwValidationError([{ message: `Mandatory field AWBId is missing` }]);
    }
    if (!tripId) {
      throwValidationError([{ message: `Mandatory field AWBId is missing` }]);
    }
    if (status != "Assigned") {
      throwValidationError([{ message: `Please check the status, it should be Assigned` }]);
    }
    if (!loadLocationId) {
      throwValidationError([{ message: "Mandatory field loadLocation is missing" }]);
    }
    if (!finalDestinationId) {
      throwValidationError([{ message: "Mandatory field finalDestination is missing" }]);
    }
    const assignedTriptoAWBResult = await AWBService.assignedTriptoAWB(AWBId, tripId, finalDestinationId, status, loadLocationId);
    if (assignedTriptoAWBResult == "Already EXists") {
      throwValidationError([{ message: "Already Trip Assigned to AWB" }]);
    }
    else {
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("Trip Assigned to AWB"));
    }

  } catch (err) {
    console.error('Error assignedTriptoAWB', err);
    next(err)
  }
}

export const getUpdateAWB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number = req.body.AWBId;
    if (!AWBId) {
      throwValidationError([{ message: "No AWBId Provided." }]);
    }
    const getUpdateAWBRes = await AWBService.getUpdateAWB(AWBId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getUpdateAWBRes));
  } catch (err) {
    console.error('Error retrieving getUpdateAWB:', err);
    next(err)
  }
}

export const updateAWB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number = req.body.AWBId;
    const consigneeId: number = req.body.consigneeId;
    const invoiceNumber: string = req.body.invoiceNumber;
    const invoiceValue: number = req.body.invoiceValue;
    const ewayBillNumber: string = req.body.ewayBillNumber;
    const AWBCDM: number = req.body.AWBCDM;
    const AWBChargedWeight: float = req.body.AWBChargedWeight;
    const AWBWeight: float = req.body.AWBWeight;
    

    let appointmentDate: Date | null = null;
    if (req.body.appointmentDate) {
      appointmentDate = new Date(req.body.appointmentDate);
      if (isNaN(appointmentDate.getTime())) {
        throwValidationError([{ message: "Invalid appointment date (YYYY/MM/DD)" }]);
      }
    }

    if (!AWBId) {
      throwValidationError([{ message: "AWB ID is required" }]);
    }

    const updateAWBRes = await AWBService.updateAWB(AWBId, consigneeId, appointmentDate ? appointmentDate : undefined, invoiceNumber, invoiceValue, ewayBillNumber, AWBCDM,AWBChargedWeight,AWBWeight);
    if (updateAWBRes === "NotExists") {
      throwValidationError([{ message: "Invalid AWB ID" }]);
    } else {
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWB Updated Successfully"));
    }
  } catch (err) {
    console.error('Error updateAWB', err);
    next(err);
  }
};



export const addAWBLineItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number = req.body.AWBId
    const awbLineItems: AwbLineItem[] = req.body.awbLineItems;
    // if (!awbLineItems || awbLineItems.length == 0) {
    //   throwValidationError([{ message: "Atleast One AWB Line Item Required" }]);
    // }
    const updateAWBLineItemResult = await AWBService.addAWBLineItems(AWBId, awbLineItems);
    if (updateAWBLineItemResult == "Invalid AWB") {
      throwValidationError([{ message: "Invalid AWB" }]);
    }
    // if (updateAWBLineItemResult == "Invalid factors") {
    //   throwValidationError([{ message: "Invalid Factor: Actual/volumetric Weight Factor is misssing" }]);
    // }
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWB Line ITem Added Successfully"));
  } catch (err) {
    console.error('Error updateAWB', err);
    next(err)
  }
}

export const calculateChargedWeight = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number = req.body.AWBId
 
    const updateAWBLineItemResult = await AWBService.calculateChargedWeight(AWBId);
   
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("Charged Weight Calculated Successfully"));
  } catch (err) {
    console.error('Error updateAWB', err);
    next(err)
  }
}

export const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tripStatus: string = req.body.tripStatus;
    const latestCheckinHubId: number = req.body.latestCheckinHubId;
    const latestCheckinType: string = req.body.latestCheckinType;

    if (tripStatus) {
      const validtripStatus = ['Open', 'CompletedWithRemarks', 'Closed'];
      if (!validtripStatus.includes(tripStatus)) {
        throwValidationError([{ message: "Invalid Trip Status provided", key: `Status Should be: ${validtripStatus}.` }]);
      }
    }

    const getTripsResult = await tripService.getTrips(tripStatus, latestCheckinHubId, latestCheckinType);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getTripsResult));
  } catch (err) {
    console.error('Error getTrips', err);
    next(err)
  }
}

export const addTripCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inwardTime: string = req.body.inwardTime;
    const tripId: number = req.body.tripId;
    const hubId: number = req.body.hubId
    const odometerReading: number = req.body.odometerReading
    const tripType: string = req.body.tripType
    const fileId: number = req.body.fileId
    if (!inwardTime) {
      throwValidationError([{ message: "inwardTime is Mandatory" }]);
    }
    if (!tripId) {
      throwValidationError([{ message: "tripId is Mandatory" }]);
    }
    if (!hubId) {
      throwValidationError([{ message: "hubId is Mandatory" }]);
    }
    // if (!odometerReading) {
    //   throwValidationError([{ message: "odometerReading is Mandatory" }]);
    // }
    if (!tripType) {
      throwValidationError([{ message: "tripType is Mandatory" }]);
    }
    const getTripsResult = await tripService.addTripCheckin(inwardTime, tripId, hubId, odometerReading, tripType, fileId);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("Trip Checkin Successfully"));
  } catch (err) {
    console.error('Error addTripCheckin', err);
    next(err)
  }
}

export const getTripCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tripType: string = req.body.tripType
    const validtripType = ['Inwarded', 'Outwarded'];
    if (!validtripType.includes(tripType)) {
      throwValidationError([{ message: "Invalid Trip Type provided", key: `Status Should be: ${validtripType}.` }]);
    }
    const getTripsResult = await tripService.getTripCheckin(tripType);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getTripsResult));
  } catch (err) {
    console.error('Error getTripCheckin', err);
    next(err)
  }
}

export const unloadArticlesValidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: string = req.body.AWBCode
    const AWBArticleId: string = req.body.AWBArticleCode
    const tripId: number = req.body.tripId
    const checkinHubId:number=req.body.checkinHubId
    if (!AWBId) {
      throwValidationError([{ message: "AWBCode is mandatoryq" }]);
    }
    if (!AWBArticleId) {
      throwValidationError([{ message: "AWBArticeCode is mandatory" }]);
    }
    if (!checkinHubId) {
      throwValidationError([{ message: "checkinHubId is mandatory" }]);
    }
  
    const unloadArticlesValidateResult = await tripService.unloadArticlesValidate(AWBId, AWBArticleId, tripId,checkinHubId);
    if (typeof unloadArticlesValidateResult=="string" && unloadArticlesValidateResult?.split('+')[0] === "Valid") {
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(
        { validation:"Success",validationMessage:"Success","TripLineItemId": parseInt(unloadArticlesValidateResult?.split('+')[1]) }, "Success"));
      return
    }
    else if (unloadArticlesValidateResult == 'AWBIDInvalid') {//excess 
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse({validation:"Wrong Checkin",validationMessage:"AWBID has no Trip Line Items,Please check the AWBID"}));
      return
    }
    else if (unloadArticlesValidateResult == 'Duplicate') {
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse({validation:"Wrong Checkin",validationMessage:`Article ${AWBArticleId} Already Scanned`}));
      return
    }
    else if (unloadArticlesValidateResult == 'InvalidAWB') {
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse({validation:"Wrong Checkin",validationMessage:`Invalid AirWayBill,Please check the AWB.`}));
      return
    }
    else if (unloadArticlesValidateResult == 'InvalidArticle') {
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse({validation:"Wrong Checkin",validationMessage:`Invalid AWB Article,Please check the Article.`}));
      return
    }
    else if (typeof unloadArticlesValidateResult === 'object' && unloadArticlesValidateResult?.type == 'Not As Per Plan') {
      const { AWBUnlaodHub, currentUnlaodingHub,AWBArticleCode,AWBCode } = unloadArticlesValidateResult;
      res.status(HttpStatusCode.OK).json(
          buildObjectFetchResponse({validation:"Not As Per Plan",validationMessage:`${AWBArticleCode} of ${AWBCode} is unloaded at the wrong HUB . CREATING EXCESS DEPS. <br> ` +
            `AWB unload HUB: ${AWBUnlaodHub} <br> ` + `Current unloading HUB: ${currentUnlaodingHub}`})
      );
      return;
    }
    else {
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse({validation:"Not As Per Plan",validationMessage:`AWBID next destination is ${unloadArticlesValidateResult}. Please do not unload.`}));
      return
    }
  } catch (err) {
    console.error('Error unloadArticlesValidate', err);
    next(err)
  }
}
export const loadArticlesValidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: string = req.body.AWBCode
    const AWBArticleId: string = req.body.AWBArticleCode
    const tripId: number = req.body.tripId
    const checkinHubId:number=req.body.checkinHubId
    if (!AWBId) {
      throwValidationError([{ message: "AWBCode is mandatory" }]);
    }
    if (!AWBArticleId) {
      throwValidationError([{ message: "AWBArticeCode is mandatory" }]);
    }
    if (!tripId) {
      throwValidationError([{ message: "tripId is mandatory" }]);
    }
    if (!checkinHubId) {
      throwValidationError([{ message: "checkinHubID is mandatory" }]);
    }
    const loadArticlesValidateResult = await tripService.loadArticlesValidate(AWBId, AWBArticleId, tripId,checkinHubId);
    console.log(loadArticlesValidateResult, "Controller Res")
    if (typeof loadArticlesValidateResult === 'string' && loadArticlesValidateResult?.split('+')[0] === "Valid") {
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(
        { validation:"Success",validationMessage:"Success","TripLineItemId": parseInt(loadArticlesValidateResult?.split('+')[1]) }, "Success"));
      return
    }


    else if (loadArticlesValidateResult == 'AWBIDInvalid') { //excess case
      res.status(HttpStatusCode.BadRequest).json(buildObjectFetchResponse({validation:"Wrong Checkin",validationMessage:"AWBID has no Checkin Trips,Please check the AWBID and TripId"}));
      return
    }
    else if (loadArticlesValidateResult == 'Duplicate') {
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse({validation:"Wrong Checkin",validationMessage:`Article ${AWBArticleId} Already Scanned`}));
      return
    }
    else if (loadArticlesValidateResult == 'InvalidAWB') {
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse({validation:"Wrong Checkin",validationMessage:`Invalid AirWayBill,Please check the AWB.`}));
      return
    }
    else if (loadArticlesValidateResult == 'InvalidArticle') {
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse({validation:"Wrong Checkin",validationMessage:`Invalid AWB Article,Please check the Article.`}));
      return
    }
    else if (typeof loadArticlesValidateResult === 'object' && loadArticlesValidateResult?.type === 'consignorPickUpPoint') {
      const { consignorCode, branchCode } = loadArticlesValidateResult;
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse
        ({validation:"Wrong Checkin",validationMessage:`AWB is being picked up at Consignor Pickup point - ${consignorCode}. You have checked in at ${branchCode}. Please FIX CHECKIN`})
      );
      return;
    }
    // Assuming loadArticlesValidateResult is the response from the service
    else if (typeof loadArticlesValidateResult === 'object' && loadArticlesValidateResult.type === 'wrongTrip') {
      const { AWBAssignedTripCode, AWBAssignedTripRoute, currentLoadingTripCode, currentLoadingTripRoute,AWBArticleCode,AWBCode } = loadArticlesValidateResult;
      const message = `${AWBArticleCode} of ${AWBCode} is not being loaded into the correct trip. CREATING EXCESS DEPS. <br> ` +
      `AWB assigned Trip: ${AWBAssignedTripCode} ${AWBAssignedTripRoute} <br> ` +
      `Current loading Trip: ${currentLoadingTripCode} ${currentLoadingTripRoute}`;
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse({validation:"Not As Per Plan",validationMessage:message}));
      return;
    }
  }
  catch (err) {
    console.error('Error loadArticlesValidate', err);
    next(err)
  }
}


export const getTripDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tripId: number = req.body.tripId
    const getTripsResult = await tripService.getTripDetails(tripId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getTripsResult));
  } catch (err) {
    console.error('Error getTripDetails', err);
    next(err)
  }
}

export const getTripLineItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tripId: number = req.body.tripId
    const tripLineItemStatus: string = req.body.tripLineItemStatus;
    const loadLocationId: number = req.body.loadLocationId
    const unloadLocationId: number = req.body.unloadLocationId
    if (!tripId) {
      throwValidationError([{ message: "tripId is mandatory" }]);
    }
    const getTripsResult = await tripService.getTripLineItems(tripId, tripLineItemStatus, loadLocationId, unloadLocationId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getTripsResult));
  } catch (err) {
    console.error('Error getTripLineItems', err);
    next(err)
  }
}


export const addAWBArticleLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const AWBArticleCode: string = req.body.AWBArticleCode;
    const scanType: string = req.body.scanType;
    const tripId: number = req.body.tripId;
    const checkinHubId: number = req.body.checkinHubId;


    if (!scanType) {
      throwValidationError([{ message: "scanType is mandatory" }]);
    }
    if (!tripId) {
      throwValidationError([{ message: "tripId is mandatory" }]);
    }
    if (!AWBArticleCode) {
      throwValidationError([{ message: "AWBArticleCode is mandatory" }]);
    }
    const addAWBArticleLogsRes = await tripService.addAWBArticleLogs(AWBArticleCode, scanType, tripId,checkinHubId);
    console.log(addAWBArticleLogsRes, "Service Response");

    if (addAWBArticleLogsRes === 'Duplicate') {
      res.status(HttpStatusCode.OK).json(buildNoContentResponse(`Article Already Exists`));
    } else {
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("Success"));
    }

  } catch (err) {
    console.error('Error addAWBArticleLogs', err);
    next(err);
  }
}


export const getScannedArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number = req.body.AWBId
    const tripId: number = req.body.tripId
    const scanType: string = req.body.scanType
    if (!AWBId) {
      throwValidationError([{ message: "AWBCode is mandatory" }]);
    }
    if (!tripId) {
      throwValidationError([{ message: "TripId is mandatory" }]);
    }
    if (!scanType) {
      throwValidationError([{ message: "scanType is mandatory" }]);
    }
    const validScanType = ['Load', 'Unload'];
    if (!validScanType.includes(scanType)) {
      throwValidationError([{ message: "Invalid scanType provided", key: `scanType Should be: ${validScanType}.` }]);
    }
    const getScannedArticlesResult = await tripService.getScannedArticles(AWBId, tripId, scanType);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getScannedArticlesResult));
  } catch (err) {
    console.error('Error getScannedArticles', err);
    next(err)
  }
}
export const outwardAWBs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId, data, checkinHub }: { tripId: number, data: Outwarded[], checkinHub: number } = req.body;

    // console.log('Request Body:', req.body);

    if (!Array.isArray(data) || data.length === 0) {
      throwValidationError([{ message: "Data is mandatory" }]);
    }
    
    if (!tripId) {
      throwValidationError([{ message: "tripId is mandatory" }]);
    }
    if (!checkinHub) {
      throwValidationError([{ message: "checkinHub is mandatory" }]);
    }
    const getScannedArticlesResult = await tripService.outwardAWBs(tripId, data, checkinHub);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("success"));
  } catch (err) {
    console.error('Error getScannedArticles', err);
    next(err)
  }
}

export const inwardAWBs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId, data, checkinHub }: { tripId: number, data: { AWBId: number, tripLineItemId: number }[], checkinHub: any } = req.body;

   
    if (!Array.isArray(data) || data.length === 0) {
      throwValidationError([{ message: "Data is mandatory" }]);
    }
    
    if (!tripId) {
      throwValidationError([{ message: "tripId is mandatory" }]);
    }
    if (!checkinHub) {
      throwValidationError([{ message: "checkinHub is mandatory" }]);
    }

    const getScannedArticlesResult = await tripService.inwardAWBs(tripId, data, checkinHub);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("success"));
  } catch (err) {
    console.error('Error getScannedArticles', err);
    next(err);
  }
}


export const fileUpload = async (req: Request, res: Response, next: NextFunction) => {
  const { files } = req as Request & { files?: { file: MulterFile[] } };

  try {
    if (!files || !files.file || files.file.length === 0) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (files.file.length > 6) {
      return res.status(400).json({ message: "Number of files exceeded. Maximum allowed: 6" });
    }

    const type = req.body.type || 'defaultScreen';
    const fileName = req.body.fileName;

    console.log(fileName,"fileName from req.body")
   
    
    const uploadResults = await handleFileUpload(files.file, type);
    console.log(uploadResults,"uploadResultsuploadResults") 
    const fileUploadResp = await fileUploadRes(uploadResults, type); 
     // Run triggerExternalService and podCreation asynchronously in the background
    // if(type=="POD"){  
    //   triggerExternalService(files.file,fileUploadResp)
    //   .then(async (externalApiResponses) => {
    //       await podCreation(externalApiResponses,fileName,fileUploadResp); // Chain pod creation
    //   })
    //   .catch((error) => console.error("Error in external service or pod creation:", error));
    // }
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(fileUploadResp));
  } catch (error) {
    console.error('Error in fileUpload:', error);
    next(error);
  }
};

export const addPOD = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { files } = req as Request & { files?: { file: MulterFile[] } };

      if (!files || !files.file || files.file.length === 0) {
        return res.status(400).json({ message: "No file uploaded" });
      }
  
  
      const type = 'POD';
      const fileName = req.body.fileName;
  
      console.log(fileName,"fileName from req.body")
    
      const uploadResults = await handleFileUpload(files.file, type);
      console.log(uploadResults,"uploadResultsuploadResults") 
      const fileUploadResp = await fileUploadRes(uploadResults, type); 

      // if(type=="POD"){  
      console.log(fileUploadResp,"fileUploadResp")
      
      PODService.triggerExternalService(files.file,fileUploadResp)
      .then(async (externalApiResponses) => {
          await PODService.podCreation(externalApiResponses,fileName,fileUploadResp); // Chain pod creation
      })
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(fileUploadResp));
  } catch (err) {
    console.error('Error getDepsLists', err);
    next(err)
  }
}
export const getFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.query;
    if (!fileId || isNaN(Number(fileId))) {
      return throwValidationError([{ message: "Invalid or missing File ID" }]);
    }

    const numFileId = parseInt(fileId as string, 10);
    const fileDetails = await fileService.getFileDetails([numFileId]);
    if (!fileDetails || fileDetails.length === 0) {
      return throwValidationError([{ message: "File not found" }]);
    }

    const file = fileDetails[0];
    let fileURI = file.uri;

    if (file.sourceType === 'S3Bucket') {
      fileURI = await refreshSignedUrlIfNeeded(file);
    }

    res.redirect(fileURI);
  } catch (error) {
    console.error('Error in getFile:', error);
    next(error);
  }
};


export const getDepsLists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number = req.body.AWBId
    if (!AWBId) {
      throwValidationError([{ message: "AWBCode is mandatory" }]);
    }
    const getDepsListsResult = await tripService.getDepsLists(AWBId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getDepsListsResult));
  } catch (err) {
    console.error('Error getDepsLists', err);
    next(err)
  }
}
export const addDeps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("innnnn ");
      return throwValidationError([{ message: "DEPSData is missing" }]);
    }
      const DEPSData: DEPS[] = req.body.DEPSData
    // const fileIds: any = req.body.fileIds
    if (!DEPSData || DEPSData.length == 0) {
      throwValidationError([{ message: "DEPSData is mandatory" }]);
      return
    }
    const addDepsResult = await tripService.addDeps(DEPSData);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(addDepsResult));
  } catch (err) {
    console.error('Error getDepsLists', err);
    next(err)
  }
}


export const pdfGenerateAWB = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const AWBId = req.body.AWBId
    if (!AWBId || AWBId.length == 0) {
      throwValidationError([{ message: "AWB ID is mandatory" }]);
    }
    // const pricing = await pricingServices.pricingModule(AWBId);
    // console.log(pricing,"pricing controller")
    // if(pricing=="Invalid AWB"){
    //   throwValidationError([{message: "Invalid AWB: consignorId or toBranch is missing"}]);
    // }
    // if(pricing=="Invalid cw"){
    //   throwValidationError([{message: "Invalid contract: factor and ceiling missing"}]);
    // }
    // if(pricing=="Invalid ratePerKg"){
    //   throwValidationError([{message: "Invalid consignorRate : ratePerKg is missing"}]);
    // }
    // if(pricing=="Invalid rollup"){
    //   throwValidationError([{message: "Invalid AWB : rollupweight/volume is missing"}]);
    // }

    const pdfData = await AWBService.getAwbPdfData(AWBId);
    if(!pdfData) {
      return throwValidationError([{ message: "Invalid AWB ID" }]);
    }
    const buffer = await AWBPdfGenerator(pdfData);
    const uploadRes = await uploadPDF(buffer, pdfData!.AWBCode, 'AWB', false);
    const fileUploadRes = await fileService.fileUploadRes(uploadRes, 'AWB');
    console.log(fileUploadRes);
    await AWBService.awbEntry(AWBId, fileUploadRes[0].fileId);

    let response = {
      "fileName": `${pdfData?.AWBCode}`,
      "pdfPath": fileUploadRes[0].fileUri,
    }
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(response));
  } catch (err) {
    console.error('Error generatePdf', err);
    next(err)
  }
}

export const getSKUs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consignorId: number = req.body.consignorId
    if (!consignorId) {
      throwValidationError([{ message: "consignorId is mandatory" }]);
    }
    const getSKUsResult = await AWBService.getSKUs(consignorId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getSKUsResult));
  } catch (err) {
    console.error('Error getDepsLists', err);
    next(err)
  }
}

export const getBoxTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consignorId: number = req.body.consignorId
    if (!consignorId) {
      throwValidationError([{ message: "consignorId is mandatory" }]);
    }
    const getBoxTypesResult = await AWBService.getBoxTypes(consignorId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getBoxTypesResult));
  } catch (err) {
    console.error('Error getDepsLists', err);
    next(err)
  }
}

export const pdfGenerateTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId, tripLineItemStatus, locationId } = req.body;
    let type = '';
    if (!tripId || tripId.length == 0) {
      throwValidationError([{ message: "Trip ID is mandatory" }]);
    }
    if (!tripLineItemStatus || tripLineItemStatus.length == 0) {
      throwValidationError([{ message: "TripLineItemStatus is mandatory" }]);
    }
    if (!locationId || locationId.length == 0) {
      throwValidationError([{ message: "Location ID Details is mandatory" }]);
    }

    const tripDetails = await tripService.getTripDetails(tripId);
    const tripsPdfData = [];

    for (const trip of tripDetails) {
      let tripLineItems

      if (tripLineItemStatus === "Assigned") {
        type = 'LoadingSheet';
        const loadLocationId = locationId;
        tripLineItems = await tripService.getTripLineItems(tripId, tripLineItemStatus, loadLocationId, null);
      } else if (tripLineItemStatus === "Open") {
        type = 'UnloadingSheet';
        const unloadLocationId = locationId;
        tripLineItems = await tripService.getTripLineItems(tripId, tripLineItemStatus, null, unloadLocationId);
      }

      const tripData = {
        tripDetails: trip,
        tripLineItems: tripLineItems,
      };
      tripsPdfData.push(tripData);
    }

    const buffer =  await tripsPdfGenerator(tripsPdfData);
    const uploadRes = await uploadPDF(buffer, tripsPdfData[0]?.tripDetails.tripCode, type, false);
    const fileUploadRes = await fileService.fileUploadRes(uploadRes, type);
    console.log(fileUploadRes);


    let response = {
      "fileName": tripsPdfData.length > 0 ? `${tripsPdfData[0]?.tripDetails?.tripCode}` : 'trips_report.pdf',
      "pdfPath": fileUploadRes[0].fileUri,
    };

    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(response));
  } catch (err) {
    console.error('Error generating trips PDF', err);
    next(err);
  }
};


export const pdfGenerateTripHire = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId } = req.body;
    if (!tripId || tripId.length == 0) {
      throwValidationError([{ message: "Trip ID is mandatory" }]);
    }

    const tripsData = await tripService.getTripDetails(tripId);
    const buffer =  await tripHirePdfGenerator(tripsData);
    const uploadRes = await uploadPDF(buffer, tripId, 'HireLetter', true);
    const fileUploadRes = await fileService.fileUploadRes(uploadRes, 'HireLetter');
    console.log(fileUploadRes);

    let response = {
      "fileName": 'trip_hire.pdf',
      "pdfPath": fileUploadRes[0].fileUri,
    };

    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(response));
  } catch (err) {
    console.error('Error generating trips PDF', err);
    next(err);
  }
};

const validKeys = ['AWBCode', 'tripCode', 'loadLocation', 'unloadLocation'];
const validateConnectivityPlanKeys = (plans: connectivityPlanData[]) => {
  plans.forEach(plan => {
    const keys = Object.keys(plan);
    keys.forEach(key => {
      if (!validKeys.includes(key)) {
        throwValidationError([{ message: `Invalid key found: ${key}` }]);
      }
    });
  });
};

export const insertConnectivityPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connectivityPlans:connectivityPlanData[] = req.body.connectivityPlans;

    if (!Array.isArray(connectivityPlans) || connectivityPlans.length === 0) {
      throwValidationError([{ message: "At least one record is mandatory" }]);
    }

    validateConnectivityPlanKeys(connectivityPlans);



    const connectedDataRes = await tripService.insertConnectivityPlan(connectivityPlans);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(connectedDataRes));
  } catch (err) {
    console.error('Error generating addBulkConnectivityPlan', err);
    next(err);
  }
};

export const updateTripLineItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tripLineItemId:number= req.body.tripLineItemId;
    const unloadLocationId:number=req.body.unloadLocationId

    if (unloadLocationId === undefined || unloadLocationId === null) {
      throwValidationError([{ message: "unloadLocationId is mandatory" }]);
    }

    if (!tripLineItemId) {
      throwValidationError([{ message: "tripLineItemId is mandatory" }]);
    }

    const connectedDataRes = await tripService.updateTripLineItem(tripLineItemId,unloadLocationId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(connectedDataRes));
  } catch (err) {
    console.error('Error updateTripLineItem', err);
    next(err);
  }
};

export const deliverAWBCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBCode:string= req.body.AWBCode;
    if (!AWBCode) {
      throwValidationError([{ message: "AWBCode is mandatory" }]);
    }
    const connectedDataRes = await tripService.deliverAWBCheck(AWBCode);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(connectedDataRes));
  } catch (err) {
    console.error('Error deliverAWBCheck', err);
    next(err);
  }
};

export const calculateShippingCosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId:[number]= req.body.AWBId;
   
    if (!AWBId) {
      throwValidationError([{ message: "consignorId is mandatory" }]);
    }
    const Result = await invoiceAWB.calculateShippingCosts(AWBId);
    console.log(Result,"%%controller6")
    if (Result=="NoAWBs") {
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWB doesn't exists"));
    }
    // else if (Result=="NoContract") {
    //   res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWB doesn't have required contract details"));
    // }
   
    // else if (Result=="noAWBLineItem") {
    //   res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWB has BoxType contract but doesn't have AWBLineItems"));
    // }
    // else if (Result=="AWBInvalidConsigneeId") {
    //   res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWB has Invalid ConsigneeID"));
    // }
    // else if (Result=="AWBInvalidCeilingCW") {
    //   res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWB has Invalid ChargeWeightWithCeiling"));
    // }
    else{
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("success"));
    }
  } catch (err) {
    console.error('Error updateTripLineItem', err);
    next(err);
  }
};



export const getExcessDeps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tripId:number= req.body.tripId;
    const checkinHub:number= req.body.checkinHub;
    const scanType:string= req.body.scanType;
    if (!tripId) {
      throwValidationError([{ message: "tripId is mandatory" }]);
    }
    if (!checkinHub) {
      throwValidationError([{ message: "checkinHub is mandatory" }]);
    }
    if (!scanType) {
      throwValidationError([{ message: "scanType is mandatory" }]);
    }
    const scanTypeEnum = ArticleLogsScanType[scanType as keyof typeof ArticleLogsScanType];
    if (!scanTypeEnum) {
      throwValidationError([{ message: `Invalid scanType: ${scanType}` }]);
    }
    const getExcessDepsResponse = await tripService.getExcessDeps(tripId,checkinHub,scanTypeEnum);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getExcessDepsResponse));
  } catch (err) {
    console.error('Error deliverAWBCheck', err);
    next(err);
  }
};

export const getShortArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId: number[] = req.body.AWBId;
    const tripId: number = req.body.tripId;
    const scanType: string = req.body.scanType;

    // Validation checks
    if (!AWBId || !Array.isArray(AWBId)) {
      throwValidationError([{ message: "AWBId is mandatory and must be an array" }]);
    }
    if (!tripId) {
      throwValidationError([{ message: "tripId is mandatory" }]);
    }
    if (!scanType) {
      throwValidationError([{ message: "scanType is mandatory" }]);
    }

    // Convert scanType to enum, with error handling for invalid values
    const scanTypeEnum = ArticleLogsScanType[scanType as keyof typeof ArticleLogsScanType];
    if (!scanTypeEnum) {
      throwValidationError([{ message: `Invalid scanType: ${scanType}` }]);
    }

    // Call the service function
    const getExcessDepsResponse = await tripService.getShortArticles(AWBId, tripId, scanTypeEnum);

    // Build and send the response
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getExcessDepsResponse));
  } catch (err) {
    console.error('Error in getShortArticles', err);
    next(err);
  }
};

export const closeDeps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const depsIds: number[] = req.body.depsIds;

    if (!depsIds || !depsIds.length) {
      throwValidationError([{ message: "depsIds array is mandatory" }]);
    }

    const closeDepsResponse = await tripService.closeDeps(depsIds);

    res.status(HttpStatusCode.OK).json(
      buildObjectFetchResponse(closeDepsResponse, "Operation Completed"));
  } catch (err) {
    console.error("Error in closeDeps", err);
    next(err);
  }
};


export const nscsTripManager = async (req: Request, res: Response) => {
  const payload: WebhookPayload = req.body;
  const err = payload.event;

  try {
    switch (payload.event) {
      case 'trip/add':
        // console.log(payload.data.trip)
        await tripService.processTripAdd(payload.data.trip,payload.event,payload);
        break;
      case 'trip/update':
        await tripService.processTripUpdate(payload.data.trip);
        break;
      case 'vendor/add':
        await tripService.processVendorAdd(payload.data.vendor);
        break;
      case 'vendor/update':
        await tripService.processVendorUpdate(payload.data.vendor);
        break;
      case 'vehicle/add':
        await tripService.processVehicleAdd(payload.data.vehicle);
        break;
      case 'vehicle/update':
        await tripService.processVehicleUpdate(payload.data.vehicle);
        break;
      default:
        return res.status(400).json({
          statusCode: 400,
          message: `Invalid Event: ${err}`,
        });
    }

    res.status(HttpStatusCode.OK).json(buildNoContentResponse(`Event ${payload.event} processed successfully`));
  } catch (error: unknown) {
    console.error('Error processing webhook:', error);
    
    // Check if the error is an instance of Error
    if (error instanceof Error && error.message === 'Invalid vendor type') {
      return res.status(400).json({
        statusCode: 400,
        message: `Invalid Vendor Type for ${err}: Please provide a valid vendor type.`,
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};
