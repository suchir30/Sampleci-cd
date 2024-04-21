import { prismaMock } from '../../singleton';
import { Consignor } from '@prisma/client';
import prisma from "../../client";
import { createConsignors,getConsignors } from '../../services/consignorService';
describe('checking getting of consignors', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    })
    test("should return values list",async()=>{
        const consignordemo: Partial<Consignor> = {
            consignorId:1,consignorCode:"abcd",publicName: 'Har',legalName:"Shith",industryTypeId:1,
            commodityId:2,address1:"asd",address2:"qe",cityId:3,gstNumber:"sd",stateId:3,panNumber:"jnh",
            tanNumber:"kj",cinNumber:"jn",taxCategory:"nhgf",parentConsignorId:1,keyContactName:"asd",
            keyContactDesignation:"lkj",keyContactAddress:"asd",distanceFromBranchKms:2,districtId:1,
            branchId:1,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)};
        const expected={
            consignorId:1,consignorCode:"abcd",publicName: 'Har',legalName:"Shith",industryTypeId:1,
            commodityId:2,address1:"asd",address2:"qe",cityId:3,gstNumber:"sd",stateId:3,panNumber:"jnh",
            tanNumber:"kj",cinNumber:"jn",taxCategory:"nhgf",parentConsignorId:1,keyContactName:"asd",
            keyContactDesignation:"lkj",keyContactAddress:"asd",distanceFromBranchKms:2,districtId:1,
            branchId:1,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)};
        (prismaMock.consignor.findMany as jest.Mock).mockResolvedValue(consignordemo);
        await expect(getConsignors()).resolves.toEqual(expected);
    })
})
describe('checking isActive is true', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    })
    test('should return true for valid consignor', async () => {
        const consignorDb:Partial<Consignor>={consignorId:1,consignorCode:"abcd",gstId:1,publicName: 'Har',legalName:"Shith",industryTypeId:1,commodityId:2,address1:"asd",address2:"qe",cityId:3,gstNumber:"sd",stateId:3,panNumber:"jnh",tanNumber:"kj",cinNumber:"jn",taxCategory:"nhgf",parentConsignorId:1,keyContactName:"asd",keyContactDesignation:"lkj",keyContactAddress:"asd",distanceFromBranchKms:2,districtId:1,branchId:1,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)};
        const consignorsData=[{consignorId:1,consignorCode:"abcd",gstId:1,publicName: 'Har',legalName:"Shith",industryTypeId:1,commodityId:2,address1:"asd",address2:"qe",cityId:3,gstNumber:"sd",stateId:3,panNumber:"jnh",tanNumber:"kj",cinNumber:"jn",taxCategory:"nhgf",parentConsignorId:1,keyContactName:"asd",keyContactDesignation:"lkj",keyContactAddress:"asd",distanceFromBranchKms:2,districtId:1,branchId:1,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)}];
        (prismaMock.consignor.createMany as jest.Mock).mockResolvedValue(consignorDb);
        await expect(createConsignors(consignorsData)).resolves.toEqual(consignorDb);
    });
})