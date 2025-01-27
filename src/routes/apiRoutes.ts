import { Router } from 'express';
import * as apiController from '../controllers/apiController';
import multer from 'multer';
import {getFile} from "../controllers/apiController";
const upload = multer({
  storage: multer.memoryStorage() // Use memory storage instead of disk storage
});
const router = Router();

// Master models
router.get('/industryType', apiController.getIndustryTypes);
router.get('/commodity', apiController.getCommodities);
router.get('/city', apiController.getCities);
router.get('/district', apiController.getDistricts);
router.get('/state', apiController.getStates);
router.get('/pincode', apiController.getPincodes);

// Model GET
router.get('/consignor', apiController.getConsignors);
router.get('/gstList', apiController.getGstList);
router.get('/getEmployees', apiController.getEmployees);
router.get('/getFile', apiController.getFile)


// Model POST
router.post('/branch', apiController.getBranches);
router.post('/getConsignorBranches', apiController.getConsignorBranches);
router.post('/addConsignorBranch', apiController.addConsignorBranch);
router.post('/getConsignee', apiController.getConsignees);
router.post('/consignor', apiController.createConsignors);
router.post('/consignee', apiController.createConsignees);
router.post('/AWB/getAWBs', apiController.getGeneratedAWB);
router.post('/AWB/generateAWB', apiController.generateBulkAWBForConsignor);
router.post('/AWB/updateArticleCount', apiController.updateArticleCountForAWB);
router.post('/AWB/getAWBArticles', apiController.getAWBArticles);
router.post('/AWB/generateAWBArticles', apiController.generateAWBArticles);
router.post('/AWB/addAWBArticles', apiController.addAWBArticles);
router.post('/AWB/markAWBArticlesAsPrinted', apiController.markAWBArticlesAsPrinted);
router.post('/AWB/markAWBArticleAsDeleted', apiController.markAWBArticleAsDeleted);
router.post('/AWB/addTripLineItems',apiController.assignedTriptoAWB)
router.post('/AWB/getAWBDetails',apiController.getUpdateAWB)
router.post('/AWB/updateAWB',apiController.updateAWB)
router.post('/AWB/addAWBLineItems',apiController.updateAWBLineItem)
router.post('/getTrips',apiController.getTrips)
router.post('/addTripCheckin',apiController.addTripCheckin)
router.post('/getTripCheckin',apiController.getTripCheckin)
router.post('/unloadArticlesValidate',apiController.unloadArticlesValidate)
router.post('/loadArticlesValidate',apiController.loadArticlesValidate)
router.post('/getTripDetails',apiController.getTripDetails)
router.post('/getTripLineItems',apiController.getTripLineItems)
router.post('/addAWBArticleLogs',apiController.addAWBArticleLogs)
router.post('/getScannedArticles',apiController.getScannedArticles)
router.post('/outwardAWBs',apiController.outwardAWBs)
router.post('/inwardAWBs',apiController.inwardAWBs)
router.post('/fileUpload', upload.fields([{name: 'file', maxCount: 6}]), apiController.fileUpload)
router.post('/getDepsLists',apiController.getDepsLists)
router.post('/addDeps',apiController.addDeps)
router.post('/generatePDF', apiController.pdfGenerateAWB)
router.post('/getSKUs', apiController.getSKUs)
router.post('/getBoxTypes', apiController.getBoxTypes)
router.post('/generateTripsPDF', apiController.pdfGenerateTrips)
router.post('/generateTripHirePDF', apiController.pdfGenerateTripHire)
router.post('/insertConnectivityPlan', apiController.insertConnectivityPlan)
router.post('/updateTripLineItem', apiController.updateTripLineItem)
router.post('/deliverAWBCheck', apiController.deliverAWBCheck)
router.post('/calculateShippingCosts', apiController.calculateShippingCosts)
router.post('/getExcessDeps', apiController.getExcessDeps)
router.post('/getShortArticles', apiController.getShortArticles)
router.post('/closeDeps', apiController.closeDeps)


router.post('/webhook',apiController.handleWebhook)


export default router;
