// import { prismaMock } from '../../singleton';
// import { AirWayBill, AwbArticle, Consignor } from '@prisma/client';
// import prisma from "../../client";
// import { generateBulkAWBForConsignor,updateArticleCountForAWB,generateAWBArticles,markAWBArticlesAsPrinted,markAWBArticleAsDeleted, addAWBArticles, getGeneratedAWB} from '../../services/AWBService';

// // describe('checking generateBulkAWBForConsignor', () => {
// //     beforeEach(() => {
// //         // Clear all mocks before each test
// //         jest.clearAllMocks();
// //     })
// //     // it('throws an error if AWB list is empty', async () => {
// //     //     const consignorId=1;
// //     //     (prismaMock.consignor.findUniqueOrThrow as jest.Mock).mockResolvedValue(null);
// //     //     await expect(generateBulkAWBForConsignor(consignorId, [])).rejects.toThrow('Create AWB list is empty.');
// //     // });
// //     // test('should return false for consignor without branchid', async () => {
// //     //     const consignorsData=[{consignorId:1,consignorCode:"abcd",publicName: 'Har',legalName:"Shith",industryTypeId:1,commodityId:2,address1:"asd",address2:"qe",cityId:3,gstNumber:"sd",stateId:3,panNumber:"jnh",tanNumber:"kj",cinNumber:"jn",taxCategory:"nhgf",parentConsignorId:1,keyContactName:"asd",keyContactDesignation:"lkj",keyContactAddress:"asd",distanceFromBranchKms:2,districtId:1,branchId:null,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)}];
// //     //     (prismaMock.consignor.findUniqueOrThrow as jest.Mock).mockResolvedValue(consignorsData);
// //     //     await expect(generateBulkAWBForConsignor(1,[])).rejects.toThrow();
// //     // });
// //     test('should return false for negative number of articles',async()=>{
// //         const consigneeId=5;
// //         const expected=[{
// //             consignorId:2,
// //             consigneeId: 5,
// //             toBranchId: 1,
// //             numOfArticles:-10,
// //             AWBCode:"1",
// //             fromBranchId:1}];
// //         (prismaMock.airWayBill.createMany as jest.Mock).mockResolvedValue(null);
// //         await expect(generateBulkAWBForConsignor(consigneeId,expected)).rejects.toThrow();
   
// //     })
// //     test('should return true for creating awb', async () => {
// //         // const awb: Partial<AirWayBill> = {
// //         //     "consignorId": 2,
// //         //     "consigneeId": 5,
// //         //     "toBranchId": 1,
// //         //     "numOfArticles":10,
// //         //     "AWBCode":"1",
// //         //     "fromBranchId":1
// //         // };
// //         const consigneeId= 5;
// //         const expected=[{
// //             consignorId:2,
// //             consigneeId: 5,
// //             toBranchId: 1,
// //             numOfArticles:10,
// //             AWBCode:"1",
// //             fromBranchId:1}];
// //         (prismaMock.airWayBill.createMany as jest.Mock).mockResolvedValue(null);
// //         await expect(generateBulkAWBForConsignor(consigneeId,expected)).resolves.toBe(true);
// //     })
// // })
// // describe('checking updateArticleCountForAWB', () => {
// //     beforeEach(() => {
// //         // Clear all mocks before each test
// //         jest.clearAllMocks();
// //     })

// //     test('should return true for updating awb with positive newArticle count', async () => {
// //         const AWBId=1;
// //         const newArticleCount=1;
// //         (prismaMock.airWayBill.update as jest.Mock).mockResolvedValue(null);
// //         await expect(updateArticleCountForAWB(AWBId,newArticleCount)).resolves.toBe(true);
// //     })
// //     test('should throw error for updating awb with negative newArticle count', async () => {
// //         const AWBId=1;
// //         const newArticleCount=-1;
// //         (prismaMock.airWayBill.update as jest.Mock).mockResolvedValue(null);
// //         await expect(updateArticleCountForAWB(AWBId,newArticleCount)).rejects.toThrow("New article count is non-positive.");
// //     })
// // })
// // describe('checking getGeneratedAWB', () => {
// //     beforeEach(() => {
// //         // Clear all mocks before each test
// //         jest.clearAllMocks();
// //     })
// //     test("should return non empty array for consignorId that has AWB",async()=>{
// //         const awb:Partial<AirWayBill>={
// //                 id: 1,
// //                 AWBCode: "CUST-A00178160424001",
// //                 consignorId: 10,
// //                 fromBranchId: 1,
// //                 toBranchId: 1,
// //                 numOfArticles: 10,
// //                 AWBStatus:"PickUp",
// //             };
// //             const consignorId=10;
// //             const AWBStatus="PickUp";
// //             (prismaMock.airWayBill.findMany as jest.Mock).mockResolvedValue(awb);
// //             await expect(getGeneratedAWB(consignorId,AWBStatus)).resolves.not.toHaveLength(0);
// //     });
// //     // test("should return empty array for consignorId that doesn't have AWB",async()=>{
// //     //     const awb:Partial<AirWayBill>={
// //     //             id: 1,
// //     //             AWBCode: "CUST-A00178160424001",
// //     //             consignorId: 1,
// //     //             fromBranchId: 1,
// //     //             toBranchId: 1,
// //     //             numOfArticles: 10,
// //     //         };
// //     //         const consignorId=1;
// //     //         const AWBStatus="PickUp";
// //     //         (prismaMock.airWayBill.findMany as jest.Mock).mockResolvedValue(awb);
// //     //         await expect(getGeneratedAWB(consignorId,AWBStatus)).resolves.toHaveLength(0);
// //     // });
// // });
// describe('getGeneratedAWB function', () => {
//     afterEach(() => {
//         jest.clearAllMocks(); // Clear all mocks after each test
//     });
//     test('should return generated AWB with route if consignorId is provided', async () => {
//         const mockAWBData = [
//             {
//                 id: 1,
//                 AWBCode: '123',
//                 consignorId: 2,
//                 consigneeId: 2,
//                 fromBranchId: 1,
//                 toBranchId: 2,
//                 numOfArticles: 3,
//                 consignor: {
//                     consignorCode: 'CON123',
//                     publicName: 'Consignor Public Name',
//                     legalName: 'Consignor Legal Name',
//                     address1: 'Consignor Address 1',
//                 },
//                 consignee: {
//                     consigneeCode: 'CONEE123',
//                     consigneeName: 'Consignee Name',
//                     address1: 'Consignee Address 1',
//                     address2: 'Consignee Address 2',
//                     city: {
//                         name: 'City Name',
//                     },
//                     district: {
//                         name: 'District Name',
//                     },
//                     state: {
//                         name: 'State Name',
//                     },
//                 },
//                 fromBranch: {
//                     branchName: 'From Branch Name',
//                 },
//                 toBranch: {
//                     branchName: 'To Branch Name',
//                 },
//                 AWBIdTripLineItems: [
//                     {
//                         id: 1,
//                         tripId: 1,
//                         nextDestinationId: 2,
//                         finalDestinationId: 3,
//                         status: 'Assigned',
//                         ePODReceived: false,
//                         originalPODReceived: false,
//                         trip: {
//                             route: 'Trip Route',
//                         },
//                     },
//                 ],
//             },
//         ];
//         (prismaMock.airWayBill.findMany as jest.Mock).mockResolvedValue(mockAWBData);
//         const result = await getGeneratedAWB(2, 'PickUp');
//         // Expected response
//         const expectedResponse = [
//             {
//                 id: 1,
//                 AWBCode: '123',
//                 consignorId: 2,
//                 consigneeId: 2,
//                 fromBranchId: 1,
//                 toBranchId: 2,
//                 numOfArticles: 3,
//                 consignor: {
//                     consignorCode: 'CON123',
//                     publicName: 'Consignor Public Name',
//                     legalName: 'Consignor Legal Name',
//                     address1: 'Consignor Address 1',
//                 },
//                 consignee: {
//                     consigneeCode: 'CONEE123',
//                     consigneeName: 'Consignee Name',
//                     address1: 'Consignee Address 1',
//                     address2: 'Consignee Address 2',
//                     city: {
//                         name: 'City Name',
//                     },
//                     district: {
//                         name: 'District Name',
//                     },
//                     state: {
//                         name: 'State Name',
//                     },
//                 },
//                 fromBranch: {
//                     branchName: 'From Branch Name',
//                 },
//                 toBranch: {
//                     branchName: 'To Branch Name',
//                 },
//                 AWBIdTripLineItems: [
//                     {
//                         id: 1,
//                         tripId: 1,
//                         nextDestinationId: 2,
//                         finalDestinationId: 3,
//                         status: 'Assigned',
//                         ePODReceived: false,
//                         originalPODReceived: false,
//                         trip: {
//                             route: 'Trip Route',
//                         },
//                     },
//                 ],
//             },
//         ];
//         expect(result).toEqual(expectedResponse);
//     });
// });
// // describe('getAWBArticles function', () => {
// //     afterEach(() => {
// //         jest.clearAllMocks(); // Clear all mocks after each test
// //     });
// //     test('should return generated AWB with route if consignorId is provided', async () => {
// //         const mockArticleData = [
// //             id: 2,
// //             articleCode: "CUST-A001751704240020002",
// //             AWB: {
// //                 id: 2,
// //                 fromBranchId: 1,
// //                 toBranchId: 1,
// //                 numOfArticles: 10,
// //                 consignee: {
// //                     consigneeName: "SRI RAJA RAJESHWARA  AGENCIES ",
// //                     consigneeCode: "B0004"
// //                 },
// //                 consignor: {
// //                     publicName: "SHERRINGTON PHARMACEUTICALS PVT LTD",
// //                     consignorCode: "CUST-A00175"
// //                 },
// //                 fromBranch: {
// //                     branchName: "SATHUPALLI"
// //                 },
// //                 toBranch: {
// //                     branchName: "SATHUPALLI"
// //                 }
// //             }
// //     ];
// //     (prismaMock.awbArticle.findMany as jest.Mock).mockResolvedValue(mockArticleData);
// //         const result = await getGeneratedAWB(2, 'PickUp');
        
// // });
// // });
























// describe('checking generateAWBArticles', () => {
//     beforeEach(() => {
//         // Clear all mocks before each test
//         jest.clearAllMocks();
//     })
//     test("should return true for findmany",async()=>{
//         const awb: Partial<AirWayBill> = {"id": 3,};
//         const AWBId=2;
//         (prismaMock.airWayBill.findMany as jest.Mock).mockResolvedValue(awb);
//         await expect(generateAWBArticles(AWBId)).resolves.toBe(true);
    
//     })
// })
//     // test("should return true for findmany",async()=>{
//     //     const awb: Partial<AirWayBill> = {"id": 2,};
//     //     const AWBId=2;
//     //     (prismaMock.airWayBill.findFirst as jest.Mock).mockResolvedValue(awb);
//     //     await expect(generateAWBArticles(AWBId)).resolves.toBe(true);
// // describe('checking addAWBarticles', () => {
// //     beforeEach(() => {
// //         // Clear all mocks before each test
// //         jest.clearAllMocks();
// //     })
// //     test('should return true for positive numArticlesToAdd', async () => {
// //         const AWBId= 1;
// //         const numArticlesToAdd= 5;
// //         (prismaMock.airWayBill.update as jest.Mock).mockResolvedValue(null);
// //         await expect(addAWBArticles(AWBId,numArticlesToAdd)).resolves.toBe(true);
// //     })
// //     test('should return false for negative numArticlesToAdd', async () => {
// //         const AWBId= 1;
// //         const numArticlesToAdd= -5;
// //         (prismaMock.airWayBill.update as jest.Mock).mockResolvedValue(null);
// //         await expect(addAWBArticles(AWBId,numArticlesToAdd)).rejects.toThrow();
// //     })
// // })
// //     // })
// // })
// describe('checking markAWBArticlesAsPrinted', () => {
//     beforeEach(() => {
//         // Clear all mocks before each test
//         jest.clearAllMocks();
//     })

//     test('should return true for update Many', async () => {
//         const AWBId=1;
//         (prismaMock.awbArticle.update as jest.Mock).mockResolvedValue(null);
//         await expect(markAWBArticlesAsPrinted(AWBId)).resolves.toBe(true);
//     })
// })
// describe('checking markAWBArticlesAsDeleted', () => {
//     beforeEach(() => {
//         // Clear all mocks before each test
//         jest.clearAllMocks();
//     })

//     test('should return true for delete Many', async () => {
//         const awb: Partial<AwbArticle> = {
//             "id":1,
//             "AWBId":1,
//             "status":"Created"
//         };
//         const AWBId=2;
//         const articleId=2;
//         (prismaMock.awbArticle.findMany as jest.Mock).mockResolvedValue(awb);
//         await expect(markAWBArticleAsDeleted(articleId,AWBId)).resolves.toBe(true);
//     })
// })

// // describe('checking createAWBArticlesHelper', () => {
// //     beforeEach(() => {
// //         // Clear all mocks before each test
// //         jest.clearAllMocks();
// //     })

// //     test('should return true for creating articles', async () => {
// //         const AWBId=1;
// //         const AWBCode="1";
// //         const numArticlesToAdd=2;
// //         (prismaMock.airWayBill.createMany as jest.Mock).mockResolvedValue(null);
// //         await expect(createAWBArticlesHelper(prisma,AWBId,AWBCode,numArticlesToAdd)).resolves.toEqual(true);
// //     })
// //     test("should return true for finding many articles",async()=>{
// //         const AWBId=1;
// //         const AWBCode="1";
// //         const numArticlesToAdd=2;
// //         (prismaMock.airWayBill.findMany as jest.Mock).mockResolvedValue(null);
// //         await expect(createAWBArticlesHelper(prisma,AWBId,AWBCode,numArticlesToAdd)).resolves.toBe(true);
    
// //     })

// // })
