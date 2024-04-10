import { prismaMock } from '../../singleton';
import { Consignee } from '@prisma/client';
import prisma from "../../client";
import { getConsignees,createConsignees } from '../../services/consigneeService';
describe('checking getting of consignees', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    })
    test("should return values list",async()=>{
        const consigneedemo: Partial<Consignee> = {
            consigneeId:1,consignorId:1,consigneeCode:"asd",consigneeName:"har",phone1:"1234567890",phone2:"1234567890",email:"abc@gmail.com",address1:"asd",address2:"asd",cityId:1,districtId:9,stateId:3,branchId:1,distanceToBranchKms:1,odaType:"ji",tatNumber:2,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)
        };
        const expected={consigneeId:1,consignorId:1,consigneeCode:"asd",consigneeName:"har",phone1:"1234567890",phone2:"1234567890",email:"abc@gmail.com",address1:"asd",address2:"asd",cityId:1,districtId:9,stateId:3,branchId:1,distanceToBranchKms:1,odaType:"ji",tatNumber:2,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)};
        (prismaMock.consignee.findMany as jest.Mock).mockResolvedValue(consigneedemo);
        await expect(getConsignees()).resolves.toEqual(expected);
    })
})
describe('checking creation of consignors', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    })
    test('should return true for valid consignor', async () => {
        const consigneesData=[{consigneeId:1,consignorId:1,consigneeCode:"asd",consigneeName:"har",phone1:"1234567890",phone2:"1234567890",email:"abc@gmail.com",address1:"asd",address2:"asd",cityId:1,districtId:9,stateId:3,branchId:1,distanceToBranchKms:1,odaType:"ji",tatNumber:2,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)}];
        (prismaMock.consignee.createMany as jest.Mock).mockResolvedValue(null);
        await expect(createConsignees(consigneesData)).resolves.toEqual(true);
    });
    it("should return false for missing mandatory fields", async () => {
        const consigneesData=[{consigneeId:1,consignorId:NaN,consigneeCode:"",consigneeName:"",phone1:"1234567890",phone2:"1234567890",email:"abc@gmail.com",address1:"asd",address2:"asd",cityId:1,districtId:9,stateId:3,branchId:1,distanceToBranchKms:1,odaType:"ji",tatNumber:2,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)}];
        (prismaMock.consignee.createMany as jest.Mock).mockResolvedValue(consigneesData);
        await expect(createConsignees(consigneesData)).resolves.toEqual(false);
    })
    it("should return false for invalid mobile numbers and email", async () => {
        const consigneesData=[{consigneeId:1,consignorId:1,consigneeCode:"asd",consigneeName:"har",phone1:"12345678",phone2:"12345678908",email:"abc@gmail",address1:"asd",address2:"asd",cityId:1,districtId:9,stateId:3,branchId:1,distanceToBranchKms:1,odaType:"ji",tatNumber:2,createdOn:new Date(1990, 4, 7),modifiedOn:new Date(1990, 4, 7)}];
        (prismaMock.consignee.createMany as jest.Mock).mockResolvedValue(consigneesData);
        await expect(createConsignees(consigneesData)).resolves.toEqual(false);
    })
})