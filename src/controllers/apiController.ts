import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as masterDataService from '../services/masterDataService';
import * as consignorService from '../services/consignorService';
import * as consigneeService from '../services/consigneeService';
import * as AWBService from '../services/AWBService';
import * as tripService from '../services/tripService';
import { AWBCreateData } from '../types/awbTypes';
import { HttpStatusCode } from '../types/apiTypes';
import { MulterFile } from '../types/multerTypes';
import { Inwarded, Outwarded } from '../types/outwardInwardTypes';
import { buildNoContentResponse, buildObjectFetchResponse, throwValidationError} from '../utils/apiUtils';
import { Consignee, Consignor,AwbLineItem, DEPS} from '@prisma/client';
import {pdfGenerator} from "../services/pdfGenerator";

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
    const branches = await masterDataService.getBranches(isHub);
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
      throwValidationError([{message: "No Consignor Id Provided."}]);
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
    const branchId:number=req.body.branchId;
    if (!consignorId) {
      throwValidationError([{message: "No Consignor Id Provided."}]);
    }
    const addConsignorBranchRes = await masterDataService.addConsignorBranch(consignorId,branchId);
    if(addConsignorBranchRes=='Already Exists'){
      throwValidationError([{message: "Branch Already Exists "}]);
    }
    else{
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("Added Successfully"));
    }
  } catch (err) {
    console.error('Error retrieving consignees:', err);
    next(err)
  }
}
export const getConsignors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consignorId:number=req.body.consignorId
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
      throwValidationError([{message: "No consignors provided."}]);
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
    const createConsignorsRes =await consignorService.createConsignors(consignorsData);
    console.log(createConsignorsRes,"ctrl**")
    if(createConsignorsRes=="alreadyExists"){
      throwValidationError([{message: "Provided Consignor Code Already Exists"}]);
    }
    else{
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
      throwValidationError([{message: "No Consignor Id Provided."}]);
    }
    const consignees = await consigneeService.getConsignees(consignorId,toBranchId);
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
    const createConsigneesRes=await consigneeService.createConsignees(consigneesData);
    if(createConsigneesRes=="alreadyExists"){
      throwValidationError([{message: "Provided Consignee Code Already Exists"}]);
    }
    else{
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
    const AWBStatus: string = req.body.AWBStatus;
    const validAWBStatusValues = ['PickUp', 'InTransit', 'atHub', 'Delivered'];
    if (!AWBStatus || !validAWBStatusValues.includes(AWBStatus)) {
      throwValidationError([{message: "Invalid AWBStatus provided."}]);
    }
    const getGeneratedAWBRes = await AWBService.getGeneratedAWB(consignorId,AWBStatus);
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
      throwValidationError([{message: "No AWBId Provided."}]);
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
    const AWBId:number=req.body.AWBId
    const tripId:number=req.body.tripId
    const status:string=req.body.status
    if (!AWBId) {
      throwValidationError([{ message: `Mandatory field AWBId is missing` }]);
    }
    if (!tripId) {
      throwValidationError([{ message: `Mandatory field AWBId is missing` }]);
    }
    if (status!="Assigned") {
      throwValidationError([{ message: `Please check the status, it should be Assigned` }]);
    }
    const finalDestinationId:number=req.body.finalDestinationId  //toBranch(ConsigneeBranch)

    if (!AWBId || !tripId || !finalDestinationId) {
      throwValidationError([{message: "Mandatory fields are missing"}]);
    }
    const assignedTriptoAWBResult = await AWBService.assignedTriptoAWB(AWBId,tripId,finalDestinationId,status);
    if(assignedTriptoAWBResult=="Already EXists"){
      throwValidationError([{message: "Already Trip Assigned to AWB"}]);
    }
    else{
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
      throwValidationError([{message: "No AWBId Provided."}]);
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
    const AWBId:number=req.body.AWBId
    const consigneeId:number=req.body.consigneeId
    const invoiceNumber:string=req.body.invoiceNumber;
    const invoiceValue:number = req.body.invoiceValue;
    const ewayBillNumber:string=req.body.ewayBillNumber;
    const appointmentDate = new Date(req.body.appointmentDate);

    if (isNaN(appointmentDate.getTime())) {
      throwValidationError([{ message: "Invalid appointment date(YYYY/MM/DD)" }]);
    }

    if (!AWBId) {
      throwValidationError([{ message: "AWB ID is required" }]);
    }
    const updateAWBRes = await AWBService.updateAWB(AWBId,consigneeId,appointmentDate,invoiceNumber,invoiceValue,ewayBillNumber);
    if(updateAWBRes=="NotExists"){
      throwValidationError([{message: "Invalid AWB ID"}]);
    }
    else{
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWB Updated Successfully"));
    }

  } catch (err) {
    console.error('Error updateAWB', err);
    next(err)
  }
}

export const updateAWBLineItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId:number=req.body.AWBId
    const awbLineItems: AwbLineItem[] = req.body.awbLineItems || [];
   const updateAWBLineItemResult = await AWBService.updateAWBLineItem(AWBId,awbLineItems);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWB Line ITem Added Successfully"));
  } catch (err) {
    console.error('Error updateAWB', err);
    next(err)
  }
}

export const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tripStatus:string=req.body.tripStatus;
    const latestCheckinHubId:number=req.body.latestCheckinHubId;
    const latestCheckinType:string=req.body.latestCheckinType;

    const validtripStatus = ['Open','CompletedWithRemarks','Closed'];
    if (!validtripStatus.includes(tripStatus)) {
      throwValidationError([{message: "Invalid Trip Status provided",key:`Status Should be: ${validtripStatus}.`}]);
    }
    const getTripsResult = await tripService.getTrips(tripStatus,latestCheckinHubId,latestCheckinType);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getTripsResult));
  } catch (err) {
    console.error('Error getTrips', err);
    next(err)
  }
}

export const addTripCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const inwardTime:string  =req.body.inwardTime;
    const tripId:number  =req.body.tripId;
    const hubId:number=req.body.hubId
    const odometerReading:number=req.body.odometerReading
    const tripType:string=req.body.tripType
    const fileId:number=req.body.fileId
    if (!inwardTime) {
      throwValidationError([{message: "inwardTime is Mandatory"}]);
    }
    if (!tripId) {
      throwValidationError([{message: "tripId is Mandatory"}]);
    }
    if (!hubId) {
      throwValidationError([{message: "hubId is Mandatory"}]);
    }
    if (!odometerReading) {
      throwValidationError([{message: "odometerReading is Mandatory"}]);
    }
    if (!tripType) {
      throwValidationError([{message: "tripType is Mandatory"}]);
    }
    const getTripsResult = await tripService.addTripCheckin(inwardTime,tripId,hubId,odometerReading,tripType,fileId);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("Trip Checkin Successfully"));
  } catch (err) {
    console.error('Error addTripCheckin', err);
    next(err)
  }
}

export const getTripCheckin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tripType:string=req.body.tripType
    const validtripType = ['Inwarded','Outwarded'];
    if (!validtripType.includes(tripType)) {
      throwValidationError([{message: "Invalid Trip Type provided",key:`Status Should be: ${validtripType}.`}]);
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
    const AWBId:string=req.body.AWBCode
    const AWBArticleId:string=req.body.AWBArticleCode
    const tripId:number=req.body.tripId
    if (!AWBId) {
      throwValidationError([{message: "AWBCode is mandatoryq"}]);
    }
    if (!AWBArticleId) {
      throwValidationError([{message: "AWBArticeCode is mandatory"}]);
    }
    const unloadArticlesValidateResult = await tripService.unloadArticlesValidate(AWBId,AWBArticleId,tripId);

    if (unloadArticlesValidateResult?.split('+')[0]=== "Valid"){
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(
        {"TripLineItemId":parseInt(unloadArticlesValidateResult?.split('+')[1])},"Success"));
      return
    }

    else if(unloadArticlesValidateResult=='AWBIDInvalid'){
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWBID has no Trip Items,Please check the AWBID"));
      return
    }
    else if(unloadArticlesValidateResult=='Duplicate'){
      res.status(HttpStatusCode.OK).json(buildNoContentResponse(`Article ${AWBArticleId} Already Scanned`));
      return
    }
    else if(unloadArticlesValidateResult=='InvalidAWB'){
      res.status(HttpStatusCode.OK).json(buildNoContentResponse(`Invalid AirWayBill,Please check the AWB.`));
      return
    }
    else if(unloadArticlesValidateResult=='InvalidArticle'){
      res.status(HttpStatusCode.OK).json(buildNoContentResponse(`Invalid AWB Article,Please check the Article.`));
      return
    }
    else{
      res.status(HttpStatusCode.OK).json(buildNoContentResponse(`AWBID next destination is ${unloadArticlesValidateResult}. Please do not unload.`));
      return
    }

  } catch (err) {
    console.error('Error unloadArticlesValidate', err);
    next(err)
  }
}

export const loadArticlesValidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId:string=req.body.AWBCode
    const AWBArticleId:string=req.body.AWBArticleCode
    const tripId:number=req.body.tripId
    if (!AWBId) {
      throwValidationError([{message: "AWBCode is mandatory"}]);
    }
    if (!AWBArticleId) {
      throwValidationError([{message: "AWBArticeCode is mandatory"}]);
    }
    const loadArticlesValidateResult = await tripService.loadArticlesValidate(AWBId,AWBArticleId,tripId);
    console.log(loadArticlesValidateResult,"res")
    if (loadArticlesValidateResult?.split('+')[0]=== "Valid"){
      res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(
        {"TripLineItemId":parseInt(loadArticlesValidateResult?.split('+')[1])},"Success"));
      return
    }
    if(loadArticlesValidateResult=='Valid'){
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("Success"));
      return
    }
    else if(loadArticlesValidateResult=='AWBIDInvalid'){
      res.status(HttpStatusCode.OK).json(buildNoContentResponse("AWBID has no Checkin Trips,Please check the AWBID and TripId"));
      return
    }
    else if(loadArticlesValidateResult=='Duplicate'){
      res.status(HttpStatusCode.OK).json(buildNoContentResponse(`Article ${AWBArticleId} Already Scanned`));
      return
    }
    else if(loadArticlesValidateResult=='InvalidAWB'){
      res.status(HttpStatusCode.OK).json(buildNoContentResponse(`Invalid AirWayBill,Please check the AWB.`));
      return
    }
    else if(loadArticlesValidateResult=='InvalidArticle'){
      res.status(HttpStatusCode.OK).json(buildNoContentResponse(`Invalid AWB Article,Please check the Article.`));
      return
    }
    else{
      res.status(HttpStatusCode.OK).json(buildNoContentResponse(`TripCode ${loadArticlesValidateResult} not in Assigned Status. Please do not load.`));
      return

    }

  } catch (err) {
    console.error('Error loadArticlesValidate', err);
    next(err)
  }
}

export const getTripDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tripId:number=req.body.tripId
    const getTripsResult = await tripService.getTripDetails(tripId);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getTripsResult));
  } catch (err) {
    console.error('Error getTripDetails', err);
    next(err)
  }
}

export const getTripLineItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tripId:number=req.body.tripId
    const scanType:string=req.body.scanType
    const tripLineItemStatus:string=req.body.tripLineItemStatus;
    if (!tripId) {
      throwValidationError([{message: "tripId is mandatory"}]);
    }
    if (!scanType) {
      throwValidationError([{message: "scanType is mandatory"}]);
    }
    const getTripsResult = await tripService.getTripLineItems(tripId,scanType,tripLineItemStatus);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getTripsResult));
  } catch (err) {
    console.error('Error getTripLineItems', err);
    next(err)
  }
}

export const addAWBArticleLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBArticleCode:string=req.body.AWBArticleCode
    const scanType:string=req.body.scanType
    const tripId:number=req.body.tripId
    const tripLineItemId:number=req.body.tripLineItemId
    if (!scanType) {
      throwValidationError([{message: "scanType is mandatory"}]);
    }
    if (!tripId) {
      throwValidationError([{message: "tripId is mandatory"}]);
    }
    if (!AWBArticleCode) {
      throwValidationError([{message: "AWBArticleCode is mandatory"}]);
    }
    if (!tripLineItemId) {
      throwValidationError([{message: "tripLineItemId is mandatory"}]);
    }
    const getTripsResult = await tripService.addAWBArticleLogs(AWBArticleCode,scanType,tripId,tripLineItemId);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("Success"));
  } catch (err) {
    console.error('Error addAWBArticleLogs', err);
    next(err)
  }
}

export const getScannedArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId:number=req.body.AWBId
    const tripId:number=req.body.tripId
    const scanType:string=req.body.scanType
    if (!AWBId) {
      throwValidationError([{message: "AWBCode is mandatory"}]);
    }
    if (!tripId) {
      throwValidationError([{message: "TripId is mandatory"}]);
    }
    if (!scanType) {
      throwValidationError([{message: "scanType is mandatory"}]);
    }
    const validScanType = ['Load','Unload'];
    if (!validScanType.includes(scanType)) {
      throwValidationError([{message: "Invalid scanType provided",key:`scanType Should be: ${validScanType}.`}]);
    }
    const getScannedArticlesResult = await tripService.getScannedArticles(AWBId,tripId,scanType);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(getScannedArticlesResult));
  } catch (err) {
    console.error('Error getScannedArticles', err);
    next(err)
  }
}
1
export const outwardedAWB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId, data }: { tripId: number, data: Outwarded[] } = req.body;
    const getScannedArticlesResult = await tripService.outwardedAWB(tripId,data);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("success"));
  } catch (err) {
    console.error('Error getScannedArticles', err);
    next(err)
  }
}

export const inwardedAWB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId, data }: { tripId: number, data: Inwarded[] } = req.body;
    const getScannedArticlesResult = await tripService.inwardedAWB(tripId,data);
    res.status(HttpStatusCode.OK).json(buildNoContentResponse("success"));
  } catch (err) {
    console.error('Error getScannedArticles', err);
    next(err)
  }
}



export const fileUpload = async (req: Request & { files?: { file: MulterFile[] } }, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !req.files.file || req.files.file.length === 0) {
      throwValidationError([{message: "No file uploaded"}]);
      return
    }

    if (req.files.file.length > 6) {
      throwValidationError([{ message: "Number of files exceeded. Maximum allowed: 6" }]);
      return;
    }
    const type: string = req.body.type || 'defaultScreen';
    const validType = ['DEPS','AWB','GST','ShippingLabel','TripCheckin'];
    if (!validType.includes(type)) {
      throwValidationError([{message: "Invalid type provided",key:`Type Should be: ${validType}.`}]);
    }
    const currentTimestamp: string = new Date().getTime().toString();
    const fileUploadPromises: Promise<string>[] = [];

    const uploadDir = path.join(__dirname, '..','..', process.env.UPLOAD_DIR ||'uploads', type);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    req.files.file.forEach((item: MulterFile) => {
      const filePath = path.join( 'uploads', type, `${currentTimestamp}_${item.originalname}`);

      fileUploadPromises.push(
        new Promise((resolve, reject) => {
          fs.writeFile(filePath, item.buffer, (err) => {
            if (err) {
              console.error('Error writing file:', err);
              reject(err);
            } else {
              console.log(`File ${item.originalname} uploaded successfully`);
              resolve(filePath);
            }
          });
        })
      );
    });
    const filePaths = await Promise.all(fileUploadPromises);
    console.log(filePaths);
    const normalizedFilePaths = filePaths.map((filePath) => filePath.replace(/\\/g, '/'));
    console.log(normalizedFilePaths);
    const fileUploadRes = await tripService.fileUploadRes(normalizedFilePaths,type);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(fileUploadRes));
    return

  } catch (error) {
    console.error('Error in fileUpload:', error);
    next(error);
  }
};

export const getDepsLists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId:number=req.body.AWBId
    if (!AWBId) {
      throwValidationError([{message: "AWBCode is mandatory"}]);
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
    const DEPSData:DEPS[]=req.body.DEPSData
    const fileIds:any=req.body.fileIds
    if (!DEPSData || DEPSData.length==0) {
      throwValidationError([{message: "DEPSData is mandatory"}]);
    }
    const addDepsResult = await tripService.addDeps(DEPSData,fileIds);
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(addDepsResult));
  } catch (err) {
    console.error('Error getDepsLists', err);
    next(err)
  }
}

export const generatePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AWBId=req.body.AWBId
    if (!AWBId || AWBId.length==0) {
      throwValidationError([{message: "AWB ID is mandatory"}]);
    }
    const pdfData = await AWBService.getAwbPdfData(AWBId);
    const path = await pdfGenerator(pdfData);

    const fileUploadRes = await tripService.fileUploadRes([path],'AWB');
    await AWBService.awbEntry(AWBId, fileUploadRes[0].fileId);

    let response= {
      "fileName":`${pdfData?.AWBCode}`,
      "pdfPath":path
    }
    res.status(HttpStatusCode.OK).json(buildObjectFetchResponse(response));
  } catch (err) {
    console.error('Error generatePdf', err);
    next(err)
  }
}
