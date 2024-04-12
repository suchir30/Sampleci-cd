import { NextFunction, Request, Response } from 'express';

import * as masterDataService from '../services/masterDataService';
import * as consignorService from '../services/consignorService';
import * as consigneeService from '../services/consigneeService';
import * as AWBService from '../services/AWBService';
import { AWBCreateData } from '../types/awbTypes';
import { HttpStatusCode } from '../types/apiTypes';
import { buildNoContentResponse, buildObjectFetchResponse, throwValidationError } from '../utils/apiUtils';
import { Consignee, Consignor } from '@prisma/client';




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

export const getBranches = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const branches = await masterDataService.getBranches();
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
export const getConsignors = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const consignors = await consignorService.getConsignors();
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
    if (!consignorId) {
      throwValidationError([{message: "No Consignor Id Provided."}]);
    }
    const consignees = await consigneeService.getConsignees(consignorId);
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
    if (!consignorId) {
      throwValidationError([{message: "No Consignor Id Provided."}]);
    }
    const getGeneratedAWBRes = await AWBService.getGeneratedAWB(consignorId);
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