import { $Enums, DEPSStatus, } from '@prisma/client';
import prisma from '../client';
import moment from 'moment';
import { ArticleLogsScanType,DEPSTypeList} from '@prisma/client'; // Importing enum from Prisma schema

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

export const unloadArticlesValidate = async (AWBId:string,AWBArticleId:string,tripId:number,checkinHubId:number) => {
  const result=await prisma.$transaction(async prisma => {
  
    const AWBArticleIdRes=await prisma.awbArticle.findFirst({
      where :{articleCode:AWBArticleId, status: {
        not: "Deleted"
      }}
    })
    // if(!AWBIdRes){
    //   return "InvalidAWB"
    // }
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
    // console.log(AWBIdRes?.id,"$$$$",AWBArticleIdRes?.id,checkDuplicateRes.length)
      const tripLineItemRes = await prisma.tripLineItem.findFirst({
          select:{
              id:true,
              AWBId:true,
              tripId:true,
              unloadLocationId:true,
              unloadLocation:{
                  select:{
                      id:true,
                      branchName:true,
                      branchCode:true
                  }
              }
          },
          where: {
            AWBId:AWBArticleIdRes?.AWBId,
            tripId:tripId,
            unloadLocationId:checkinHubId,
            status:"Open"
          },
          orderBy: {
              id: 'desc',
          },
        });
       
        if(tripLineItemRes==null){
          const AWBIdRes=await prisma.airWayBill.findFirst({
            where :{AWBCode:AWBId}
          })

          let tripDetailsRes = await prisma.tripDetails.findFirst({
            where: {
              id: tripId
            },
            select:{
              id:true,
              latestCheckinHubId:true,
              checkinBranch:{
                select:{
                  branchCode:true
                }
              }
            },
            orderBy: {
                id: 'desc',
            },
          });
          console.log("AWBIDInvalid",tripLineItemRes,AWBIdRes?.id)
          // return 'AWBIDInvalid'
          return {
            type:'Not As Per Plan',
            AWBUnlaodHub:null,
            currentUnlaodingHub:tripDetailsRes?.checkinBranch?.branchCode,
            AWBCode:AWBIdRes?.AWBCode,
            AWBArticleCode:AWBArticleIdRes?.articleCode
          }
        }
       
      //  console.log(tripDetailsRes?.latestCheckinHubId,"validConditionss",tripLineItemRes?.unloadLocationId)
        //tripId
        if(checkinHubId===tripLineItemRes?.unloadLocationId && tripLineItemRes.tripId===tripId){
          console.log("valid",tripLineItemRes?.id)
          return `Valid+${tripLineItemRes?.id}`
        }
        else{
          console.log("invalid")
          let tripDetailsRes = await prisma.tripDetails.findFirst({
            where: {
              id: tripId
            },
            select:{
              id:true,
              latestCheckinHubId:true,
              checkinBranch:{
                select:{
                  branchCode:true
                }
              }
            },
            orderBy: {
                id: 'desc',
            },
          });
          const AWBIdRes=await prisma.airWayBill.findFirst({
            where :{AWBCode:AWBId}
          })
          return {
            type:'Not As Per Plan',
            AWBUnlaodHub:tripLineItemRes?.unloadLocation?.branchCode,
            currentUnlaodingHub:tripDetailsRes?.checkinBranch?.branchCode,
            AWBCode:AWBIdRes?.AWBCode,
            AWBArticleCode:AWBArticleIdRes?.articleCode
          }
        }
      })
      return result
};

export const loadArticlesValidate = async (AWBId:string,AWBArticleId:string,tripId:number,checkinHubId:number) => {
  const result=await prisma.$transaction(async prisma => {
    
    const AWBArticleIdRes=await prisma.awbArticle.findFirst({
      where :{articleCode:AWBArticleId, status: {
        not: "Deleted"
      }},
      select:{
        id:true,
        articleCode:true,
        AWBId:true
      }
    })
  
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
              tripId:true,
              loadLocationId:true,
              status:true,
              trip:{
                select:{
                  tripCode:true,
                  route:true
                }
              }
          },
          where: {
            AWBId:AWBArticleIdRes?.AWBId,
            tripId:tripId,
            loadLocationId:checkinHubId,
            status:"Assigned"
          },
          orderBy: {
              id: 'desc',
          },
        });
        if(tripLineItemRes==null){
          // return 'AWBIDInvalid'
          const AWBIdRes=await prisma.airWayBill.findFirst({
            where :{AWBCode:AWBId},
            select:{
              id:true,
              AWBCode:true
            }
          })
          const tripDetailsRes = await prisma.tripDetails.findFirst({
            where: {
              id: tripId,
              latestCheckinHubId:checkinHubId
            },
            select:{
              tripCode:true,
              route:true
            },
            orderBy: {
                id: 'desc',
            },
          });
          return {
            type:'wrongTrip',
            AWBAssignedTripCode:null,
            AWBAssignedTripRoute:null,
            currentLoadingTripCode:tripDetailsRes?.tripCode,
            currentLoadingTripRoute:tripDetailsRes?.route,
            AWBCode:AWBIdRes?.AWBCode,
            AWBArticleCode:AWBArticleIdRes?.articleCode
          }
        }

        if(tripLineItemRes?.status=="Assigned" && tripLineItemRes?.loadLocationId===checkinHubId && tripLineItemRes.tripId===tripId){
          console.log("valid")
          return `Valid+${tripLineItemRes?.id}`
        }
        else{
          const AWBIdRes=await prisma.airWayBill.findFirst({
            where :{AWBCode:AWBId},
            select:{
              AWBCode:true,
              consignorId:true,
              AWBStatus:true,
              consignor:{
                select:{
                  consignorCode:true
                }
              }
            }
          })
          const tripDetailsRes = await prisma.tripDetails.findFirst({
            where: {
              id: tripId
            },
            select:{
              tripCode:true,
              route:true,
              checkinBranch:{
                select:{
                  branchCode:true
                }
              }
            },
            orderBy: {
                id: 'desc',
            },
          });
          //tli:- trip,awb,assigned   checkinup!=loadinglocation.tli
          if(AWBIdRes?.AWBStatus==="PickUp" &&  tripLineItemRes.loadLocationId!=checkinHubId){
          console.log("invalid AWB==pickup")
          return {type:'consignorPickUpPoint',consignorCode:AWBIdRes?.consignor?.consignorCode,branchCode:tripDetailsRes?.checkinBranch?.branchCode}
          }
          else{
            console.log("loaded at wrongtrip at pickuppoint/hub")
            return {
              type:'wrongTrip',
              AWBAssignedTripCode:tripLineItemRes?.trip?.tripCode,
              AWBAssignedTripRoute:tripLineItemRes?.trip?.route,
              currentLoadingTripCode:tripDetailsRes?.tripCode,
              currentLoadingTripRoute:tripDetailsRes?.route,
              AWBCode:AWBIdRes?.AWBCode,
              AWBArticleCode:AWBArticleIdRes?.articleCode
            }
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
            rollupShortCount:true,
            rollupExcessCount:true,
            rollupDamageCount:true,
            rollupPilferageCount:true,
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
      rollupShortCount:item.AirWayBill.rollupShortCount,
      rollupExcessCount:item.AirWayBill.rollupExcessCount,
      rollupPilferageCount:item.AirWayBill.rollupPilferageCount,
      rollupDamageCount:item.AirWayBill.rollupDamageCount,
      rollupDEPSCount:(item.AirWayBill.rollupShortCount?? 0)+(item.AirWayBill.rollupExcessCount??0)+(item.AirWayBill.rollupPilferageCount??0)+(item.AirWayBill.rollupDamageCount??0),
      unloadLocationId:item.unloadLocationId,
      numberOfArticles: item.AirWayBill.numOfArticles,
      latestScanTime:item.latestArticleScanTime
    }));
    return finalResult;
};


export const addAWBArticleLogs = async (AWBArticleCode: any, scanType: any, tripId: number): Promise<string | void> => {
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
      const tripLineItemRes = await prisma.tripLineItem.findFirst({
        where: { AWBId: AWBArticleRes?.AWBId,
          tripId:tripId }
      });
      const AWBArticleTripLogsRes = await prisma.awbArticleTripLogs.create({
        data: {
          AWBArticleId: AWBArticleRes?.id,
          tripId: tripId,
          scanType: scanType,
          tripLineItemId: tripLineItemRes?.id
        }
      });
      console.log(AWBArticleTripLogsRes.id);
      const countQuery = await prisma.awbArticleTripLogs.findMany({
        where: {
          tripLineItemId: tripLineItemRes?.id,
          scanType: scanType
        }
      });
      console.log(countQuery.length);
      await prisma.tripLineItem.update({
        where: {
          id: tripLineItemRes?.id,
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


export const getDepsLists = async (AWBId: number) => {
  const result = await prisma.dEPS.findMany({
    where: {
      AWBId: AWBId,
    },
    select:{
      id:true,
      AWBId:true,
      DEPSType:true,
      hubId:true,
      depsStatus:true,
      scanType:true,
      articleId:true,
      userId:true,
      createdOn:true,
      loadUser:{
        select:{
          firstName:true,
          lastName:true
        }
      },
      AirWayBill:{select:{AWBCode:true}},
      AwbArticle:{select:{articleCode:true}},
      depsImages: {
        select: {
          id: true,
          fileId: true,
          depsId:true
        }
      }

    }
  })
  return result;
};

export const addDeps = async (DEPSData: any[]) => {
try {
  await prisma.$transaction(async (prisma) => {
    for (const deps of DEPSData) {
      const { fileIds, ...depsData } = deps;

      const awbArticle = await prisma.awbArticle.findFirst({
        where: {
          articleCode: deps.articleId, // Use the provided articleCode to get the ID
        },
        select: {
          id: true,
        },
      });

           // Update depsData with the retrieved AwbArticle ID
           const updatedDepsData = {
            ...depsData,
            articleId: awbArticle?.id||0,
          };
  
          // Create DEPS record
          const createdDeps = await prisma.dEPS.create({
            data: updatedDepsData,
          });

      // // Create DEPS record
      // const createdDeps = await prisma.dEPS.create({
      //   data: depsData
      // });
   
      // Associate each fileId with the DEPS record in dEPSImages
      if (createdDeps && fileIds && fileIds.length > 0) {
        for (const fileId of fileIds) {
          await prisma.dEPSImages.create({
            data: {
              depsId: createdDeps.id,
              fileId: fileId
            }
          });
        }
      }
    }
          // Now, after creating all DEPS records, calculate the count of DEPS records where DEPSType is 'Shorts' for each AWBId
          const awbIds = [...new Set(DEPSData.map(deps => deps.AWBId))]; // Collect all unique AWBIds from DEPSData
          for (const awbId of awbIds) {
            // Count the number of DEPS records where DEPSType is 'Shorts'
            const totalShortsCount = await prisma.dEPS.count({
              where: {
                AWBId: awbId,
                DEPSType:"Shorts" // Only consider 'Shorts' DEPSType
              }
            });
            const totalExcessCount = await prisma.dEPS.count({
              where: {
                AWBId: awbId,
                DEPSType:"Excess" // Only consider 'Shorts' DEPSType
              }
            });
            const totalDamagesCount = await prisma.dEPS.count({
              where: {
                AWBId: awbId,
                DEPSType:"Damage" // Only consider 'Shorts' DEPSType
              }
            });
            const totalPilferagesCount = await prisma.dEPS.count({
              where: {
                AWBId: awbId,
                DEPSType:"Pilferage" // Only consider 'Shorts' DEPSType
              }
            });
    
            // Update rollupDepsCount in airWayBill based on the count of Shorts
            await prisma.airWayBill.update({
              where: {
                id: awbId
              },
              data: {
                rollupShortCount: totalShortsCount || 0, // Update rollupDepsCount with the count of 'Shorts'
                rollupExcessCount:totalExcessCount || 0,
                rollupDamageCount:totalDamagesCount|| 0,
                rollupPilferageCount:totalPilferagesCount || 0
              }
            });
          }
  });
} catch (error) {
  console.error("Error in addDeps function:", error); // Log the error to see the details
  throw new Error("Internal Server Error"); // Optional: You can also throw a specific error
}
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

export const outwardAWBs = async (tripId: number, data: any, checkinHub: number) => {
  const result = await prisma.$transaction(async (prisma) => {
  // Loop through each item in the data array
  for (const item of data) {
    if (item.unloadLocationId === "CONSIGNEE") {  // unloadLocationId is "CONSIGNEE"
      await prisma.tripLineItem.updateMany({
        where: {
          AWBId: item.AWBId,
          tripId: tripId,
          id:item.tripLineItemId
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
      const recentHLFLineItem = await prisma.hLFLineItem.findFirst({
        where: {
          HLFLineItemAWBId: item.AWBId,
        },
        orderBy: {
          id: 'desc',
        },
      });
      
      // Update it if found
      if (recentHLFLineItem) {
        await prisma.hLFLineItem.update({
          where: {
            id: recentHLFLineItem.id,
          },
          data: {
            HLFLineStatus: "Outwarded",
          },
        });
    }
  }
    else {// unloadLocationId is not "CONSIGNEE"

        await prisma.tripLineItem.updateMany({
          where: {
            AWBId: item.AWBId,
            id:item.tripLineItemId,
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

export const inwardAWBs = async (tripId: number, data: { AWBId: number, tripLineItemId: number }[], checkinHub: any) => {
  const result = await prisma.$transaction(async (prisma) => {
    if (checkinHub === "CONSIGNEE") {
      await Promise.all(data.map(async (item) => {
        await prisma.tripLineItem.update({
          where: {
            id: item.tripLineItemId,
          },
          data: {
            status: "Closed"
          }
        });

        await prisma.airWayBill.update({
          where: {
            id: item.AWBId,
          },
          data: {
            AWBStatus: "Delivered"
          }
        });
      }));
    } else {
      await Promise.all(data.map(async (item) => {
        await prisma.tripLineItem.update({
          where: {
            id: item.tripLineItemId,
          },
          data: {
            status: "Closed"
          }
        });

        await prisma.airWayBill.update({
          where: {
            id: item.AWBId,
          },
          data: {
            AWBStatus: 'atHub'
          }
        });

        await prisma.hLFLineItem.updateMany({
          where: {
            HLFLineItemAWBId: item.AWBId,
            HLFLineStatus: "ToBeInwarded"
          },
          data: {
            HLFLineStatus: 'Inwarded'
          }
        });
      }));
    }
  });

  await tripLineItemScanCountReset(tripId);
  return result;
};


// export const inwardAWBs = async (tripId: number, awbIds: number[], checkinHub: any) => {
//   const result = await prisma.$transaction(async (prisma) => {
//     if (checkinHub === "CONSIGNEE") {
//       await Promise.all(awbIds.map(async (AWBId) => {
//         await prisma.tripLineItem.updateMany({
//           where: {
//             tripId: tripId,
//             AWBId: AWBId
//           },
//           data: {
//             status: "Closed"
//           }
//         });
//       }));

//       await prisma.airWayBill.updateMany({
//         where: {
//           id: {
//             in: awbIds
//           }
//         },
//         data: {
//           AWBStatus: "Delivered"
//         }
//       });
//     }
//      else {

//         await prisma.tripLineItem.updateMany({
//           where: {
//             tripId: tripId,
//             unloadLocationId: checkinHub
//           },
//           data: {
//             status: "Closed"
//           }
//         });

//         await prisma.airWayBill.updateMany({
//           where: {
//             id: {
//               in: awbIds
//             }
//           },
//           data: {
//             AWBStatus: 'atHub'
//           }
//         });

//         await prisma.hLFLineItem.updateMany({
//           where: {
//             HLFLineItemAWBId: {
//               in: awbIds
//             },
//             HLFLineStatus: "ToBeInwarded"
//           },
//           data: {
//             HLFLineStatus: 'Inwarded'
//           }
//         });

//     }

// })
//  await tripLineItemScanCountReset(tripId)
//  return result
// };

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


export const updateTripLineItem=async(tripLineItemId:number,unloadLocationId:number)=>{
  await prisma.tripLineItem.update({
    where: {
      id: tripLineItemId},
    data: {
      unloadLocationId:unloadLocationId
    }
  });
}

export const deliverAWBCheck=async(AWBCode:string)=>{
  let AWBRes=await prisma.airWayBill.findFirst({
   where :{
     AWBCode:AWBCode,
     AWBStatus:"outForDelivery"
   }
  })
  if(AWBRes){
   return true
  }
  else{
   return false
  }
}

export const getExcessDeps=async(tripId:number,checkinHub:number,scanTypeEnum:ArticleLogsScanType)=>{
  let DEPSResponse=await prisma.dEPS.findMany({
   where :{
     tripId:tripId,
     hubId:checkinHub,
     scanType:scanTypeEnum,
     DEPSType:"Excess"
   },
   select:{
    id:true,
    DEPSType:true,
    scanType:true,
    AWBId:true,
    AirWayBill:{
      select:{
        AWBCode:true,
        consignor:{
          select:{
            consignorCode:true,
            publicName:true,
          }
        },
        consignee:{
          select:{
            consigneeCode:true,
            consigneeName:true,
          }
        }
      }
     
    },
    AwbArticle:{
      select:{
        articleCode:true
      }
     
    }
   }
  })
 return DEPSResponse
}

export const getShortArticles = async (
  AWBId: number,
  tripId: number,
  scanTypeEnum: ArticleLogsScanType
) => {
  const articlesWithoutLogsAndDeps = await prisma.awbArticle.findMany({
    where: {
      AWBId: AWBId, // Filter by specific AWBId
      AWBArtIds: {
        none: {
          scanType: scanTypeEnum,
          tripId:tripId
        },
      },
      depsArticleIds: {
        none: {
          DEPSType: DEPSTypeList.Shorts
        },
      },
    },
    select: {
      id: true,
      articleCode: true,
      status: true,
      AWB: {
        select: {
          id: true,
          AWBCode: true,
          AWBStatus: true,
          consignor: {
            select: {
              consignorId: true,
              consignorCode: true,
              publicName: true,
            },
          },
          consignee: {
            select: {
              consigneeId: true,
              consigneeCode: true,
              consigneeName: true,
            },
          },
        },
      },
    },
  });

  console.log(articlesWithoutLogsAndDeps);
  return articlesWithoutLogsAndDeps;
};
