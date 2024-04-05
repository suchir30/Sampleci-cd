import { Branch, CityMaster, CommodityMaster, DistrictMaster, IndustryTypeMaster, PincodesMaster, StateMaster } from "@prisma/client";
import { getIndustryTypes,getBranches,getCities,getCommodities,getDistricts,getPincodes,getStates } from "../../services/masterDataService";
import { prismaMock } from "../../singleton";

describe('getIndustryTypes',()=>{
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    test("should return values list",async()=>{
        const industry: Partial<IndustryTypeMaster> = {
            id: 1,
            value: "test",
            isActive:true,
            createdOn:new Date(2003,1,1)
        };
        const expected = {id:1,value:"test",isActive:true,createdOn:new Date(2003,1,1)};
        (prismaMock.industryTypeMaster.findMany as jest.Mock).mockResolvedValue(industry);
        await expect(getIndustryTypes()).resolves.toEqual(expected);
    })
})
describe('getCities',()=>{
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    test("should return values list",async()=>{
        const city: Partial<CityMaster> = {
            id: 1,
            name: "test",
            isActive:true,
            createdOn:new Date(2003,1,1)
        };
        const expected = {id:1,name:"test",isActive:true,createdOn:new Date(2003,1,1)};
        (prismaMock.cityMaster.findMany as jest.Mock).mockResolvedValue(city);
        await expect(getCities()).resolves.toEqual(expected);
    })
})
describe('getCommodities',()=>{
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    test("should return values list",async()=>{
        const commodities: Partial<CommodityMaster> = {
            id: 1,
            value: "test",
            isActive:true,
            createdOn:new Date(2003,1,1)
        };
        const expected = {id:1,value:"test",isActive:true,createdOn:new Date(2003,1,1)};
        (prismaMock.commodityMaster.findMany as jest.Mock).mockResolvedValue(commodities);
        await expect(getCommodities()).resolves.toEqual(expected);
    })
})
describe('getDistricts',()=>{
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    test("should return values list",async()=>{
        const district: Partial<DistrictMaster> = {
            id: 1,
            name: "test",
            isActive:true,
            createdOn:new Date(2003,1,1)
        };
        const expected = {id:1,name:"test",isActive:true,createdOn:new Date(2003,1,1)};
        (prismaMock.districtMaster.findMany as jest.Mock).mockResolvedValue(district);
        await expect(getDistricts()).resolves.toEqual(expected);
    })
})
describe('getstates',()=>{
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    test("should return values list",async()=>{
        const state: Partial<StateMaster> = {
            id: 1,
            name: "test",
            isActive:true,
            createdOn:new Date(2003,1,1)
        };
        const expected = {id:1,name:"test",isActive:true,createdOn:new Date(2003,1,1)};
        (prismaMock.stateMaster.findMany as jest.Mock).mockResolvedValue(state);
        await expect(getStates()).resolves.toEqual(expected);
    })
})
describe('getpincodes',()=>{
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    test("should return values list",async()=>{
        const pincode: Partial<PincodesMaster> = {
            id: 1,
            value: 507003,
            isActive:true,
            createdOn:new Date(2003,1,1)
        };
        const expected = {id:1,value:507003,isActive:true,createdOn:new Date(2003,1,1)};
        (prismaMock.pincodesMaster.findMany as jest.Mock).mockResolvedValue(pincode);
        await expect(getPincodes()).resolves.toEqual(expected);
    })
})
describe('getBranches',()=>{
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    test("should return values list",async()=>{
        const branch: Partial<Branch> = {
            id: 1,
            branchCode:"test1",
            branchName:"test2",
            isHub:true,
            isActive:true,
            createdOn:new Date(2003,1,1)
        };
        const expected = {id:1,branchCode:"test1",branchName:"test2",isHub:true,isActive:true,createdOn:new Date(2003,1,1)};
        (prismaMock.branch.findMany as jest.Mock).mockResolvedValue(branch);
        await expect(getBranches()).resolves.toEqual(expected);
    })
})