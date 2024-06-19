import prisma from '../client';
import moment from 'moment';

export const getTrips = async (tripStatus:any,latestCheckinHubId:number,latestCheckinType:string) => {
  const whereClause: any = { tripStatus: tripStatus, };

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
      where :{articleCode:AWBArticleId}
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
              nextDestinationId:true,
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
        console.log(tripDetailsRes?.latestCheckinHubId,"validConditionss",tripLineItemRes?.nextDestinationId)
        if(tripDetailsRes?.latestCheckinHubId==tripLineItemRes?.nextDestinationId){
       
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
      where :{articleCode:AWBArticleId}
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
    // console.log("check",checkDuplicateRes,AWBArticleIdRes?.id,)
    if(checkDuplicateRes.length>0){
      return "Duplicate"
    }
      const tripLineItemRes = await prisma.tripLineItem.findFirst({
          select:{
              id:true,
              AWBId:true,
              tripId:true,
              nextDestinationId:true,
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
      },
    },
  });
  const modifiedTripDetails = tripDetails.map(trip => ({
    tripId: trip.id,
    tripCode: trip.tripCode,
    route: trip.route,
    vehicleNum: trip.vehicle?.vehicleNum,
    driverName: trip.driver?.driverName,
    phone1: trip.driver?.phone1,
    latestCheckinHub:trip.latestCheckinHubId,
  }));

  return modifiedTripDetails;
   
};


interface TripDetails {
  numberOfArticles?: number;
  numOfScan: number;
  AWBCode: string;
  AWBCreatedOn?: Date;
  AWBId: number;
  tripLineItemId?: number;
  nextDestinationCode?:string;
  finalDestinationCode?:string;
  TripLineItemStatus?: string;
}

export const getTripLineItems = async (tripId: number, scanType: any, tripLineItemStatus: any) => {
  const LogsRes = await prisma.awbArticleTripLogs.findMany({
    where: {
      tripId: tripId,
      scanType: scanType,
    },
  });

  if (LogsRes.length === 0) {
    return [];
  } else {
    const result = await prisma.awbArticleTripLogs.findMany({
      where: {
        tripId: tripId,
        scanType: scanType,
      },
      orderBy: {
        createdOn: 'desc'
      },
      select: {
        TripLineItem:{
          where: {
            status:tripLineItemStatus
          },
          select:{
            id: true,
            AWBId: true,
            status: true,
            nextDestinationId:true,
            finalDestinationId:true,
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
          }
          }
        },
        AwbArticle:{
          select:{
            AWB:{
              select:{
                id: true,
                AWBCode: true,
                createdOn: true,
                numOfArticles: true
              }
            
            }

          }
        }
      },
    })

    // Group by AWBArticleId and get the latest createdOn date for each AWBCode
    const latestLogs = await prisma.awbArticleTripLogs.groupBy({
      by: ['AWBArticleId'], 
      where: {
        tripId: tripId,
        scanType: scanType,
      },
      _max: {
        createdOn: true
      }
    });

   
    const latestCreatedOnMap: { [key: string]: Date | null } = {};
    latestLogs.forEach(log => {
      const AWBCode = log.AWBArticleId; 
      const latestCreatedOn = log._max?.createdOn;
      latestCreatedOnMap[AWBCode] = latestCreatedOn ?? null;
    });
    const groupedResult: TripDetails[] = [];
    console.log(result,"^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",)
    result.forEach(entry => {
      if(entry.TripLineItem){
      const AWBCode=entry.AwbArticle?.AWB?.AWBCode || "Unknown";
      const createdOn = entry.AwbArticle?.AWB?.createdOn ?? undefined;
       const AWBId = entry.AwbArticle?.AWB?.id ?? 0;
       const numberOfArticles = entry.AwbArticle?.AWB?.numOfArticles ?? undefined;
       const tripLineItemId = entry.TripLineItem?.id;
       const TripLineItemStatus = entry.TripLineItem?.status ?? undefined;
       const nextDestinationCode = entry.TripLineItem?.nextBranch?.branchCode ?? undefined;
       const finalDestinationCode = entry.TripLineItem?.finalBranch?.branchCode ?? undefined;
    

      if (!groupedResult.find(item => item.AWBCode === AWBCode)) {
        groupedResult.push({
          numberOfArticles: numberOfArticles,
          numOfScan: 0, // Initialize numOfScan to 0 for each AWBCode
          AWBCode: AWBCode,
          AWBCreatedOn: createdOn,
          AWBId: AWBId,
          tripLineItemId: tripLineItemId,
          nextDestinationCode:nextDestinationCode,
          finalDestinationCode:finalDestinationCode,
          TripLineItemStatus: TripLineItemStatus
      })
    }

    groupedResult.find(item => item.AWBCode === AWBCode)!.numOfScan += 1;
    }
    });


    return groupedResult;
  }
};

export const addAWBArticleLogs = async (AWBArticleCode:any,scanType:any,tripId:number,tripLineItemId:number) => {
  const today =moment().toISOString();  
   const result=await prisma.$transaction(async prisma => {
    const AWBArticleRes=await prisma.awbArticle.findFirst({
      where :{articleCode:AWBArticleCode}
    })

    if(AWBArticleRes){
      const AWBArticleTripLogsRes=await prisma.awbArticleTripLogs.createMany({
        data:{
          AWBArticleId:AWBArticleRes?.id,
          tripId:tripId,
          scanType:scanType,
          tripLineItemId:tripLineItemId

        }
    })
    }
  
  })
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

export const outwardedAWB = async (tripId:number,data:any) => {
  const result=await prisma.$transaction(async prisma => {
    const awbIds = data.map((item: { AWBId: number }) => item.AWBId);
    const tripLineItemUpdatePromises = data.map((item: { AWBId: number; latestCheckinHubId: number,tripLineItemId:number,nextDestinationId:number }) => {
      return prisma.tripLineItem.updateMany({
        where: {
          id: item.tripLineItemId
        },
        data: {
          status: 'Open',
          nextDestinationId: item.nextDestinationId
        }
      })
    })
    await Promise.all(tripLineItemUpdatePromises);

    const updatedAirWayBills = await prisma.airWayBill.updateMany({
      where: {
        id: {
          in: awbIds
        }
      },
      data: {
        AWBStatus:"InTransit"
      }
    })

    const hlfUpdatePromises =  data.map(async(item: { AWBId: number; latestCheckinHubId: number,tripLineItemId:number,nextDestinationId:number }) => {
      const existingRecord = await prisma.hLFLineItem.findFirst({
        where: {
          hlfLineItemAWBId: item.AWBId,
        },
        orderBy: {
          id: 'desc',
        },
      });

      if(existingRecord){
        if(existingRecord.hlfLineStatus=="Inwarded"){
         
          const updateRecord = await prisma.hLFLineItem.updateMany({
            where: {
              hlfLineItemAWBId: item.AWBId,
            },
            data: {
              hlfLineStatus: 'Outwarded'
            },
          });

          return prisma.hLFLineItem.create({
            data: {
              hlfLineItemAWBId: item.AWBId,
              hlfLineStatus: 'ToBeInwarded',
              branchId: item.nextDestinationId,
            },
          });


        }
      }

      else{
        return prisma.hLFLineItem.create({
          data: {
            hlfLineItemAWBId: item.AWBId,
            hlfLineStatus: 'ToBeInwarded',
            branchId: item.nextDestinationId,
          },
        });
      }
    })
    await Promise.all(hlfUpdatePromises);
    

 })
};

export const inwardedAWB = async (tripId:number,data:any) => {
  const result=await prisma.$transaction(async prisma => {
    const awbIds = data.map((item: { AWBId: number }) => item.AWBId);
    const updatedTripLineItems = await prisma.tripLineItem.updateMany({
      where: {
        tripId:tripId
      },
      data: {
        status: "Closed"
      }
    });

    const updatedAirWayBills = await prisma.airWayBill.updateMany({
      where: {
        id: {
          in: awbIds
        }
      },
      data: {
        AWBStatus: 'atHub'
      }
    })

    const hlfUpdatePromises = data.map((item: { AWBId: number; latestCheckinHubId: number }) => {
      return prisma.hLFLineItem.updateMany({
        where: {
          hlfLineItemAWBId: item.AWBId,
          hlfLineStatus:"ToBeInwarded"
        },
        data: {
          hlfLineStatus: 'Inwarded'
        }
      })
    })
    await Promise.all(hlfUpdatePromises);

 })
};

