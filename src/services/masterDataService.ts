import prisma from '../client';

export const getIndustryTypes = async () => {
  try {
    const industrytypes = await prisma.industryTypeMaster.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        value: true,
      },
    });
    return industrytypes;
  } catch (error) {
    console.log('Error retrieving industry types', error);
    throw error;
  }
}

export const getCommodities = async () => {
  try {
    const commodities = await prisma.commodityMaster.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        value: true,
      },
    });
    return commodities;
  } catch (error) {
    console.log('Error retrieving commodities', error);
    throw error;
  }
}

export const getCities = async () => {
  try {
    const cities = await prisma.cityMaster.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      }
    });
    return cities;
  } catch (error) {
    console.log('Error retrieving cities', error);
    throw error
  }
}

export const getDistricts = async () => {
  try {
    const districts = await prisma.districtMaster.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      }
    });
    return districts;
  } catch (error) {
    console.log('Error retrieving districts', error);
    throw error
  }
}

export const getStates = async () => {
  try {
    const states = await prisma.stateMaster.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      }
    });
    return states;
  } catch (error) {
    console.log('Error retrieving districts', error);
    throw error
  }
}


export const getPincodes = async () => {
  try {
    const pincodes = await prisma.pincodesMaster.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        value: true,
      },
    });
    return pincodes;
  } catch (error) {
    console.log('Error retrieving pincodes', error);
    throw error
  }
}



export const getBranches = async (isHub:boolean) => {
  try {
    const whereClause = isHub !== undefined ? { isHub: isHub } : {};
    const branches = await prisma.branch.findMany({
      where: whereClause,
      select: {
        id: true,
        branchCode: true,
        branchName: true,
        address1: true,
        address2: true,
        city: true,
        phone1: true,
        phone2: true,
        isHub: true,
        district: {
          select: {
            name: true
          }
        },
        state: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        branchName: 'asc' //sort the results by branchName 
      }
      
    });
    return branches;
  } catch (error) {
    console.error('Error retrieving branches:', error);
    throw error;
  }
}

export const getGstList = async () => {
  try {
    const gstList = await prisma.gstMaster.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      }
    });
    return gstList;
  } catch (error) {
    console.log('Error retrieving districts', error);
    throw error
  }
}

export const getConsignorBranches = async (consignorId:number) => {
  try {
    const consignorRateTables = await prisma.consignorRateTable.findMany({
      where: {
        consignorId: consignorId,
      },
      select: {
        ratePerKg:true,
        status:true,
        consignorId:true,
        branch: {
          select: {
            id:true,
            branchName: true,
            branchCode: true,
            address1: true,
            address2: true,
            city: {
              select: {
                name: true,
              },
            },
            district: {
              select: {
                name: true,
              },
            },
            state: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    return consignorRateTables;
  } catch (error) {
    console.log('Error retrieving districts', error);
    throw error
  }
}

export const addConsignorBranch = async (consignorId: number, branchId: number) => {
  try {
    const checkRes = await prisma.consignorRateTable.findMany({
      where: {
        consignorId: consignorId,
        branchId:branchId
      },
    })

    console.log(checkRes,"$$$$$$$$",checkRes.length)
    if(checkRes.length>0){
      return 'Already Exists'
    }
    else{
      const consignorRateTable = await prisma.consignorRateTable.create({
        data: {
          consignorId: consignorId,
          branchId: branchId,
        },
      });
      return consignorRateTable;
    }
  
  } catch (error) {
    console.log('Error adding consignor branch:', error);
    throw error;
  }
}


export const getEmployees = async () => {
  try {
    const gstList = await prisma.user.findMany({
    });
    return gstList;
  } catch (error) {
    console.log('Error retrieving getEmployees', error);
    throw error
  }
}