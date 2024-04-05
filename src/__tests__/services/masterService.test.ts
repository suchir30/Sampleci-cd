import { IndustryTypeMaster } from "@prisma/client";
import { getIndustryTypes,getBranches,getCities,getCommodities,getDistricts,getPincodes,getStates } from "../../services/masterDataService";
import { prismaMock } from "../../singleton";

describe('getIndustryTypes',()=>{
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    test("should return values list",async()=>{
        
    })
})