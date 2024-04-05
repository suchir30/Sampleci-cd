import { prismaMock } from '../../singleton';
import { Consignor } from '@prisma/client';
import prisma from "../../client";
import { createConsignors } from '../../services/consignorService';
describe('checking isActive is true', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    })
    test('should return true for valid consignor', async () => {
        const consignorsData=[{consignorId:1,consignorCode:"abcd",publicName: 'Har',legalName:"Shith",industryTypeId:1,commodityId:2,address1:"asd",address2:"qe",cityId:3,gstNumber:"sd",stateId:3,panNumber:"jnh",tanNumber:"kj",cinNumber:"jn",taxCategory:"nhgf",parentConsignorId:1,keyContactName:"asd",keyContactDesignation:"lkj",keyContactAddress:"asd",distanceFromBranchKms:2,districtId:1,branchId:1,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)}];
        (prismaMock.consignor.createMany as jest.Mock).mockResolvedValue(null);
        await expect(createConsignors(consignorsData)).resolves.toEqual(true);
    });
    it("should return false for missing mandatory fields", async () => {
        const consignorsData=[{consignorId:1,consignorCode:"abcd",publicName: '',legalName:"",industryTypeId:1,commodityId:2,address1:"asd",address2:"qe",cityId:3,gstNumber:"sd",stateId:3,panNumber:"jnh",tanNumber:"kj",cinNumber:"jn",taxCategory:"nhgf",parentConsignorId:1,keyContactName:"asd",keyContactDesignation:"lkj",keyContactAddress:"asd",distanceFromBranchKms:2,districtId:1,branchId:1,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)}];
        (prismaMock.consignor.createMany as jest.Mock).mockResolvedValue(consignorsData);
        await expect(createConsignors(consignorsData)).resolves.toEqual(false);
    })
})