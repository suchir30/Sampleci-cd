import { prismaMock } from '../../singleton';
import { AirWayBill, AwbArticle, Consignor } from '@prisma/client';
import prisma from "../../client";
import { generateBulkAWBForConsignor,updateArticleCountForAWB,generateAWBArticles,markAWBArticlesAsPrinted,markAWBArticleAsDeleted} from '../../services/AWBService';
// describe('checking generateBulkAWBForConsignor', () => {
//     beforeEach(() => {
//         // Clear all mocks before each test
//         jest.clearAllMocks();
//     })
//     it('throws an error if AWB list is empty', async () => {
//         const consignorId=1;
//         (prismaMock.consignor.findUniqueOrThrow as jest.Mock).mockResolvedValue(null);
//         await expect(generateBulkAWBForConsignor(consignorId, [])).rejects.toThrow('Create AWB list is empty.');
//     });
//     test('should return false for consignor without branchid', async () => {
//         const consignorsData=[{consignorId:1,consignorCode:"abcd",publicName: 'Har',legalName:"Shith",industryTypeId:1,commodityId:2,address1:"asd",address2:"qe",cityId:3,gstNumber:"sd",stateId:3,panNumber:"jnh",tanNumber:"kj",cinNumber:"jn",taxCategory:"nhgf",parentConsignorId:1,keyContactName:"asd",keyContactDesignation:"lkj",keyContactAddress:"asd",distanceFromBranchKms:2,districtId:1,branchId:null,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)}];
//         (prismaMock.consignor.findUniqueOrThrow as jest.Mock).mockResolvedValue(consignorsData);
//         await expect(generateBulkAWBForConsignor(1,[])).rejects.toThrow();
//     });
//     test('should return false for negative number of articles',async()=>{
//         const consigneeId=1;
//         const awb: Partial<AirWayBill> = {
//             "consignorId": 2,
//             "consigneeId": 5,
//             "toBranchId": 1,
//             "numOfArticles":-10,
//             "AWBCode":"1",
//             "fromBranchId":1
//         };
//         const expected=[{
//             consignorId:2,
//             consigneeId: 5,
//             toBranchId: 1,
//             numOfArticles:-10,
//             AWBCode:"1",
//             fromBranchId:1}];
//         (prismaMock.airWayBill.findFirst as jest.Mock).mockResolvedValue(awb);
//         await expect(generateBulkAWBForConsignor(consigneeId,expected)).rejects.toThrow();
   
//     })
//     test('should return true for creating awb', async () => {
//         const awb: Partial<AirWayBill> = {
//             "consignorId": 2,
//             "consigneeId": 5,
//             "toBranchId": 1,
//             "numOfArticles":10,
//             "AWBCode":"1",
//             "fromBranchId":1
//         };
//         const consigneeId= 5;
//         const expected=[{
//             consignorId:2,
//             consigneeId: 5,
//             toBranchId: 1,
//             numOfArticles:-10,
//             AWBCode:"1",
//             fromBranchId:1}];
//         (prismaMock.airWayBill.createMany as jest.Mock).mockResolvedValue(awb);
//         await expect(generateBulkAWBForConsignor(consigneeId,expected)).resolves.toEqual(true);
//     })
// })
describe('checking updateArticleCountForAWB', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    })

    test('should return true for updating awb with positive newArticle count', async () => {
        const AWBId=1;
        const newArticleCount=1;
        (prismaMock.airWayBill.update as jest.Mock).mockResolvedValue(null);
        await expect(updateArticleCountForAWB(AWBId,newArticleCount)).resolves.toBe(true);
    })
    test('should throw error for updating awb with negative newArticle count', async () => {
        const AWBId=1;
        const newArticleCount=-1;
        (prismaMock.airWayBill.update as jest.Mock).mockResolvedValue(null);
        await expect(updateArticleCountForAWB(AWBId,newArticleCount)).rejects.toThrow("New article count is non-positive.");
    })
})
// describe('checking createAWBArticlesHelper', () => {
//     beforeEach(() => {
//         // Clear all mocks before each test
//         jest.clearAllMocks();
//     })

//     test('should return true for creating articles', async () => {
//         const AWBId=1;
//         const AWBCode="1";
//         const numArticlesToAdd=2;
//         (prismaMock.airWayBill.createMany as jest.Mock).mockResolvedValue(null);
//         await expect(createAWBArticlesHelper(prisma,AWBId,AWBCode,numArticlesToAdd)).resolves.toEqual(true);
//     })
//     test("should return true for finding many articles",async()=>{
//         const AWBId=1;
//         const AWBCode="1";
//         const numArticlesToAdd=2;
//         (prismaMock.airWayBill.findMany as jest.Mock).mockResolvedValue(null);
//         await expect(createAWBArticlesHelper(prisma,AWBId,AWBCode,numArticlesToAdd)).resolves.toBe(true);
    
//     })

// })
// describe('checking generateAWBArticles', () => {
//     beforeEach(() => {
//         // Clear all mocks before each test
//         jest.clearAllMocks();
//     })
//     test("should return true for findmany",async()=>{
//         const awb: Partial<AirWayBill> = {"id": 2,};
//         const AWBId=2;
//         (prismaMock.airWayBill.findUniqueOrThrow as jest.Mock).mockResolvedValue(awb);
//         await expect(generateAWBArticles(AWBId)).resolves.toBe(true);
    
//     })
//     test("should return true for findmany",async()=>{
//         const awb: Partial<AirWayBill> = {"id": 2,};
//         const AWBId=2;
//         (prismaMock.airWayBill.findFirst as jest.Mock).mockResolvedValue(awb);
//         await expect(generateAWBArticles(AWBId)).resolves.toBe(true);
    
//     })
// })
describe('checking markAWBArticlesAsPrinted', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    })

    test('should return true for update Many', async () => {
        const AWBId=1;
        (prismaMock.awbArticle.update as jest.Mock).mockResolvedValue(null);
        await expect(markAWBArticlesAsPrinted(AWBId)).resolves.toBe(true);
    })
})
describe('checking markAWBArticlesAsDeleted', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    })

    test('should return true for delete Many', async () => {
        const awb: Partial<AwbArticle> = {
            "id":1,
            "AWBId":1
        };
        const AWBId=1;
        const articleId=1;
        (prismaMock.awbArticle.findMany as jest.Mock).mockResolvedValue(awb);
        await expect(markAWBArticleAsDeleted(articleId,AWBId)).resolves.toBe(true);
    })
})