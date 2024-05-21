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

export const addTripCheckin = async (inwardTime:string, tripId:number, hubId:number, odometerReading:number,tripType:any) => {
    const today =moment().toISOString();  
    const result=await prisma.$transaction(async prisma => {
        await prisma.tripCheckIn.create({
            data:{
                tripId: tripId,
                locationBranchId: hubId,
                odometerReading: odometerReading,
                time: inwardTime,
                type:tripType
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

export const unloadArticlesValidate = async (AWBId:number,AWBArticleId:number,tripId:number) => {
    const result=await prisma.$transaction(async prisma => {
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
              AWBId: AWBId,
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


export const loadArticlesValidate = async (AWBId:number,AWBArticleId:number,tripId:number) => {
    const result=await prisma.$transaction(async prisma => {
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
              AWBId: AWBId,
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
  AWBCode:string
}


export const getTripLineItems = async (tripId: number,scanType:any) => {
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
              AWBCode: true,
            },
          },
        },
      },
      TripDetails: {
        select: {
          tripCode: true,
          route: true,
          driver: {
            select: {
              driverName: true,
              phone1: true,
            },
          },
          vehicle: {
            select: {
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

    if (!groupedResult[AWBCode]) {
      groupedResult[AWBCode] = {
        tripId: entry.tripId,
        tripCode: entry.TripDetails?.tripCode,
        route: entry.TripDetails?.route ?? undefined,
        driverName: entry.TripDetails?.driver?.driverName,
        phone1: entry.TripDetails?.driver?.phone1 ?? undefined,
        vehicleNum: entry.TripDetails?.vehicle?.vehicleNum,
        numberOfArticles: entry.TripDetails?.numberOfArticles ?? undefined,
        numOfScan: 0,
        AWBCode: AWBCode
      };
    }

    groupedResult[AWBCode].numOfScan += 1;
  });

  const formattedResult = Object.values(groupedResult);

  return formattedResult;
};

export const addAWBArticleLogs = async (AWBArticleId:number,scanType:any,tripId:number) => {
  const today =moment().toISOString();  
   const result=await prisma.$transaction(async prisma => {
      const AWBArticleTripLogsRes=await prisma.awbArticleTripLogs.createMany({
          data:{
            AWBArticleId:AWBArticleId,
            tripId:tripId,
            scanType:scanType
          }
      })
  })
};