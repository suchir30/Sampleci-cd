import { prismaMock } from '../../singleton';
import { AirWayBill, ArticleStatus, AwbArticle, Consignor } from '@prisma/client';
import prisma from "../../client";
import { generateBulkAWBForConsignor,updateArticleCountForAWB,generateAWBArticles,markAWBArticlesAsPrinted,markAWBArticleAsDeleted, addAWBArticles, getGeneratedAWB, getAWBArticles} from '../../services/AWBService';

describe('checking generateBulkAWBForConsignor', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    })
    // it('throws an error if AWB list is empty', async () => {
    //     const consignorId=1;
    //     (prismaMock.consignor.findUniqueOrThrow as jest.Mock).mockResolvedValue(null);
    //     await expect(generateBulkAWBForConsignor(consignorId, [])).rejects.toThrow('Create AWB list is empty.');
    // });
    // test('should return false for consignor without branchid', async () => {
    //     const consignorsData=[{consignorId:1,consignorCode:"abcd",publicName: 'Har',legalName:"Shith",industryTypeId:1,commodityId:2,address1:"asd",address2:"qe",cityId:3,gstNumber:"sd",stateId:3,panNumber:"jnh",tanNumber:"kj",cinNumber:"jn",taxCategory:"nhgf",parentConsignorId:1,keyContactName:"asd",keyContactDesignation:"lkj",keyContactAddress:"asd",distanceFromBranchKms:2,districtId:1,branchId:null,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)}];
    //     (prismaMock.consignor.findUniqueOrThrow as jest.Mock).mockResolvedValue(consignorsData);
    //     await expect(generateBulkAWBForConsignor(1,[])).rejects.toThrow();
    // });
    // test('should return false for negative number of articles',async()=>{
    //     const consigneeId=5;
    //     const check=[{
    //         consignorId:2,
    //         consigneeId: 5,
    //         toBranchId: 1,
    //         numOfArticles:-10,
    //         AWBCode:"1",
    //         fromBranchId:1}];
    //     (prismaMock.airWayBill.createMany as jest.Mock).mockResolvedValue(null);
    //     await expect(generateBulkAWBForConsignor(consigneeId,check)).rejects.toThrow();
   
    // })
    test('should return true for creating awb', async () => {
        // const awb: Partial<AirWayBill> = {
        //     "consignorId": 2,
        //     "consigneeId": 5,
        //     "toBranchId": 1,
        //     "numOfArticles":10,
        //     "AWBCode":"1",
        //     "fromBranchId":1
        // };
        const consigneeId= 5;
        const check=[{
            consignorId:2,
            consigneeId: 5,
            toBranchId: 1,
            numOfArticles:10,
            AWBCode:"1",
            fromBranchId:1}];
        (prismaMock.airWayBill.createMany as jest.Mock).mockResolvedValue(null);
        await expect(generateBulkAWBForConsignor(consigneeId,check)).resolves.toBe(true);
    })
})
describe('getGeneratedAWB function', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear all mocks after each test
    });
    test('should return generated AWB with route if consignorId is provided', async () => {
        const mockAWBData = [
            {
                id: 1,
                AWBCode: '123',
                consignorId: 2,
                consigneeId: 2,
                fromBranchId: 1,
                toBranchId: 2,
                numOfArticles: 3,
                consignor: {
                    consignorCode: 'CON123',
                    publicName: 'Consignor Public Name',
                    legalName: 'Consignor Legal Name',
                    address1: 'Consignor Address 1',
                },
                consignee: {
                    consigneeCode: 'CONEE123',
                    consigneeName: 'Consignee Name',
                    address1: 'Consignee Address 1',
                    address2: 'Consignee Address 2',
                    city: {
                        name: 'City Name',
                    },
                    district: {
                        name: 'District Name',
                    },
                    state: {
                        name: 'State Name',
                    },
                },
                fromBranch: {
                    branchName: 'From Branch Name',
                },
                toBranch: {
                    branchName: 'To Branch Name',
                },
                AWBIdTripLineItems: [
                    {
                        id: 1,
                        tripId: 1,
                        nextDestinationId: 2,
                        finalDestinationId: 3,
                        status: 'Assigned',
                        ePODReceived: false,
                        originalPODReceived: false,
                        trip: {
                            route: 'Trip Route',
                        },
                    },
                ],
            },
        ];
        (prismaMock.airWayBill.findMany as jest.Mock).mockResolvedValue(mockAWBData);
        // const result = await getGeneratedAWB(2, 'PickUp');
        // Expected response
        const expectedResponse = [
            {
                id: 1,
                AWBCode: '123',
                consignorId: 2,
                consigneeId: 2,
                fromBranchId: 1,
                toBranchId: 2,
                numOfArticles: 3,
                consignor: {
                    consignorCode: 'CON123',
                    publicName: 'Consignor Public Name',
                    legalName: 'Consignor Legal Name',
                    address1: 'Consignor Address 1',
                },
                consignee: {
                    consigneeCode: 'CONEE123',
                    consigneeName: 'Consignee Name',
                    address1: 'Consignee Address 1',
                    address2: 'Consignee Address 2',
                    city: {
                        name: 'City Name',
                    },
                    district: {
                        name: 'District Name',
                    },
                    state: {
                        name: 'State Name',
                    },
                },
                fromBranch: {
                    branchName: 'From Branch Name',
                },
                toBranch: {
                    branchName: 'To Branch Name',
                },
                AWBIdTripLineItems: [
                    {
                        id: 1,
                        tripId: 1,
                        nextDestinationId: 2,
                        finalDestinationId: 3,
                        status: 'Assigned',
                        ePODReceived: false,
                        originalPODReceived: false,
                        trip: {
                            route: 'Trip Route',
                        },
                    },
                ],
            },
        ];
        await expect(getGeneratedAWB(2, 'PickUp')).resolves.toEqual(expectedResponse);
    });
});
describe('getAWBArticles function', () => {
        afterEach(() => {
            jest.clearAllMocks(); // Clear all mocks after each test
        });
        test('should return generated AWB with route if consignorId is provided', async () => {
            const mockArticleData = [{
                id: 2,
                articleCode: "abcd",
                AWB: {
                    id: 2,
                    fromBranchId: 1,
                    toBranchId: 1,
                    numOfArticles: 10,
                    consignee: {
                        consigneeName: "a",
                        consigneeCode: "cd"
                    },
                    consignor: {
                        publicName: "as",
                        consignorCode: "l"
                    },
                    fromBranch: {
                        branchName: "SATHUPALLI"
                    },
                    toBranch: {
                        branchName: "SATHUPALLI"
                    }
                }
            }
        ];
        (prismaMock.awbArticle.findMany as jest.Mock).mockResolvedValue(mockArticleData);
            const result = await getAWBArticles(2);
            const expected = [{
                id: 2,
                articleCode: "abcd",
                AWB: {
                    id: 2,
                    fromBranchId: 1,
                    toBranchId: 1,
                    numOfArticles: 10,
                    consignee: {
                        consigneeName: "a",
                        consigneeCode: "cd"
                    },
                    consignor: {
                        publicName: "as",
                        consignorCode: "l"
                    },
                    fromBranch: {
                        branchName: "SATHUPALLI"
                    },
                    toBranch: {
                        branchName: "SATHUPALLI"
                    }
                }
            }
        ]; 
            
        expect(result).toEqual(expected);
    });
    });
describe('checking updateArticleCountForAWB', () => {
        beforeEach(() => {
            // Clear all mocks before each test
            jest.clearAllMocks();
        })
        
        test('should return true for updating awb with positive newArticle count', async () => {
            const awb: Partial<AirWayBill> = {
                "id":1,
                "consignorId": 2,
                "consigneeId": 5,
                "toBranchId": 1,
                "numOfArticles":10,
                "AWBCode":"1",
                "fromBranchId":1
            };
            const AWBId=1;
            const newArticleCount=1;
            const expected={
                "id":1,
                "consignorId": 2,
                "consigneeId": 5,
                "toBranchId": 1,
                "numOfArticles":10,
                "AWBCode":"1",
                "fromBranchId":1
            };
            (prismaMock.airWayBill.update as jest.Mock).mockResolvedValue(awb);
            await expect(updateArticleCountForAWB(AWBId,newArticleCount)).resolves.toEqual(expected);
        })
        test('should return true for updating awb with positive newArticle count', async () => {
            const awb: Partial<AirWayBill> = {
                "id":1,
                "consignorId": 2,
                "consigneeId": 5,
                "toBranchId": 1,
                "numOfArticles":10,
                "AWBCode":"1",
                "fromBranchId":1
            };
            const AWBId=1;
            const newArticleCount=-1;
            // const expected={
            //     "id":1,
            //     "consignorId": 2,
            //     "consigneeId": 5,
            //     "toBranchId": 1,
            //     "numOfArticles":10,
            //     "AWBCode":"1",
                // "fromBranchId":1
            // };
            (prismaMock.airWayBill.update as jest.Mock).mockResolvedValue(awb);
            await expect(updateArticleCountForAWB(AWBId,newArticleCount)).rejects.toThrow();
        })
    })
describe('checking generateAWBArticles', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    })
    test("should return true for findmany",async()=>{
        const awb: Partial<AirWayBill> = {"id": 3,};
        const AWBId=4;
        (prismaMock.airWayBill.findMany as jest.Mock).mockResolvedValue(awb);
        await expect(generateAWBArticles(AWBId)).resolves.toBe(true);
    
    })
})
describe('checking addAWBarticles', () => {
        beforeEach(() => {
            // Clear all mocks before each test
            jest.clearAllMocks();
        })
        test('should return true for positive numArticlesToAdd', async () => {
            const awb: Partial<AirWayBill> = {
                "id":1,
                "consignorId": 2,
                "consigneeId": 5,
                "toBranchId": 1,
                "numOfArticles":10,
                "AWBCode":"1",
                "fromBranchId":1
            };
            const AWBId= 1;
            const numArticlesToAdd= 5;
            (prismaMock.airWayBill.update as jest.Mock).mockResolvedValue(awb);
            await expect(addAWBArticles(AWBId,numArticlesToAdd)).resolves.toBe(true);
        })
        // test('should return false for negative numArticlesToAdd', async () => {
        //     const awb: Partial<AirWayBill> = {
        //         "id":1,
        //         "consignorId": 2,
        //         "consigneeId": 5,
        //         "toBranchId": 1,
        //         "numOfArticles":10,
        //         "AWBCode":"1",
        //         "fromBranchId":1
        //     };
        //     const AWBId= 1;
        //     const numArticlesToAdd= -5;
        //     (prismaMock.airWayBill.update as jest.Mock).mockResolvedValue(awb);
        //     await expect(addAWBArticles(AWBId,numArticlesToAdd)).rejects.toThrow();
        // })
    })
describe('checking markAWBArticlesAsPrinted', () => {
    
        beforeEach(() => {
            // Clear all mocks before each test
            jest.clearAllMocks();
        })
    
        test('should return true for update Many', async () => {
            const awb: Partial<AwbArticle> = {
                "id":1,
                "AWBId":1,
                "status":"Created"
            };
            const AWBId=2;
            (prismaMock.awbArticle.update as jest.Mock).mockResolvedValue(awb);
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
                "AWBId":1,
                "status":ArticleStatus.Created
            };
            const AWBId=1;
            const articleId=1;
            // const expected = {
            //     id:1,
            //     AWBId:1,
            //     status:ArticleStatus.Deleted
            // };
            (prismaMock.awbArticle.findMany as jest.Mock).mockResolvedValue(awb);
            await expect(markAWBArticleAsDeleted(articleId,AWBId)).resolves.toBe(true);
        })
    })
    describe('getGeneratedAWB function', () => {
        afterEach(() => {
            jest.clearAllMocks(); // Clear all mocks after each test
        });
        test('should return generated AWB with route if consignorId is provided', async () => {
            const mockAWBData = [
                {
                    id: 1,
                    AWBCode: '123',
                    consignorId: 2,
                    consigneeId: 2,
                    fromBranchId: 1,
                    toBranchId: 2,
                    numOfArticles: 3,
                    consignor: {
                        consignorCode: 'CON123',
                        publicName: 'Consignor Public Name',
                        legalName: 'Consignor Legal Name',
                        address1: 'Consignor Address 1',
                    },
                    consignee: {
                        consigneeCode: 'CONEE123',
                        consigneeName: 'Consignee Name',
                        address1: 'Consignee Address 1',
                        address2: 'Consignee Address 2',
                        city: {
                            name: 'City Name',
                        },
                        district: {
                            name: 'District Name',
                        },
                        state: {
                            name: 'State Name',
                        },
                    },
                    fromBranch: {
                        branchName: 'From Branch Name',
                    },
                    toBranch: {
                        branchName: 'To Branch Name',
                    },
                    AWBIdTripLineItems: [
                        {
                            id: 1,
                            tripId: 1,
                            nextDestinationId: 2,
                            finalDestinationId: 3,
                            status: 'Assigned',
                            ePODReceived: false,
                            originalPODReceived: false,
                            trip: {
                                route: 'Trip Route',
                            },
                        },
                    ],
                },
            ];
            (prismaMock.airWayBill.findMany as jest.Mock).mockResolvedValue(mockAWBData);
            const result = await getGeneratedAWB(2, 'PickUp');
            // Expected response
            const expectedResponse = [
                {
                    id: 1,
                    AWBCode: '123',
                    consignorId: 2,
                    consigneeId: 2,
                    fromBranchId: 1,
                    toBranchId: 2,
                    numOfArticles: 3,
                    consignor: {
                        consignorCode: 'CON123',
                        publicName: 'Consignor Public Name',
                        legalName: 'Consignor Legal Name',
                        address1: 'Consignor Address 1',
                    },
                    consignee: {
                        consigneeCode: 'CONEE123',
                        consigneeName: 'Consignee Name',
                        address1: 'Consignee Address 1',
                        address2: 'Consignee Address 2',
                        city: {
                            name: 'City Name',
                        },
                        district: {
                            name: 'District Name',
                        },
                        state: {
                            name: 'State Name',
                        },
                    },
                    fromBranch: {
                        branchName: 'From Branch Name',
                    },
                    toBranch: {
                        branchName: 'To Branch Name',
                    },
                    AWBIdTripLineItems: [
                        {
                            id: 1,
                            tripId: 1,
                            nextDestinationId: 2,
                            finalDestinationId: 3,
                            status: 'Assigned',
                            ePODReceived: false,
                            originalPODReceived: false,
                            trip: {
                                route: 'Trip Route',
                            },
                        },
                    ],
                },
            ];
            expect(result).toEqual(expectedResponse);
        });
    });