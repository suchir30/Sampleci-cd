import prisma from '../client';
import moment from 'moment';

export const getTrips = async (tripStatus:any) => {
    const openTrips = await prisma.tripDetails.findMany({
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
        },
        where: {
          tripStatus: tripStatus
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
      console.log(AWBIdRes?.id,"$$$$")
        const tripLineItemRes = await prisma.tripLineItem.findFirst({
            select:{
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
          if(tripDetailsRes?.latestCheckinHubId==tripLineItemRes?.nextDestinationId){
         
            console.log("valid")
            return "Valid"
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
        const tripLineItemRes = await prisma.tripLineItem.findFirst({
            select:{
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
            return "Valid"
          }
          else{
            console.log("invalid")
            return tripLineItemRes?.trip?.tripCode
          }
        })
        return result
};

interface TripDetails {
  tripId: number;
  tripCode?: string;
  route?: string;
  driverName?: string;
  phone1?: string;
  vehicleNum?: string;
  numberOfArticles?: number;
  numOfScan: number;
  AWBCode:string;
  AWBCreatedOn?: Date;
  AWBId:number;
  VehicleId?:number,
  DriverId?:number,

}


export const getTripLineItems = async (tripId: number,scanType:any) => {
  const LogsRes=await prisma.awbArticleTripLogs.findMany({
    where: {
      tripId: tripId,
      scanType: scanType,
    },
  })
  if(LogsRes.length==0){
    const tripDetails = await prisma.tripDetails.findMany({
      where: {
        id: tripId,
      },
      select: {
        id:true,
        tripCode: true,
        route: true,
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
    }));
    
    return modifiedTripDetails; 
  }
  else{
    const result = await prisma.awbArticleTripLogs.findMany({
      where: {
        tripId: tripId,
        scanType: scanType,
      },
      select: {
        id: true,
        tripId: true,
        AwbArticle: {
          select: {
            AWB: {
              select: {
                id:true,
                AWBCode: true,
                createdOn:true,
                numOfArticles:true
              },
            },
          },
        },
        TripDetails: {
          select: {
            id:true,
            tripCode: true,
            route: true,
            driver: {
              select: {
                id:true,
                driverName: true,
                phone1: true,
              },
            },
            vehicle: {
              select: {
                id:true,
                vehicleNum: true,
              },
            },
            numberOfArticles: true,
          },
        },
      },
    });
  
    const groupedResult: { [key: string]: TripDetails } = {};
  
    result.forEach(entry => {
     const AWBCode = entry.AwbArticle?.AWB?.AWBCode || 'Unknown';
     const createdOn = entry.AwbArticle?.AWB?.createdOn ?? undefined;
     const AWBId = entry.AwbArticle?.AWB?.id ?? undefined;
     const VehicleId = entry.TripDetails?.vehicle?.id || undefined;
     const DriverId = entry.TripDetails?.driver?.id ?? undefined;
     const numberOfArticles = entry.AwbArticle.AWB?.numOfArticles ?? undefined;
  
      if (!groupedResult[AWBCode]) {
        groupedResult[AWBCode] = {
          tripId: entry.tripId,   //
          tripCode: entry.TripDetails?.tripCode,//
          route: entry.TripDetails?.route ?? undefined,//
          driverName: entry.TripDetails?.driver?.driverName,//
          phone1: entry.TripDetails?.driver?.phone1 ?? undefined,//
          vehicleNum: entry.TripDetails?.vehicle?.vehicleNum,//
          numberOfArticles:numberOfArticles,
          numOfScan: 0,
          AWBCode:AWBCode,
          AWBCreatedOn:createdOn,
          AWBId:AWBId,
          VehicleId:VehicleId,
          DriverId:DriverId,
        };
      }
  
      groupedResult[AWBCode].numOfScan += 1;
    });
  
    const formattedResult = Object.values(groupedResult);
  
    return formattedResult;
    
  }
  
};

export const addAWBArticleLogs = async (AWBArticleCode:any,scanType:any,tripId:number) => {
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
          scanType:scanType
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
