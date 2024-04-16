import { Router } from 'express';
import * as apiController from '../controllers/apiController';

const router = Router();

// Master models
router.get('/industryType', apiController.getIndustryTypes);
router.get('/commodity', apiController.getCommodities);
router.get('/city', apiController.getCities);
router.get('/district', apiController.getDistricts);
router.get('/state', apiController.getStates);
router.get('/pincode', apiController.getPincodes);

// Model GET
router.get('/branch', apiController.getBranches);
router.get('/consignor', apiController.getConsignors);
router.get('/gstList', apiController.getGstList);

// Model POST
router.post('/getConsignorBranches', apiController.getConsignorBranches);
router.post('/addConsignorBranch', apiController.addConsignorBranch);
router.post('/consignee', apiController.getConsignees);
router.post('/consignor', apiController.createConsignors);
router.post('/consignee', apiController.createConsignees);
router.post('/AWB/generateAWB', apiController.generateBulkAWBForConsignor);
router.post('/AWB/updateArticleCount', apiController.updateArticleCountForAWB);
router.post('/AWB/generateAWBArticles', apiController.generateAWBArticles);
router.post('/AWB/addAWBArticles', apiController.addAWBArticles);
router.post('/AWB/markAWBArticlesAsPrinted', apiController.markAWBArticlesAsPrinted);
router.post('/AWB/markAWBArticleAsDeleted', apiController.markAWBArticleAsDeleted);

export default router;