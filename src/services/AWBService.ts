import { ArticleStatus,AwbLineItem} from '@prisma/client';
import moment from 'moment';
import prisma from '../client';
import { AWBCreateData } from '../types/awbTypes';
export const generateBulkAWBForConsignor = async (consignorId: number, awbData: AWBCreateData[]):Promise<boolean> => {

    const result=await prisma.$transaction(async prisma => {
        if (!awbData?.length) {
            throw Error("Create AWB list is empty.");
        }
        // Retrive the consignor details
        const consignor = await prisma.consignor.findUniqueOrThrow({
            where: { consignorId },
            select: { consignorId: true, consignorCode: true, branchId: true }
        });
        if (consignor.branchId == null) {
            throw Error(`Consignor ${consignor.consignorCode} does not have a branch assigned.`);
        }

        // Retrieve the latest AWBId in a single database query
        const today = moment().format('YYYY-MM-DD');
        const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
        const latestAWB = await prisma.airWayBill.findFirst({
            where: {
                consignorId: {
                    equals: consignorId, // Assuming all consignorIds are the same
                },
                AND: [
                    {
                        createdOn: {
                            gte: new Date(today),
                        },
                    },
                    {
                        createdOn: {
                            lt: new Date(tomorrow),
                        },
                    },
                ],
            },
            orderBy: {
                id: 'desc',
            },
            select: {
                AWBCode: true,
            },
        });

        // Increment value
        let increment = 1;
        if (latestAWB) {
            const lastThreeChars = parseInt(latestAWB.AWBCode.slice(-3));
            console.log(lastThreeChars,"LASTTHREE");
            
            increment = lastThreeChars + 1;
        }

        // Generate all AWBIds in the dataArray
        const currentTimestamp = moment().format('DDMMYY');
        for (const data of awbData) {
            data.consignorId = consignor.consignorId;
            data.fromBranchId = consignor.branchId;
            data.AWBCode = `${consignor.consignorCode}${currentTimestamp}${String(increment).padStart(3, '0')}`;
            increment++;

            // Validations
            if (data.numOfArticles <= 0) {
                throw Error(`Found non-positive article count for: consigneeId=${data.consigneeId}, toBranchId=${data.toBranchId}.`);
            }
        }

        

        const createdAWBs = await prisma.airWayBill.createMany({
            data: awbData.map(data => ({
                consignorId: data.consignorId,
                consigneeId: data.consigneeId,
                numOfArticles: data.numOfArticles,
                fromBranchId: data.fromBranchId,
                toBranchId: data.toBranchId,
                AWBCode: data.AWBCode,
            })),
        });

        return createdAWBs;
    });
    return true;
};

export const getGeneratedAWB = async (consignorId: number, AWBStatus: any) => {
    const getGeneratedAWBQuery = await prisma.airWayBill.findMany({
        select: {
            id: true, 
            AWBCode: true,
            consignorId: true,
            consigneeId: true,
            fromBranchId: true,
            toBranchId: true,
            numOfArticles: true,
            AWBStatus:true,
            articleGenFlag:true,
            rollupArticleCnt:true,
            consignor: {
                select: {
                    consignorCode: true,
                    publicName: true,
                    legalName: true,
                    address1: true,
                }
            },
            consignee: {
                select: {
                    consigneeCode: true,
                    consigneeName: true,
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
            fromBranch: {
                select: {
                    branchName: true,
                }
            },
            toBranch: {
                select: {
                    branchName: true,
                }
            },
            AWBIdTripLineItems: {
                select: {
                    id: true,
                    tripId: true,
                    nextDestinationId: true,
                    finalDestinationId: true,
                    status: true,
                    ePODReceived: true,
                    originalPODReceived: true,
                    trip: {
                        select: {
                            route: true, // Include the route field from TripDetails
                        },
                    },
                },
            },
        },
        where: {
            consignorId: consignorId !== null ? consignorId : undefined,
            AWBStatus: AWBStatus,
        },
    });
    return getGeneratedAWBQuery;
};

export const updateArticleCountForAWB = async (AWBId: number, newArticleCount: number) => {
    if (newArticleCount <= 0) {
        throw Error("New article count is non-positive.");
    }

    const updateArticles = await prisma.airWayBill.update({
        where: { id: AWBId },
        data: { numOfArticles: newArticleCount },
    });
    return updateArticles;
    // return true;
};

const createAWBArticlesHelper = async (prisma: any, AWBId: number, AWBCode: string, numArticlesToAdd: number, articleNumberStartAt: number = 1) => {
    const createdArticles = await prisma.awbArticle.createMany({
        data: Array.from({ length: numArticlesToAdd }, (_, i) => {
            const curIndex = articleNumberStartAt + i;
            const newNumericPart = curIndex.toString().padStart(4, '0');
            return {
                AWBId: AWBId,
                articleIndex: curIndex,
                articleCode: `${AWBCode}${newNumericPart}`,
            }
        })
    });
//     const generateArticles = await prisma.awbArticle.findMany({
//         where: {
//             AWBId: AWBId,
//         },
//     });
//    return generateArticles
return true
}

export const getAWBArticles = async (AWBId: number) => {
    const getAWBArticlesQuery = await prisma.awbArticle.findMany({
        where: {
            AWBId: AWBId,
            status: {
                not: "Deleted"
            }
        },
        select: {
            id:true,
            articleCode: true,
            AWB: {
                select: {
                    id:true,
                    fromBranchId: true,
                    toBranchId: true,
                    numOfArticles: true,
                    consignee: {
                        select: {
                            consigneeName: true,
                            consigneeCode: true
                        }
                    },
                    consignor: {
                        select: {
                            publicName: true,
                            consignorCode: true
                        }
                    },   
                    fromBranch: {
                        select: {
                            branchName: true
                        }
                    },
                    toBranch: {
                        select: {
                            branchName: true
                        }
                    }
                }
            }
        }
    });
    return getAWBArticlesQuery;
};

export const generateAWBArticles = async (AWBId: number):Promise<boolean> => {
    const result=await prisma.$transaction(async prisma => {
        const awb = await prisma.airWayBill.findUniqueOrThrow({
            where: { id: AWBId },
            select: {
                numOfArticles: true,
                AWBCode: true
            }
        });
        const anyArticle = await prisma.awbArticle.findFirst({
            where: {
                AWBId: AWBId,
            },
            select: {
                articleIndex: true,
            },
        });
        if (anyArticle !== null) {
            const generateArticles = await prisma.awbArticle.findMany({
                where: {
                    AWBId: AWBId,
                },
            });
           return generateArticles
        }
        return await createAWBArticlesHelper(prisma, AWBId, awb.AWBCode, awb.numOfArticles);
    });
    return true;
}

export const addAWBArticles = async (AWBId: number, numArticlesToAdd: number):Promise<boolean> => {
    const result=await prisma.$transaction(async prisma => {
        const awb = await prisma.airWayBill.findUniqueOrThrow({
            where: { id: AWBId },
            select: { numOfArticles: true, AWBCode: true }
        });
        const lastArticle = await prisma.awbArticle.findFirst({
            where: {
                AWBId: AWBId,
            },
            orderBy: {
                articleIndex: 'desc', // Order by articleId in descending order
            },
            select: {
                articleIndex: true,
            },
        });
        if (numArticlesToAdd <= 0) {
            throw Error(`Article count should be positive. Got ${numArticlesToAdd}`);
        } else if (lastArticle === null) {
            throw Error(`Add AWB articles is only allowed if some articles have already been generated for AWB=${AWBId}`);
        } else if (lastArticle.articleIndex !== awb.numOfArticles) {
            throw Error(`Data integrity check failed. AWB->numOfArticles=${awb.numOfArticles} is not equal to latest articleIndex=${lastArticle.articleIndex}.`);
        }
        await prisma.airWayBill.update({
            where: { id: AWBId },
            data: {
                numOfArticles: awb.numOfArticles + numArticlesToAdd,
            }
        });
        return await createAWBArticlesHelper(prisma, AWBId, awb.AWBCode, numArticlesToAdd, lastArticle.articleIndex + 1);
    });
    return true;
}

export const markAWBArticlesAsPrinted = async (AWBId: number) => {
    const printedArticles = await prisma.awbArticle.updateMany({
        where: {
            AWBId: AWBId,
            status: {
                not: ArticleStatus.Deleted
            }
        },
        data: { status: ArticleStatus.Printed }
    });
    // return printedArticles;
    return true;
};
export const markAWBArticleAsDeleted = async (articleId: number, AWBId: number) => {
    await prisma.awbArticle.update({
        where: { id: articleId, AWBId },
        data: {
            status: ArticleStatus.Deleted,
        }
    });
   
    const deletedArticle = await prisma.awbArticle.findMany({
        where: {
            AWBId: AWBId,
            status: {
                not: ArticleStatus.Deleted
            }
        },
    });

    await prisma.airWayBill.update({
        where: { id:AWBId },
        data: {
            numOfArticles: deletedArticle.length,
        }
    });
    return deletedArticle;
};

export const assignedTriptoAWB = async (AWBId:number,tripId:number,finalDestinationId:number,status:string) => {
    const existingTripLineItem = await prisma.tripLineItem.findFirst({
        where: {
            AWBId: AWBId
        }
    });

    if(existingTripLineItem?.status=="Assigned") {
        await prisma.tripLineItem.updateMany({
            where: {
                AWBId: AWBId,
            },
            data: {
                tripId: tripId,
                finalDestinationId: finalDestinationId
            }
        });
    } 
    else if(existingTripLineItem?.status=="Open" || existingTripLineItem?.status=="Closed" || existingTripLineItem?.status=="Delivered"){
        return "Already EXists"
    }
    else {
        await prisma.tripLineItem.create({
            data: {
                AWBId: AWBId,
                tripId: tripId,
                finalDestinationId: finalDestinationId
            }
        });
    }
};

export const getUpdateAWB = async (AWBId: number) => {
    const getUpdateAWBRes = await prisma.airWayBill.findMany({
        where: {
          id: AWBId, 
        },
        select: {
          id: true,
          AWBCode: true,
          appointmentDate: true,
          invoiceNumber:true,
          invoiceValue:true,
          ewayBillNumber:true,
          numOfArticles:true,
          consignorId:true,
          consigneeId:true,
          AWBStatus:true,
          articleGenFlag:true,
          AWBLineItems: {
            select: {
              id: true,
              ActualWeightKg: true,
              lengthCms: true,
              breadthCms: true,
              heightCms: true,
              numOfArticles: true,
            },
          },
          consignor: {
            select: {
              publicName: true,
            },
          },
          consignee: {
            select: {
              consigneeName: true,
            },
          },
          fromBranch: {
            select: {
              branchName: true,
            },
          },
          toBranch: {
            select: {
              branchName: true,
            },
          },
        },
      });
      
      return getUpdateAWBRes;
      
};

export const updateAWBLineItem = async (AWBId: number, awbLineItems: AwbLineItem[]) => {
    try {
        const result = await prisma.$transaction(async (prisma) => {
               
                    await prisma.awbLineItem.deleteMany({
                        where: {AWBId:AWBId}
                        
                    });
                    for (const item of awbLineItems) {
                        await prisma.awbLineItem.create({
                            data: {
                                AWBId: AWBId,
                                lineItemDescription: item.lineItemDescription,
                                ActualWeightKg: item.ActualWeightKg,
                                lengthCms: item.lengthCms ?? 0,
                                breadthCms: item.breadthCms ?? 0,
                                heightCms: item.heightCms ?? 0,
                                numOfArticles: item.numOfArticles,
                                volume: (item.lengthCms ?? 0) * (item.breadthCms ?? 0) * (item.heightCms ?? 0)
                        }
                    });
            }


        const aggregateResults = await prisma.awbLineItem.aggregate({
            _sum: {
                volume: true,
                ActualWeightKg: true,
                numOfArticles: true
            },
            where: {
                AWBId: AWBId
            }
        })
        const { volume, ActualWeightKg, numOfArticles } = aggregateResults._sum;
        const updatedAirWayBill = await prisma.airWayBill.update({
            where: {
                id: AWBId
            },
            data: {
                rollupArticleCnt: numOfArticles || 0,
                rollupWeight: ActualWeightKg || 0,
                rollupVolume: volume || 0
            }
        });
        return true;
      });
    }
    catch (error) {
        console.error("Error in updateAWBLineItem", error);
        throw error; 
      
     
  };
}
  
export const updateAWB = async (AWBId: number,consigneeId: number,appointmentDate: Date,invoiceNumber: string,invoiceValue: number,ewayBillNumber: string): Promise<string | boolean> => {
    try {
      const result = await prisma.$transaction(async (prisma) => {
        const AWBRes = await prisma.airWayBill.findMany({
          where: {
            id: AWBId,
          },
        });
  
        if (AWBRes.length === 0) {
          return "NotExists";
        }
  
        await prisma.airWayBill.update({
          where: {
            id: AWBId,
          },
          data: {
            consigneeId: consigneeId,
            appointmentDate: appointmentDate,
            invoiceNumber: invoiceNumber,
            invoiceValue: invoiceValue,
            ewayBillNumber: ewayBillNumber,
          },
        });
        return true;
      });
  
      return result;
    } catch (error) {
      console.error("Error in updateAWB", error);
      throw error; 
    }
  };
  
