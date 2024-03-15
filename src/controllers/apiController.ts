import { Request, Response } from 'express';

import * as masterDataService from '../services/masterDataService';
import * as consignorService from '../services/consignorService';
import * as consigneeService from '../services/consigneeService';
import * as AWBService from '../services/AWBService';
import {AWBCreateData} from '../types/awbTypes';


export const getIndustryTypes = async (_req: Request, res: Response) => {
  try {
    const industryTypes = await masterDataService.getIndustryTypes();
    res.send({ code: 200, message: `Successful`, data: industryTypes })
  } catch (error) {
    console.error('Error retrieving industry types:', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const getCommodities = async (_req: Request, res: Response) => {
  try {
    const commodities = await masterDataService.getCommodities();
    res.send({ code: 200, message: `Successful`, data: commodities })
  } catch (error) {
    console.error('Error retrieving commodities:', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await masterDataService.getCities();
    res.send({ code: 200, message: `Successful`, data: cities })
  } catch (error) {
    console.error('Error retrieving cities:', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const getDistricts = async (req: Request, res: Response) => {
  try {
    const districts = await masterDataService.getDistricts();
    res.send({ code: 200, message: `Successful`, data: districts })
  } catch (error) {
    console.error('Error retrieving districts:', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const getStates = async (req: Request, res: Response) => {
  try {
    const states = await masterDataService.getStates();
    res.send({ code: 200, message: `Successful`, data: states })
  } catch (error) {
    console.error('Error retrieving states:', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const getPincodes = async (_req: Request, res: Response) => {
  try {
    const pincodes = await masterDataService.getPincodes();
    res.send({ code: 200, message: `Successful`, data: pincodes })
  } catch (error) {
    console.error('Error retrieving pincodes:', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const getBranches = async (_req: Request, res: Response) => {
  try {
    const branches = await masterDataService.getBranches();
    res.send({ code: 200, message: `Successful`, data: branches })
  } catch (error) {
    console.error('Error retrieving branches:', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const getConsignors = async (_req: Request, res: Response) => {
  try {
    const consignors = await consignorService.getConsignors();
    res.send({ code: 200, message: `Successful`, data: consignors })
  } catch (error) {
    console.error('Error retrieving consignors:', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const createConsignors = async (req: Request, res: Response) => {
  const consignorsData = req.body.consignors;
  try {
    const consignors = await consignorService.createConsignors(consignorsData);
    res.send({ code: 200, message: `Consignor Created Successful`, data: consignors })
  } catch (error) {
    console.error('Error creating consignors:', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const getConsignees = async (_req: Request, res: Response) => {
  try {
    const consignees = await consigneeService.getConsignees();
    res.send({ code: 200, message: `Successful`, data: consignees })
  } catch (error) {
    console.error('Error retrieving consignees:', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const createConsignees = async (req: Request, res: Response) => {
  const consigneesData = req.body.consignees;
  try {
    const consignees = await consigneeService.createConsignees(consigneesData);
    res.send({ code: 200, message: `Consignee Created Successful`, data: consignees })
  } catch (error) {
    console.error('Error creating consignees:', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const generateBulkAWBForConsignor = async (req: Request, res: Response) => {
  const { consignorId, awbData }: { consignorId: number, awbData: AWBCreateData[] } = req.body;
  try {
    const result = await AWBService.generateBulkAWBForConsignor(consignorId, awbData);
    res.send({
      code: 200, message: "Created successfully", data: result
    })
  } catch (error) {
    console.error('Error generateBulkAWBForConsignor', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const updateArticleCountForAWB = async (req: Request, res: Response) => {
  const { AWBId, newArticleCount }: { AWBId: number, newArticleCount: number } = req.body;
  try {
    const result = await AWBService.updateArticleCountForAWB(AWBId, newArticleCount);
    res.send({ code: 200, message: `Updated Successfully`, data: result })
  } catch (error) {
    console.error('Error updateArticleCountForAWB', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}

export const generateAWBArticles = async (req: Request, res: Response) => {
  const AWBId: number = req.body.AWBId;

  try {
    const result = await AWBService.generateAWBArticles(AWBId);
    res.send({ code: 200, message: `Articles Generated Successfully`, data: result })
  } catch (error) {
    console.error('Error generateAWBArticles', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }

}

export const addAWBArticles = async (req: Request, res: Response) => {
  const AWBId: number = req.body.AWBId;
  const numArticlesToAdd: number = req.body.numArticlesToAdd

  try {
    const result = await AWBService.addAWBArticles(AWBId, numArticlesToAdd);
    res.send({ code: 200, message: `Articles Aded Successfully`, data: result })
  } catch (error) {
    console.error('Error addAWBArticles', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }

}

export const markAWBArticlesAsPrinted = async (req: Request, res: Response) => {
  const AWBId: number = req.body.AWBId;

  try {
    const result = await AWBService.markAWBArticlesAsPrinted(AWBId);
    res.send({ code: 200, message: `Printed Successfully`, data: result })
  } catch (error) {
    console.error('Error markAWBArticlesAsPrinted', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }

}

export const markAWBArticleAsDeleted = async (req: Request, res: Response) => {
  const articleId: number = req.body.articleId;
  const AWBId: number = req.body.AWBId;

  try {
    const result = await AWBService.markAWBArticleAsDeleted(articleId, AWBId);
    res.send({ code: 200, message: `Removed Successfully`, data: result })
  } catch (error) {
    console.error('Error markAWBArticlesAsDeleted', error);
    res.send({
      code: 500, message: 'Internal Server Error',
    });
  }
}