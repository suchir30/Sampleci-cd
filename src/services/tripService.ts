import { $Enums, DEPSStatus, } from '@prisma/client';
import prisma from '../client';
import moment from 'moment';
import {incrementAlphanumericCode} from "../services/AWBService";
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
     
        if(tripLineItemRes){
          console.log("valid")
          return `Valid+${tripLineItemRes?.id}`
        }
        else{
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
          const tripLineItemRes1 = await prisma.tripLineItem.findFirst({
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
              status:"Assigned"
            },
            orderBy: {
                id: 'desc',
            },
          });
          if(tripLineItemRes1 && AWBIdRes?.AWBStatus=="PickUp"){
            console.log("invalid AWB==pickup")
            return {type:'consignorPickUpPoint',consignorCode:AWBIdRes?.consignor?.consignorCode,branchCode:tripDetailsRes?.checkinBranch?.branchCode}
          
          }
          else{
            const tripLineItemRes2 = await prisma.tripLineItem.findFirst({
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
                status:"Assigned"
              },
              orderBy: {
                  id: 'desc',
              },
            });
            console.log("loaded at wrongtrip at pickuppoint/hub")
            if(tripLineItemRes2){
              return {
                type:'wrongTrip',
                AWBAssignedTripCode:tripLineItemRes2?.trip?.tripCode,
                AWBAssignedTripRoute:tripLineItemRes2?.trip?.route,
                currentLoadingTripCode:tripDetailsRes?.tripCode,
                currentLoadingTripRoute:tripDetailsRes?.route,
                AWBCode:AWBIdRes?.AWBCode,
                AWBArticleCode:AWBArticleIdRes?.articleCode
              }

            }
            else{
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
            AWBChargedWeight:true,
            rollupShortCount:true,
            rollupExcessCount:true,
            rollupDamageCount:true,
            rollupPilferageCount:true,
            completeFlag:true,
            consignorId:true,
            AWBWeight:true,
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
      awbRollupActualWeighgtkgs: item.AirWayBill.AWBWeight,
      awbRollupChargedWeighgtkgs: item.AirWayBill.AWBChargedWeight,
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
      loadingHubBranch:{select:{
        id:true,
        branchCode:true,
        branchName:true
      }},
      loadUser:{
        select:{
          id:true,
          employeeId:true,
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
    console.log(DEPSData,"DEPSData")

    await prisma.$transaction(async (prisma) => {
      for (const deps of DEPSData) {
        const { fileIds, ...depsData } = deps;
        console.log(deps,"deps")

        const awbArticle = await prisma.awbArticle.findFirst({
          where: { articleCode: deps.articleId },
          select: { id: true },
        });
        // console.log("awbArticle",awbArticle)
        const airWayBill = await prisma.airWayBill.findFirst({
          where: { AWBCode: deps.AWBId },
          select: { id: true },
        });
        
        if (deps.DEPSType === "Excess" && awbArticle?.id) {
          await prisma.dEPS.updateMany({
            where: {
              articleId: awbArticle.id,
              depsStatus: "Open" // Only update records that are currently "Open"
            },
            data: {
              depsStatus: "Closed"
            }
          });
        }
        
        const updatedDepsData = {
          ...depsData,
          articleId: awbArticle?.id || 0,
          AWBId: airWayBill?.id || 0,
        };

        const createdDeps = await prisma.dEPS.create({ data: updatedDepsData });

        if (createdDeps && fileIds && fileIds.length > 0) {
          for (const fileId of fileIds) {
            await prisma.dEPSImages.create({
              data: { depsId: createdDeps.id, fileId: fileId },
            });
          }
        }
      }

      // const uniqueAWBCodes = [...new Set(DEPSData.map(deps => deps.AWBCode))].filter(Boolean);
      const uniqueAWBCodes = [...new Set(DEPSData.map(deps => deps.AWBId))].filter(Boolean);

      console.log("Unique AWBCodes:", uniqueAWBCodes); // Log unique AWBCodes to verify

      const awbIdMap = await prisma.airWayBill.findMany({
        where: { AWBCode: { in: uniqueAWBCodes } },
        select: { id: true, AWBCode: true },
      }).then(results => results.reduce((acc, curr) => {
        acc[curr.AWBCode] = curr.id;
        return acc;
      }, {} as Record<string, number>));

      console.log("AWBId Map:", awbIdMap); // Log awbIdMap to verify mappings

      for (const awbCode of uniqueAWBCodes) {
        const awbId = awbIdMap[awbCode];

        if (!awbId) {
          console.log(`AWBId not found for AWBCode: ${awbCode}`);
          continue;
        }

        console.log(`Processing counts for AWBId: ${awbId}`); // Log current AWBId

        const totalShortsCount = await prisma.dEPS.count({
          where: { AWBId: awbId, DEPSType: "Shorts",depsStatus:"Open"},
        });
        const totalExcessCount = await prisma.dEPS.count({
          where: { AWBId: awbId, DEPSType: "Excess",depsStatus:"Open"},
        });
        const totalDamagesCount = await prisma.dEPS.count({
          where: { AWBId: awbId, DEPSType: "Damage",depsStatus:"Open"},
        });
        const totalPilferagesCount = await prisma.dEPS.count({
          where: { AWBId: awbId, DEPSType: "Pilferage",depsStatus:"Open"},
        });

        console.log(`Updating counts for AWBId: ${awbId}`);
        await prisma.airWayBill.update({
          where: { id: awbId },
          data: {
            rollupShortCount: totalShortsCount || 0,
            rollupExcessCount: totalExcessCount || 0,
            rollupDamageCount: totalDamagesCount || 0,
            rollupPilferageCount: totalPilferagesCount || 0,
          },
        });
      }
    });
    console.log("DEPS processing completed successfully.");
  } catch (error) {
    console.error("Error in addDeps function:", error);
    throw new Error("Internal Server Error");
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
    if (item.unloadLocation === "CONSIGNEE") {  // unloadLocationId is "CONSIGNEE"
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
  console.log(data,"Trip Outwarded Data ",tripId,"tripId")
  await tripLineItemScanCountReset(tripId)
  return result
};

export const inwardAWBs = async (tripId: number, data: { AWBId: number, tripLineItemId: number }[], checkinHub: any) => {
  const result = await prisma.$transaction(async (prisma) => {
    // if (checkinHub === "CONSIGNEE") {
    //   await Promise.all(data.map(async (item) => {
    //     await prisma.tripLineItem.update({
    //       where: {
    //         id: item.tripLineItemId,
    //       },
    //       data: {
    //         status: "Closed"
    //       }
    //     });

    //     await prisma.airWayBill.update({
    //       where: {
    //         id: item.AWBId,
    //       },
    //       data: {
    //         AWBStatus: "Delivered"
    //       }
    //     });
    //   }));
    // } 
    // else {
    
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
//    }
  });
  console.log(data,"Trip Inwarded Data ",tripId,"tripId")
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
import { Datetime } from 'aws-sdk/clients/costoptimizationhub';

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

// async function fetchIds(connectivityPlan: connectivityPlanData) {
//   const awb = await prisma.airWayBill.findFirst({ where: { AWBCode: connectivityPlan.AWBCode } });
//   const trip = await prisma.tripDetails.findFirst({ where: { tripCode: connectivityPlan.tripCode } });
//   const loadLocation = await prisma.branch.findFirst({ where: { branchCode: connectivityPlan.loadLocation } });
  
//   let unloadLocation
//   if (connectivityPlan.unloadLocation === "Consignee") {
//     console.log("into a consignee condition");
//     unloadLocation = null;  // Set unloadLocation to null if Consignee
//   } else {
//     unloadLocation = await prisma.branch.findFirst({ where: { branchCode: connectivityPlan.unloadLocation } });
//   }

//   const errors: string[] = [];

//   if (!awb) errors.push('Invalid AWBCode');
//   if (!trip) errors.push('Invalid tripCode');
//   if (!loadLocation) errors.push('Invalid loadLocation');
  
//   // Skip unloadLocation validation if it's "Consignee"
//   if (connectivityPlan.unloadLocation !== "Consignee" && !unloadLocation) {
//     errors.push('Invalid unloadLocation');
//   }

//   if (errors.length > 0) {
//     return { errors };
//   }

//   return {
//     AWBId: awb!.id,
//     tripId: trip!.id,
//     loadLocationId: loadLocation!.id,
//     unloadLocationId: unloadLocation ? unloadLocation.id : null,  // Set unloadLocationId to null if Consignee
//   };
// }

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
     DEPSType:"Excess",
     depsStatus:"Open"
   },
   select:{
    id:true,
    DEPSType:true,
    scanType:true,
    AWBId:true,
    depsStatus:true,
    createdOn:true,
    loadUser:{
      select:{
        id:true,
        employeeId:true,
        firstName:true,
        lastName:true
      }
    },
    loadingHubBranch:{
      select:{
        id:true,
        branchCode:true
      }
    },
    AirWayBill:{
      select:{
        AWBCode:true,
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
  AWBIds: number[],
  tripId: number,
  scanTypeEnum: ArticleLogsScanType
) => {
  const articlesWithoutLogsAndDeps = await prisma.awbArticle.findMany({
    where: {
      // AWBId: AWBId, // Filter by specific AWBId
      AWBId: { in: AWBIds }, 
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

export const closeDeps = async (depsId: number) => {
  // Fetch the DEPs details from the database
  const checkDeps = await prisma.dEPS.findUnique({
    where: {
      id: depsId,
    },
  });
  
  // If DEPs does not exist, return an error message
  if (!checkDeps) {
    return "InvalidDeps";
  }

  // If DEPs are already closed, return "AlreadyClosed"
  if (checkDeps.depsStatus === "Closed") {
    return "AlreadyClosed";
  }

  // Define a mapping of DEPSType to corresponding Airway Bill field
  const countFieldMap: { [key: string]: string } = {
    "Excess": "rollupExcessCount",
    "Shorts": "rollupShortCount",
    "Damage": "rollupDamageCount",
    "Pilferage":"rollupPilferageCount"
  };

  const countField = countFieldMap[checkDeps.DEPSType];

  // If the DEPSType is not in the map, return an error
  if (!countField) {
    return "InvalidDEPSType";
  }

  // Decrement the corresponding count in the Airway Bill
  await prisma.airWayBill.update({
    where: {
      id: checkDeps.AWBId,
    },
    data: {
      [countField]: {
        decrement: 1,
      },
    },
  });

  // Update DEPs status to "Closed"
  await prisma.dEPS.update({
    where: {
      id: depsId,
    },
    data: {
      depsStatus: "Closed",
    },
  });
};






// services/webhookService.ts
import { TripObject, VendorObject, VehicleObject } from '../types/webhookTypes';

export const processTripAdd = async (trip: TripObject,event:string,payload:object) => {
  console.log('Processing trip add:', trip);

  try {
    // Fetch vendor, driver, vehicle, and vehicle owner data
    const vendorRes = await prisma.vendorMaster.findFirst({
      where: { marketpeId: trip?.broker?.id },
      select: { id: true },
    });
    const driverMasterRes = await prisma.driverMaster.findFirst({
      where: { marketpeId: trip?.driver?.id },
      select: { id: true },
    });
    const vehicleMasterRes = await prisma.vehicleMaster.findFirst({
      where: { marketpeId: trip?.vehicle?.id },
      select: { id: true },
    });
    const vehicleOwnerRes = await prisma.vehicleOwner.findFirst({
      where: { marketpeId: trip?.vehicleOwner?.id },
      select: { id: true },
    });

    // Determine missing details
    const missingDetails: string[] = [];
    if (!vehicleMasterRes) missingDetails.push('vehicle');
    if (!driverMasterRes) missingDetails.push('driver');
    if (!vendorRes) missingDetails.push('vendor');
    if (!vehicleOwnerRes) missingDetails.push('vehicle owner');

    const remarks =
      missingDetails.length > 0
        ? `${missingDetails.join(', ')} details are missing`
        : trip.comment;

    // Generate trip code
    const latestTrip = await prisma.tripDetails.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true, tripCode: true },
    });

    let alphanumericPart = 'AAA';
    let numericPart = 1;

    if (latestTrip) {
      const lastAlphaCode = latestTrip.tripCode.slice(-6, -3);
      const lastNumCode = parseInt(latestTrip.tripCode.slice(-3));
      alphanumericPart = lastAlphaCode;
      numericPart = lastNumCode + 1;

      if (numericPart >= 1000) {
        alphanumericPart = incrementAlphanumericCode(alphanumericPart);
        numericPart = 1;
      }
    }

    const tripCodeGen = `${alphanumericPart}${String(numericPart).padStart(3, '0')}`;
    console.log(tripCodeGen, "tripCodeGen");

    // Create the trip
    const newTrip = await prisma.tripDetails.create({
      data: {
        tripCode: "AAA006",
        remarks: remarks,
        vendorId: vendorRes?.id ?? null,
        vehicleId: vehicleMasterRes?.id,
        driverId: driverMasterRes?.id,
        marketpeId: trip.id,
        marketpeAutoIdentifier: trip.autoIdentifier,
        marketpeCreatedTime: trip.createdTime,
        marketpeAutoIdentifierNumber: trip.autoIdentifierNumber,
        marketpeIdentifier: trip.identifier,
        marketpeFromPlace: trip.fromPlace,
        marketpeToPlace: trip.toPlace,
        marketpeStops: trip.stops.join(','),
        marketpeRemarks: trip.comment,
        marketpeStatus: trip.tripStatus,
        marketpeConsignorName: trip.consignorName,
        marketpeConsigneeName: trip.consigneeName,
        marketpeConsignorGst: trip.consignorGstin,
        marketpeConsigneeGst: trip.consigneeGstin,
        marketpeDistance: trip.distanceKm,
        marketpeOdometerStartKm: trip.odometerStartKm,
        marketpeOdometerEndKm: trip.odometerEndKm,
        marketpeBookingFreight: trip.bookingFreight,
      },
    });

    // Log success in ExternalRequestLog
    await prisma.externalRequestLog.create({
      data: {
        vendorName: 'MarketPe',
        requestType: event,
        requestBody: JSON.stringify(payload),
        status: 'Success',
        errorMessage: null,
        createdOn: new Date(),
      },
    });

  } catch (error) {
    console.error('Error processing trip:', error);

    // Log the error in ExternalRequestLog
    await prisma.externalRequestLog.create({
      data: {
        vendorName:"MarketPe",
        requestType: event,
        requestBody: JSON.stringify(payload),
        status: 'Failure',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        createdOn: new Date(),
      },
    });
  }
};

// export const processTripAdd = async (trip: TripObject) => {
//   console.log('Processing trip add:', trip);
//   // Add trip logic here

//   const vendorRes = await prisma.vendorMaster.findFirst({
//     where: {
//       marketpeId: trip?.broker?.id,
//     },
//     select:{
//       id:true
//     }
//   });
//   const driverMasterRes = await prisma.driverMaster.findFirst({
//     where: {
//       marketpeId: trip?.driver?.id,
//     },
//     select:{
//       id:true
//     }
//   });
//   const vehicleMasterRes = await prisma.vehicleMaster.findFirst({
//     where: {
//       marketpeId: trip?.vehicle?.id,
//     },
//     select:{
//       id:true
//     }
//   });
//   const vehicleOwnerRes = await prisma.vehicleOwner.findFirst({
//     where: {
//       marketpeId: trip?.vehicleOwner?.id,
//     },
//     select:{
//       id:true
//     }
//   });
//   const missingDetails: string[] = [];
//   if (!vehicleMasterRes) missingDetails.push('vehicle');
//   if (!driverMasterRes) missingDetails.push('driver');
//   if (!vendorRes) missingDetails.push('vendor');
//   if (!vehicleOwnerRes) missingDetails.push('vehicle owner');

//   const remarks =
//     missingDetails.length > 0
//       ? `${missingDetails.join(', ')} details are missing`
//       : trip.comment;

//   const latestTrip = await prisma.tripDetails.findFirst({
//     orderBy: { id: 'desc' },
//     select: { id: true, tripCode: true }
// });
// console.log(latestTrip,"latestTripResponse")


// // Set initial alphanumeric and numeric parts
// let alphanumericPart = 'AAA';
// let numericPart = 1;

// if (latestTrip) {
//     const lastAlphaCode = latestTrip.tripCode.slice(-6, -3); // Get the 'AAA' part
//     const lastNumCode = parseInt(latestTrip.tripCode.slice(-3)); // Get the '000' part
//     console.log(lastAlphaCode,"lastAlphaCode",lastNumCode,"lastAlphaCode")
//     alphanumericPart = lastAlphaCode;
//     numericPart = lastNumCode + 1;

//     // If numeric part reaches 1000, reset it and increment alphanumeric part
//     if (numericPart >= 1000) {
//         alphanumericPart = incrementAlphanumericCode(alphanumericPart);
//         numericPart = 1;
//     }
// }
// const tripCodeGen = `${alphanumericPart}${String(numericPart).padStart(3, '0')}`;
// console.log(tripCodeGen,"tripCodeGen");


//   // Create the trip
//   const newTrip = await prisma.tripDetails.create({
//     data: {
//       // tripCode: trip?.tripCode ?? "DefaultTripCode", // Ensure a unique code
//       tripCode:tripCodeGen,
//       remarks:remarks,
//       vendorId: vendorRes?.id ?? null, // Use fetched vendor ID
//       vehicleId: vehicleMasterRes?.id, // Use fetched vehicle ID
//       driverId: driverMasterRes?.id, // Use fetched driver ID
//       marketpeId:trip.id,
//       marketpeAutoIdentifier:trip.autoIdentifier,
//       marketpeCreatedTime:trip.createdTime,
//       marketpeAutoIdentifierNumber:trip.autoIdentifierNumber,
//       marketpeIdentifier:trip.identifier,
//       marketpeFromPlace:trip.fromPlace,
//       marketpeToPlace:trip.toPlace,
//       marketpeStops:trip.stops.join(','),
//       marketpeRemarks:trip.comment,
//       marketpeStatus:trip.tripStatus,
//       marketpeConsignorName:trip.consignorName,
//       marketpeConsigneeName:trip.consigneeName,
//       marketpeConsignorGst:trip.consignorGstin,
//       marketpeConsigneeGst:trip.consigneeGstin,
//       marketpeDistance:trip.distanceKm,
//       marketpeOdometerStartKm:trip.odometerStartKm,
//       marketpeOdometerEndKm:trip.odometerEndKm,
//       marketpeBookingFreight:trip.bookingFreight,
//     },
//   });
  


// };


export const processTripUpdate = async (trip: TripObject) => {
  console.log('Processing trip update:', trip);

  // Fetch related IDs
  const vendorRes = await prisma.vendorMaster.findFirst({
    where: {
      marketpeId: trip?.broker?.id,
    },
    select: {
      id: true,
    },
  });
  const driverMasterRes = await prisma.driverMaster.findFirst({
    where: {
      marketpeId: trip?.driver?.id,
    },
    select: {
      id: true,
    },
  });
  const vehicleMasterRes = await prisma.vehicleMaster.findFirst({
    where: {
      marketpeId: trip?.vehicle?.id,
    },
    select: {
      id: true,
    },
  });
  const vehicleOwnerRes = await prisma.vehicleOwner.findFirst({
    where: {
      marketpeId: trip?.vehicleOwner?.id,
    },
    select: {
      id: true,
    },
  });

  if (!vendorRes) console.error(`Broker with ID ${trip?.broker?.id} not found`);
  if (!driverMasterRes) console.error(`Driver with ID ${trip?.driver?.id} not found`);
  if (!vehicleMasterRes) console.error(`Vehicle Owner with ID ${trip?.vehicleOwner?.id} not found`);
  if (!vehicleMasterRes) console.error(`Vehicle with ID ${trip?.vehicle?.id} not found`);

  if (!vendorRes || !driverMasterRes || !vehicleMasterRes || !vehicleOwnerRes) {
    console.error('One or more related records are missing.');
    throw new Error('Required related records not found.');
  }

  // Update the trip
 
  const updatedTrip = await prisma.tripDetails.updateMany({
    where: {
      marketpeId: trip.id, // Ensure trips are uniquely identified by marketpeId
    },
    data: {
      tripCode: trip?.tripCode ?? "DefaultTripCode",
      vendorId: vendorRes.id, // Update with fetched vendor ID
      vehicleId: vehicleMasterRes.id, // Update with fetched vehicle ID
      driverId: driverMasterRes.id, // Update with fetched driver ID
      marketpeAutoIdentifier: trip.autoIdentifier,
      marketpeCreatedTime: trip.createdTime,
      marketpeAutoIdentifierNumber: trip.autoIdentifierNumber,
      marketpeIdentifier: trip.identifier,
      marketpeFromPlace: trip.fromPlace,
      marketpeToPlace: trip.toPlace,
      marketpeStops: trip.stops.join(','), // Ensure stops are stored as a string
      marketpeRemarks: trip.comment,
      marketpeStatus: trip.tripStatus,
      marketpeConsignorName: trip.consignorName,
      marketpeConsigneeName: trip.consigneeName,
      marketpeConsignorGst: trip.consignorGstin,
      marketpeConsigneeGst: trip.consigneeGstin,
      marketpeDistance: trip.distanceKm,
      marketpeOdometerStartKm: trip.odometerStartKm,
      marketpeOdometerEndKm: trip.odometerEndKm,
      marketpeBookingFreight: trip.bookingFreight,
    },
  });

  console.log('Trip updated successfully:', updatedTrip);
};

export const processVendorAdd = async (vendor: VendorObject) => {
  let savedVendor;
  try {
    
    // Check the type of vendor and insert accordingly
    if (vendor.type === 'BROKER' || vendor.type === 'VENDOR') {
      console.log("in broker|vendor")
      savedVendor = await prisma.vendorMaster.create({
        data: {
         
          marketpeId: vendor.id,
          marketpeCreatedTime: vendor.createdTime,
          marketpeAutoIdentifier: vendor.autoIdentifier,
          marketpeAutoIdentifierNumber: vendor.autoIdentifierNumber,
          marketpeIdentifier: vendor.identifier,
          marketpeName: vendor.name,
          marketpePhone: vendor.phone,
          marketpeType:vendor.type
         
        },
      });
    }
     else if (vendor.type === 'DRIVER') {
      // Insert into driverMaster for DRIVER type
      console.log("in driver")
      savedVendor = await prisma.driverMaster.create({
        data: {
        
          marketpeId: vendor.id,
          marketpeCreatedTime: vendor.createdTime,
          marketpeAutoIdentifier: vendor.autoIdentifier,
          marketpeAutoIdentifierNumber: vendor.autoIdentifierNumber,
          marketpeIdentifier: vendor.identifier,
          marketpeName: vendor.name,
          marketpePhone: vendor.phone,
          marketpeType:vendor.type
        },
      });
    }
    else if (vendor.type === 'VEHICLE_OWNER') {
      // Insert into vehicleOwner for vehicleOwner type
      console.log("in vehicle owner")
      savedVendor = await prisma.vehicleOwner.create({
        data: {
        
          marketpeId: vendor.id,
          marketpeCreatedTime: vendor.createdTime,
          marketpeAutoIdentifier: vendor.autoIdentifier,
          marketpeAutoIdentifierNumber: vendor.autoIdentifierNumber,
          marketpeIdentifier: vendor.identifier,
          marketpeName: vendor.name,
          marketpePhone: vendor.phone,
          marketpeType:vendor.type
        },
      });
    }
    else {
      throw new Error('Invalid vendor type');
    }

    return savedVendor;
  } catch (error) {
    throw error; // Re-throw the error for handling in the webhook handler
  }
};

// // Vendor Master update logic
 export const processVendorUpdate = async (vendor: VendorObject) => {
  try {
    let updatedVendor;

    // Check the type of vendor and update accordingly
    if (vendor.type === 'BROKER' || vendor.type === 'VENDOR') {
      updatedVendor = await prisma.vendorMaster.updateMany({
        where: { marketpeId: vendor.id },
        data: {
          marketpeCreatedTime: vendor.createdTime,
          marketpeAutoIdentifier: vendor.autoIdentifier,
          marketpeAutoIdentifierNumber: vendor.autoIdentifierNumber,
          marketpeIdentifier: vendor.identifier,
          marketpeName: vendor.name,
          marketpePhone: vendor.phone,
          marketpeType:vendor.type
        },
      });
    }
    else if (vendor.type === 'DRIVER') {
      // Update the driverMaster for DRIVER type
      updatedVendor = await prisma.driverMaster.updateMany({
        where: { marketpeId: vendor.id },
        data: {
          marketpeCreatedTime: vendor.createdTime,
          marketpeAutoIdentifier: vendor.autoIdentifier,
          marketpeAutoIdentifierNumber: vendor.autoIdentifierNumber,
          marketpeIdentifier: vendor.identifier,
          marketpeName: vendor.name,
          marketpePhone: vendor.phone,
          marketpeType:vendor.type
        },
      });
    }
    else if (vendor.type === 'VEHICLE_OWNER') {
      // Update the vehicleOwner for VEHICLE_OWNER type
      updatedVendor = await prisma.vehicleOwner.updateMany({
        where: { marketpeId: vendor.id },
        data: {
          marketpeCreatedTime: vendor.createdTime,
          marketpeAutoIdentifier: vendor.autoIdentifier,
          marketpeAutoIdentifierNumber: vendor.autoIdentifierNumber,
          marketpeIdentifier: vendor.identifier,
          marketpeName: vendor.name,
          marketpePhone: vendor.phone,
          marketpeType:vendor.type
        },
      });
    }

    return updatedVendor;
  } catch (error) {
    console.error('Error processing vendor update:', error);
    throw new Error('Error updating vendor/driver: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};


export const processVehicleAdd = async (vehicle: VehicleObject) => {
  try {
      const newVehicle = {
        marketpeRegistrationNumber: vehicle.registrationNumber,
        marketpeId: vehicle.id,
        marketpeCreatedTime: vehicle.createdTime,
        marketpeAutoIdentifier: vehicle.autoIdentifier,
        marketpeAutoIdentifierNumber: vehicle.autoIdentifierNumber,
      };

    const savedVehicle = await prisma.vehicleMaster.create({
      data: newVehicle,
    });

    return savedVehicle;
  } catch (error) {
    console.error('Error processing vehicle addition:', error);
    // Ensure error is handled properly since it could be 'unknown'
    if (error instanceof Error) {
      throw new Error(`Error adding vehicle: ${error.message}`);
    } else {
      throw new Error('Error adding vehicle: Unknown error occurred');
    }
  }
};


export const processVehicleUpdate = async (vehicle: VehicleObject) => {
   console.log('Processing vehicle update in service:');

  // Dynamically update the vehicle data based on what is provided in the input
  const updateVehicle = await prisma.vehicleMaster.updateMany({
    where: {
      marketpeId: vehicle.id  // Use the vehicle's ID to find the existing vehicle
    },
    data: {
      marketpeRegistrationNumber: vehicle.registrationNumber,  // Update the registration number
      marketpeAutoIdentifier: vehicle.autoIdentifier,  // Update auto identifier
      marketpeAutoIdentifierNumber: vehicle.autoIdentifierNumber, // Update auto identifier number
      marketpeCreatedTime: vehicle.createdTime  // Update created time
    }
  });

  return updateVehicle;
};

