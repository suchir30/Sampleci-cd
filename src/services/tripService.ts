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
              nextBranch:{
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
          return tripLineItemRes?.nextBranch?.branchName
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
              unloadLocationId:true,
              status:true,
              nextBranch:{
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
        if(tripLineItemRes?.status=="Assigned"){
          console.log("valid")
          return `Valid+${tripLineItemRes?.id}`
        }
        else{
          console.log("invalid")
          return tripLineItemRes?.trip?.tripCode
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
      vehicle: {
        select: {
          vehicleNum: true,
        },
      },
      driver: {
        select: {
          driverName: true,
          phone1: true,
        },
      }
    },
  });
  const modifiedTripDetails = tripDetails.map(trip => ({
    tripId: trip.id,
    tripCode: trip.tripCode,
    route: trip.route,
    vehicleNum: trip.vehicle?.vehicleNum,
    driverName: trip.driver?.driverName,
    phone1: trip.driver?.phone1,
    latestCheckinHub:trip.latestCheckinHubId
  }));

  return modifiedTripDetails;
   
};

export const getTripLineItems = async (tripId: number, tripLineItemStatus: any, loadLocationId?: number, unloadLocationId?: number) => {
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
        latestScanTime:'desc'
      },
      select:{
        id:true,
        rollupScanCount:true,
        rollupDepsCount:true,
        latestScanTime:true,
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
        nextBranch:{
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
      unloadLocation:item.nextBranch?.branchName,
      finalDestinationCode:item.finalBranch?.branchCode,
      awbFromLocationCOde: item.AirWayBill.fromBranch.branchCode,
      awbToLocationCOde: item.AirWayBill.toBranch.branchCode,
      awbRollupActualWeighgtkgs: item.AirWayBill.rollupWeight,
      awbRollupChargedWeighgtkgs: item.AirWayBill.rollupChargedWtInKgs,
      completeFlag: item.AirWayBill.completeFlag,
      TripLineItemStatus: item.status,
      numOfScan:item.rollupScanCount||0,
      rollupDepsCount:item.rollupDepsCount||0,
      numberOfArticles: item.AirWayBill.numOfArticles,
      latestScanTime:item.latestScanTime
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
          latestScanTime: today
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
      AwbArticle: {
        AWB: {
          id: AWBId,
        },
      },
    },
    select: {
      scanType:true,
      AwbArticle: {
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
    const awb = log.AwbArticle.AWB;
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
      articleCode: log.AwbArticle.articleCode,
      articleId: log.AwbArticle.id 
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
            hlfLineItemAWBId: item.AWBId,
          },
          orderBy: {
            id: 'desc',
          },
        });

        if (existingRecord) {
          if (existingRecord.hlfLineStatus == "Inwarded") {
            await prisma.hLFLineItem.updateMany({
              where: {
                hlfLineItemAWBId: item.AWBId,
              },
              data: {
                hlfLineStatus: 'Outwarded',
              },
            });

            await prisma.hLFLineItem.create({
              data: {
                hlfLineItemAWBId: item.AWBId,
                hlfLineStatus: 'ToBeInwarded',
                branchId: item.unloadLocationId,
              },
            });
          }
        } else {
          await prisma.hLFLineItem.create({
            data: {
              hlfLineItemAWBId: item.AWBId,
              hlfLineStatus: 'ToBeInwarded',
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
            hlfLineItemAWBId: {
              in: awbIds
            },
            hlfLineStatus: "ToBeInwarded"
          },
          data: {
            hlfLineStatus: 'Inwarded'
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