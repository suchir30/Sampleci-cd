import { $Enums } from '@prisma/client';
import prisma from '../client';
import moment from 'moment';

export const getTrips = async (tripStatus:any,latestCheckinHubId:number,latestCheckinType:string) => {
  const whereClause: any = { tripStatus: tripStatus, };

  if (tripStatus !== undefined) {
    whereClause.tripStatus = tripStatus;
  }
  if (latestCheckinHubId !== undefined) {
    whereClause.latestCheckinHubId = latestCheckinHubId;
  }
  if (latestCheckinType !== undefined) {
    whereClause.latestCheckinType = latestCheckinType;
  }

    const openTrips = await prisma.tripDetails.findMany({
      where: whereClause,
        select: {
          id:true,
          tripCode: true,
          route: true,
          tripStatus: true,
          numberOfAwb:true, 
          numberOfArticles:true, 
          chargedWeight:true, 
          openingKms:true, 
          closingKms:true, 
          totalKms:true, 
          tripClosingTime:true,
          latestCheckinHubId:true, 
          latestCheckinTime:true, 
          latestCheckinType:true,
          driver:{
            select:{
                id:true,
                driverName:true,
                phone1:true,
                
            }
          },
          vehicle:{
            select:{
                id:true,
                vehicleNum:true,
                vehicleType:true,
            }
          },
        }
       
      });
    return openTrips;
};

export const addTripCheckin = async (inwardTime:string, tripId:number, hubId:number, odometerReading:number,tripType:any,fileId:number) => {
    const today =moment().toISOString();  
    const result=await prisma.$transaction(async prisma => {
        await prisma.tripCheckIn.create({
            data:{
                tripId: tripId,
                locationBranchId: hubId,
                odometerReading: odometerReading,
                time: inwardTime,
                type:tripType,
                odometerImgId:fileId
            }
        })
        await prisma.tripDetails.update({
            where: {
                id: tripId,
            },
            data: {
                latestCheckinHubId: hubId,
                latestCheckinTime: today,
                latestCheckinType: tripType
            }
        })

    })
};

export const getTripCheckin = async (tripType:any) => {
    const openTrips = await prisma.tripCheckIn.findMany({
        select: {
            id:true, 
            tripId:true, 
            type:true, 
            locationBranchId:true, 
            odometerReading:true, 
            time:true,
            trip:{
                select:{
                    id:true,
                    tripCode: true,
                    route: true,
                    tripStatus: true,
                    driver:{
                      select:{
                          id:true,
                          driverName:true,
                          phone1:true,
                          
                      }
                    },
                    vehicle:{
                      select:{
                          id:true,
                          vehicleNum:true,
                          vehicleType:true,
                      }
                    },
                }
            }
          
            
        },
        where: {
            type:tripType
        }
      });
    return openTrips;
};

export const unloadArticlesValidate = async (AWBId:string,AWBArticleId:string,tripId:number) => {
  const result=await prisma.$transaction(async prisma => {
    const AWBIdRes=await prisma.airWayBill.findFirst({
      where :{AWBCode:AWBId}
    })
    const AWBArticleIdRes=await prisma.awbArticle.findFirst({
      where :{articleCode:AWBArticleId, status: {
        not: "Deleted"
      }}
    })

    if(!AWBIdRes){
      return "InvalidAWB"
    }
    if(!AWBArticleIdRes){
      return "InvalidArticle"
    }
    const checkDuplicateRes=await prisma.awbArticleTripLogs.findMany({
      where :{
        AWBArticleId:AWBArticleIdRes?.id,
        tripId:tripId,
        scanType:"Unload"
      }
    })
    if(checkDuplicateRes.length>0){
      return "Duplicate"
    }

    console.log(AWBIdRes?.id,"$$$$",AWBArticleIdRes?.id,checkDuplicateRes.length)
      const tripLineItemRes = await prisma.tripLineItem.findFirst({
          select:{
              id:true,
              AWBId:true,
              tripId:true,
              unloadLocationId:true,
              unloadLocation:{
                  select:{
                      id:true,
                      branchName:true
                  }
              }
          },
          where: {
            AWBId:AWBIdRes?.id,
            tripId:tripId
          }, 
          orderBy: {
              id: 'desc',
          },
        });
        if(tripLineItemRes==null){
          console.log("AWBIDInvalid",tripLineItemRes,AWBIdRes?.id)
          return 'AWBIDInvalid'
        }

        const tripDetailsRes = await prisma.tripDetails.findFirst({
          where: {
            id: tripId
          }, 
          orderBy: {
              id: 'desc',
          },
        });
        console.log(tripDetailsRes?.latestCheckinHubId,"validConditionss",tripLineItemRes?.unloadLocationId)
        if(tripDetailsRes?.latestCheckinHubId==tripLineItemRes?.unloadLocationId){
       
          console.log("valid",tripLineItemRes?.id)
          return `Valid+${tripLineItemRes?.id}`
        }
        else{
          console.log("invalid")
          return tripLineItemRes?.unloadLocation?.branchName
        }
      })
      return result
};


export const loadArticlesValidate = async (AWBId:string,AWBArticleId:string,tripId:number) => {
  const result=await prisma.$transaction(async prisma => {
    const AWBIdRes=await prisma.airWayBill.findFirst({
      where :{AWBCode:AWBId}
    })
    const AWBArticleIdRes=await prisma.awbArticle.findFirst({
      where :{articleCode:AWBArticleId, status: {
        not: "Deleted"
      }}
    })
    if(!AWBIdRes){
      return "InvalidAWB"
    }
    if(!AWBArticleIdRes){
      return "InvalidArticle"
    }
    const checkDuplicateRes=await prisma.awbArticleTripLogs.findMany({
      where :{
        AWBArticleId:AWBArticleIdRes?.id,
        tripId:tripId,
        scanType:"Load"
      }
    })
    if(checkDuplicateRes.length>0){
      return "Duplicate"
    }


      const tripLineItemRes = await prisma.tripLineItem.findFirst({
          select:{
              id:true,
              AWBId:true,
              tripId:true,
              loadLocationId:true,
              loadlocation:{
                select:{
                  branchCode:true,
                  branchName:true
                }
              },
              status:true,
              unloadLocation:{
                  select:{
                      id:true,
                      branchName:true
                  }
              },
              trip:{
                select:{
                  tripCode:true,
                  route:true,
                  latestCheckinHubId:true
                }
              }

          },
          where: {
            AWBId: AWBIdRes?.id,
            tripId:tripId
          }, 
          orderBy: {
              id: 'desc',
          },
        });
        if(tripLineItemRes==null){
          return 'AWBIDInvalid'
        }

        const tripDetailsRes = await prisma.tripDetails.findFirst({
          where: {
            id: tripId
          }, 
          orderBy: {
              id: 'desc',
          },
        });

        if(tripLineItemRes?.status=="Assigned" && tripLineItemRes?.loadLocationId==tripDetailsRes?.latestCheckinHubId){
          console.log("valid")
          return `Valid+${tripLineItemRes?.id}`
        }
        else{
          if(tripLineItemRes?.status!="Assigned"){
          console.log("invalid")
          return 'status'
          }
          else{
            console.log("invalid")
            return tripLineItemRes?.loadlocation?.branchName
          }
        
        }
      })
      return result
};

export const getTripDetails = async (tripId: number) => {
  const tripDetails = await prisma.tripDetails.findMany({
    where: {
      id: tripId,
    },
    select: {
      id: true,
      tripCode: true,
      route: true,
      latestCheckinHubId:true,
      hireAmount:true,
      advanceAmount:true,
      TDSAmount:true,
      balance:true,
      originBranchId:true,
      originBranch:{
        select:{
          id:true,
          branchName:true
        }
      },
      FTLLocalNumber:true,
      vehicle: {
        select: {
          vehicleNum: true,
          vehicleType:true,
          engineNumber:true,
          chassisNumber:true,
          insuranceValidDate:true,
          ownerName:true,
          ownerAddress:true,
          ownerPANCardNumber:true
        },
      },
      driver: {
        select: {
          driverName: true,
          phone1: true,
          address1:true,
          licenseNumber:true,
          licenseExpiryDate:true,
          placeOfIssueRTA:true
        },
      },
      vendor:{
        select:{
          vendorName:true,
          vendorCode:true,
          address1:true,
          phone1:true,
        }
      }
    },
  });
  const modifiedTripDetails = tripDetails.map(trip => ({
    tripId: trip.id,
    tripCode: trip.tripCode,
    route: trip.route,
    vehicleNum: trip.vehicle?.vehicleNum,
    vehicleType: trip.vehicle?.vehicleType,
    engineNumber: trip.vehicle?.engineNumber,
    chassisNumber: trip.vehicle?.chassisNumber,
    insuranceValidDate: trip.vehicle?.insuranceValidDate,
    vehicleOwnerName: trip.vehicle?.ownerName,
    vechicleOwnerAddress: trip.vehicle?.ownerAddress,
    vehicleOwnerPANCardNumber: trip.vehicle?.ownerPANCardNumber,
    hireAmount:trip.hireAmount,
    advanceAmount:trip.advanceAmount,
    TDSAmount:trip.TDSAmount,
    balanceAmount:trip.balance,
    originBrnachName:trip.originBranch?.branchName,
    driverName: trip.driver?.driverName,
    phone1: trip.driver?.phone1,
    driverAddress:trip.driver?.address1,
    driverlicenseNumber:trip.driver?.licenseNumber,
    driverlicenseExpiryDate:trip.driver?.licenseExpiryDate,
    placeOfIssueRTA:trip.driver?.placeOfIssueRTA,
    latestCheckinHub:trip.latestCheckinHubId,
    FTLLocalNumber:trip.FTLLocalNumber,
    vendorName:trip.vendor?.vendorName,
    vendorCode:trip.vendor?.vendorCode,
    vendorAddress:trip.vendor?.address1,
    vendorPhone:trip.vendor?.phone1

  }));

  return modifiedTripDetails;   
};

export const getTripLineItems = async (tripId: number, tripLineItemStatus: any, loadLocationId?: any, unloadLocationId?: any) => {
  const whereClause: any = {
    status: tripLineItemStatus,
    tripId: tripId
};

if (loadLocationId) {
    whereClause.loadLocationId = loadLocationId;
}

if (unloadLocationId) {
    whereClause.unloadLocationId = unloadLocationId;
}

    const result = await prisma.tripLineItem.findMany({
      where: whereClause,
      orderBy:{
        latestArticleScanTime:'desc'
      },
      select:{
        id:true,
        rollupScanCount:true,
        rollupDepsCount:true,
        latestArticleScanTime:true,
        unloadLocationId:true,
        loadLocationId:true,
        finalDestinationId:true,
        status:true,
        AirWayBill:{
          select:{
            id:true,
            AWBCode:true,
            createdOn:true,
            numOfArticles:true,
            rollupWeight:true,
            rollupChargedWtInKgs:true,
            completeFlag:true,
            consignorId:true,
            consignor:{
              select:{
                publicName:true,
                consignorCode:true,
              }
            },
            consigneeId:true,
            consignee:{
              select:{
                consigneeName:true,
                consigneeCode:true,
              }
            },
            fromBranch:{
              select:{
                id:true,
                branchName:true,
                branchCode:true
              }
            },
            toBranch:{
              select:{
                id:true,
                branchName:true,
                branchCode:true
              }
            }

          }
        },
        unloadLocation:{
          select:{
            id:true,
            branchName:true,
            branchCode:true
          }
        },
        finalBranch:{
          select:{
            id:true,
            branchCode:true,
            branchName:true
          }
        },
        loadlocation:{
          select:{
            id:true,
            branchCode:true,
            branchName:true
          }
        }
      }
    })
    const finalResult = result.map(item => ({
      AWBCode: item.AirWayBill.AWBCode,
      AWBCreatedOn: item.AirWayBill.createdOn,
      AWBId: item.AirWayBill.id,
      tripLineItemId: item.id,
      consignorName:item.AirWayBill?.consignor?.publicName,
      consigneeName:item.AirWayBill?.consignee?.consigneeName,
      loadLocation:item.loadlocation?.branchName,
      unloadLocation:item.unloadLocation?.branchName,
      finalDestinationCode:item.finalBranch?.branchCode,
      awbFromLocationCOde: item.AirWayBill.fromBranch.branchCode,
      awbToLocationCOde: item.AirWayBill.toBranch.branchCode,
      awbRollupActualWeighgtkgs: item.AirWayBill.rollupWeight,
      awbRollupChargedWeighgtkgs: item.AirWayBill.rollupChargedWtInKgs,
      completeFlag: item.AirWayBill.completeFlag,
      TripLineItemStatus: item.status,
      numOfScan:item.rollupScanCount,
      rollupDepsCount:item.rollupDepsCount  ,
      numberOfArticles: item.AirWayBill.numOfArticles,
      latestScanTime:item.latestArticleScanTime
    }));
    return finalResult;
};

export const addAWBArticleLogs = async (AWBArticleCode: any, scanType: any, tripId: number, tripLineItemId: number): Promise<string | void> => {
  const today = moment().toISOString();  

  const result = await prisma.$transaction(async prisma => {
    const AWBArticleRes = await prisma.awbArticle.findFirst({
      where: { articleCode: AWBArticleCode }
    });

    if (AWBArticleRes) {
      const checkDuplicateRes = await prisma.awbArticleTripLogs.findMany({
        where: {
          AWBArticleId: AWBArticleRes?.id,
          tripId: tripId,
          scanType: scanType
        }
      });

      if (checkDuplicateRes.length > 0) {
        console.log("duplicate");
        return "Duplicate";
      }

      const AWBArticleTripLogsRes = await prisma.awbArticleTripLogs.create({
        data: {
          AWBArticleId: AWBArticleRes?.id,
          tripId: tripId,
          scanType: scanType,
          tripLineItemId: tripLineItemId
        }
      });

      console.log(AWBArticleTripLogsRes.id);

      const countQuery = await prisma.awbArticleTripLogs.findMany({
        where: {
          tripLineItemId: tripLineItemId,
          scanType: scanType
        }
      });

      console.log(countQuery.length);

      await prisma.tripLineItem.update({
        where: {
          id: tripLineItemId,
        },
        data: {
          rollupScanCount: countQuery.length,
          latestArticleScanTime: today
        }
      });

      
      return "Success";
    }
    else{
      return "Duplicate"
    }
    return; 
  });

  return result; 
};

export const fileUploadRes = async (normalizedFilePaths: string[], type: string) => {
  try {
    const createdRecords = await prisma.$transaction(async (prisma) => {
      const createPromises = normalizedFilePaths.map(async (filePath) => {
        let data: any = {
          path: filePath,
          type: type,
        };

       
        const result = await prisma.fileUpload.create({
          data: data,
        });

        console.log(`Created ImageLinks record with ID: ${result.id}`);

        return {
          fileId: result.id,
          filePath: result.path,
          fileType: result.type,
        }; 
      });

      const createdFiles = await Promise.all(createPromises);

      return createdFiles; 
     
    });

    return createdRecords;
  } catch (error) {
    console.error('Error creating or updating records:', error);
    throw new Error('Failed to create or update records');
  }
};

export const getDepsLists = async (AWBId: number) => {
    const result = await prisma.dEPS.findMany({
      where: {
        AWBId: AWBId,
      },
      select:{
        id:true,
        AWBId:true,
        DEPSType:true,
        DEPSSubType:true,
        loadingHubId:true,
        numberOfDepsArticles:true,
        connectedDate:true,
        depsStatus:true,
        caseComment:true,
        TicketRaisedBranchId:true,
        loadingUserId:true,
        createdOn:true,
        loadUser:{
          select:{
            firstName:true,
            lastName:true
          }
        },
        unloadUser:{
          select:{
            firstName:true,
            lastName:true
          }
        },
        AirWayBill:{select:{AWBCode:true}},
        depsImages: { 
          select: {
            id: true,
            fileId: true,
            depsId:true,
            FileUpload: { 
              select: {
                path: true,
                type:true
              }
            }
          }
        }
       

      }
    })
    return result;
};

export const addDeps = async (DEPSData:any,fileIds:any) => {
   
   const result=await prisma.$transaction(async prisma => {
      const addDepsRes=await prisma.dEPS.createMany({
          data:DEPSData
      })
      if (addDepsRes.count !== undefined && addDepsRes.count > 0) {
        const firstRecordId = (await prisma.dEPS.findFirst({
            where: { AWBId: DEPSData.AWBId },
            orderBy: { id: 'desc' },select: { id: true },
            
        }));
        if (firstRecordId) {
          for (const fileId of fileIds) {
              await prisma.dEPSImages.create({
                  data: {
                      depsId: firstRecordId.id,
                      fileId: fileId
                  }
              });
          }
      }
    }
  })
};


export const getScannedArticles = async (AWBId:number,tripId:number,scanType:any) => {
  const getScannedArticlesRes = await prisma.awbArticleTripLogs.findMany({
    where: {
      tripId: tripId,
      scanType:scanType,
      AWBArticle: {
        AWB: {
          id: AWBId,
        },
      },
    },
    select: {
      scanType:true,
      AWBArticle: {
        select: {
          id: true,
          articleCode: true,
          AWB: {
            select: {
              AWBCode: true,
              id: true,
              numOfArticles: true,
              fromBranch: {
                select: {
                  branchName: true,
                  branchCode: true,
                },
              },
              toBranch: {
                select: {
                  branchName: true,
                  branchCode: true,
                },
              },
            },
          },
        },
      },
    },
  });
  const transformedResult = getScannedArticlesRes.map((log,index) => {
    const awb = log.AWBArticle.AWB;
    return {
      scanType:log.scanType,
      awbId: awb.id,
      AWBCode: awb.AWBCode,
      fromBranchName: awb.fromBranch.branchName,
      fromBranchCode: awb.fromBranch.branchCode,
      toBranchName: awb.toBranch.branchName,
      toBranchCode: awb.toBranch.branchCode,
      numOfScan:index+1,
      numOfArticles: awb.numOfArticles,
      count:index+1 +"/"+awb.numOfArticles,
      articleCode: log.AWBArticle.articleCode,
      articleId: log.AWBArticle.id 
    };
  });
  return transformedResult;
};

export const outwardAWB = async (tripId: number, data: any, checkinHub: number) => {
  const result = await prisma.$transaction(async (prisma) => {
  // Loop through each item in the data array
  for (const item of data) {
    if (item.unloadLocationId === "CONSIGNEE") {  // unloadLocationId is "CONSIGNEE"
      await prisma.tripLineItem.updateMany({
        where: {
          AWBId: item.AWBId,
          tripId: tripId,
        },
        data: {
          status: 'Open',
        },
      });

      await prisma.airWayBill.updateMany({
        where: {
          id: item.AWBId,
        },
        data: {
          AWBStatus: "outForDelivery",
        },
      });
    } 
    else {// unloadLocationId is not "CONSIGNEE"
     
        await prisma.tripLineItem.updateMany({
          where: {
            AWBId: item.AWBId,
            tripId: tripId,
          },
          data: {
            status: 'Open',
            unloadLocationId: item.unloadLocationId,
          },
        });

        await prisma.airWayBill.updateMany({
          where: {
            id: item.AWBId,
          },
          data: {
            AWBStatus: "InTransit",
          },
        });

        const existingRecord = await prisma.hLFLineItem.findFirst({
          where: {
            HLFLineItemAWBId: item.AWBId,
          },
          orderBy: {
            id: 'desc',
          },
        });

        if (existingRecord) {
          if (existingRecord.HLFLineStatus == "Inwarded") {
            await prisma.hLFLineItem.updateMany({
              where: {
                HLFLineItemAWBId: item.AWBId,
              },
              data: {
                HLFLineStatus: 'Outwarded',
              },
            });

            await prisma.hLFLineItem.create({
              data: {
                HLFLineItemAWBId: item.AWBId,
                HLFLineStatus: 'ToBeInwarded',
                branchId: item.unloadLocationId,
              },
            });
          }
        } else {
          await prisma.hLFLineItem.create({
            data: {
              HLFLineItemAWBId: item.AWBId,
              HLFLineStatus: 'ToBeInwarded',
              branchId: item.unloadLocationId,
            },
          });
        }
    }
  }
  })
  await tripLineItemScanCountReset(tripId)
  return result
};

export const inwardAWB = async (tripId: number, awbIds: number[], checkinHub: any) => {
  const result = await prisma.$transaction(async (prisma) => {
    if (checkinHub === "CONSIGNEE") {
      await Promise.all(awbIds.map(async (AWBId) => {
        await prisma.tripLineItem.updateMany({
          where: {
            tripId: tripId,
            AWBId: AWBId
          },
          data: {
            status: "Closed"
          }
        });
      }));
  
      await prisma.airWayBill.updateMany({
        where: {
          id: {
            in: awbIds
          }
        },
        data: {
          AWBStatus: "Delivered"
        }
      });
    }
     else {
     
        await prisma.tripLineItem.updateMany({
          where: {
            tripId: tripId,
            unloadLocationId: checkinHub
          },
          data: {
            status: "Closed"
          }
        });
  
        await prisma.airWayBill.updateMany({
          where: {
            id: {
              in: awbIds
            }
          },
          data: {
            AWBStatus: 'atHub'
          }
        });
  
        await prisma.hLFLineItem.updateMany({
          where: {
            HLFLineItemAWBId: {
              in: awbIds
            },
            HLFLineStatus: "ToBeInwarded"
          },
          data: {
            HLFLineStatus: 'Inwarded'
          }
        });
      
    }
    
})
 await tripLineItemScanCountReset(tripId)
 return result
};

export const tripLineItemScanCountReset=async(tripId: number)=>{
  await prisma.tripLineItem.updateMany({
    where: {
      tripId: tripId},
    data: {
      rollupScanCount:0
    }
  });
}



import { connectivityPlanData } from '../types/connectivityDataType';
async function fetchIds(connectivityPlan: connectivityPlanData) {
  const awb = await prisma.airWayBill.findFirst({ where: { AWBCode: connectivityPlan.AWBCode } });
  const trip = await prisma.tripDetails.findFirst({ where: { tripCode: connectivityPlan.tripCode } });
  const loadLocation = await prisma.branch.findFirst({ where: { branchCode: connectivityPlan.loadLocation } });
  const unloadLocation = await prisma.branch.findFirst({ where: { branchCode: connectivityPlan.unloadLocation } });

  const errors: string[] = [];

  if (!awb) errors.push('Invalid AWBCode');
  if (!trip) errors.push('Invalid tripCode');
  if (!loadLocation) errors.push('Invalid loadLocation');
  if (!unloadLocation) errors.push('Invalid unloadLocation');

  if (errors.length > 0) {
    return { errors };
  }

  return {
    AWBId: awb!.id,
    tripId: trip!.id,
    loadLocationId: loadLocation!.id,
    unloadLocationId: unloadLocation!.id,
  };
}

function removeDuplicates(connectivityPlans: connectivityPlanData[]) {
  const seen = new Set();
  const uniquePlans = [];
  const duplicates = [];

  for (const plan of connectivityPlans) {
    const identifier = `${plan.AWBCode}-${plan.tripCode}-${plan.loadLocation}-${plan.unloadLocation}`;
    if (!seen.has(identifier)) {
      seen.add(identifier);
      uniquePlans.push(plan);
    } else {
      duplicates.push(plan);
    }
  }

  return { uniquePlans, duplicates };
}

export async function insertConnectivityPlan(connectivityPlans: connectivityPlanData[]) {
  const { uniquePlans, duplicates } = removeDuplicates(connectivityPlans);

  const totalCount = connectivityPlans.length;
  const responseObjects: (connectivityPlanData & { message: string, databaseId: number | null })[] = [];

  for (const plan of uniquePlans) {
    const ids = await fetchIds(plan);

    if (ids && 'errors' in ids) {
      responseObjects.push({ ...plan,databaseId: null, message: `${ids.errors!.join(', ')}` });
    } else if (ids) {
      // Check if tripId and AWBId already exist with status 'Assigned'
      const existingItem = await prisma.tripLineItem.findFirst({
        where: {
          tripId: ids.tripId,
          AWBId: ids.AWBId,
          status: 'Assigned',
        },
        include:{
          trip:{
            select:{
              tripCode:true
            }
          }
        }
      });
      if (existingItem) {
        responseObjects.push({ ...plan, databaseId: null, message: `AirWayBill is already assigned to another trip - ${existingItem.trip.tripCode}. Please close the AWB in the previous trip` });
      } else {
        try {
          const insertedItem = await prisma.tripLineItem.create({
            data: {
              AWBId: ids.AWBId,
              tripId: ids.tripId,
              loadLocationId: ids.loadLocationId,
              unloadLocationId: ids.unloadLocationId,
            },
          });
          responseObjects.push({ ...plan, databaseId: insertedItem.id, message: 'Success' });
        } catch (error) {
          responseObjects.push({ ...plan, databaseId: null, message: 'Database Error' });
        }
      }
    }
  }
  for (const plan of duplicates) {
    responseObjects.push({ ...plan, databaseId: null, message: 'Duplicate' });
  }

  const successCount = responseObjects.filter(obj => obj.message === 'Success').length;
  const failureCount = responseObjects.filter(obj => obj.message.startsWith('Invalid') || obj.message === 'Database Error').length;
  const duplicateCount = responseObjects.filter(obj => obj.message === 'Duplicate').length;

  return {
    totalCount,
    successCount,
    failureCount,
    duplicateCount,
    responseObjects
  };
}
