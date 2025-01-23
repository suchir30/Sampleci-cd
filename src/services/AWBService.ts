import { ArticleStatus,AwbLineItem,ArticleLogsScanType} from '@prisma/client';
import moment from 'moment';
import prisma from '../client';
import { AWBCreateData } from '../types/awbTypes';
import { float } from 'aws-sdk/clients/cloudfront';


// Helper function to increment alphanumeric code
export function incrementAlphanumericCode(code: string): string {
    let chars = code.split('');
    for (let i = chars.length - 1; i >= 0; i--) {
        if (chars[i] === 'Z') {
            chars[i] = 'A';
        } else {
            chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
            return chars.join('');
        }
    }
    return chars.join('');
}

export const generateBulkAWBForConsignor = async (
    consignorId: number,
    awbData: AWBCreateData[]
): Promise<boolean> => {
    console.log("new service")
    const result = await prisma.$transaction(async prisma => {
        if (!awbData?.length) {
            throw new Error("Create AWB list is empty.");
        }

        // Retrieve the consignor details
        const consignor = await prisma.consignor.findUniqueOrThrow({
            where: { consignorId },
            select: { consignorId: true, consignorCode: true, branchId: true }
        });
        console.log(consignor,"consignorresponse")
        if (consignor.branchId == null) {
            throw new Error(`Consignor ${consignor.consignorCode} does not have a branch assigned.`);
        }

        // Retrieve the latest AWB
        const latestAWB = await prisma.airWayBill.findFirst({
            where: { consignorId },
            orderBy: { id: 'desc' },
            select: { AWBCode: true }
        });
        console.log(latestAWB,"latestAWBREsponse")


        // Set initial alphanumeric and numeric parts
        let alphanumericPart = 'AAA';
        let numericPart = 1;

        if (latestAWB) {
            const lastAlphaCode = latestAWB.AWBCode.slice(-6, -3); // Get the 'AAA' part
            const lastNumCode = parseInt(latestAWB.AWBCode.slice(-3)); // Get the '000' part
            console.log(lastAlphaCode,"lastAlphaCode",lastNumCode,"lastAlphaCode")
            alphanumericPart = lastAlphaCode;
            numericPart = lastNumCode + 1;

            // If numeric part reaches 1000, reset it and increment alphanumeric part
            if (numericPart >= 1000) {
                alphanumericPart = incrementAlphanumericCode(alphanumericPart);
                numericPart = 1;
            }
        }

        // Generate all AWBIds in the dataArray
        for (const data of awbData) {
            data.consignorId = consignor.consignorId;
            data.fromBranchId = consignor.branchId;
            data.AWBCode = `${consignor.consignorCode}${alphanumericPart}${String(numericPart).padStart(3, '0')}`;

            numericPart++;
            // If numeric part reaches 1000, reset and increment alphanumeric part
            if (numericPart >= 1000) {
                alphanumericPart = incrementAlphanumericCode(alphanumericPart);
                numericPart = 0;
            }

            // Validations
            if (data.numOfArticles <= 0) {
                throw new Error(`Found non-positive article count for: consigneeId=${data.consigneeId}, toBranchId=${data.toBranchId}.`);
            }
        }

        // Insert the AWBs in bulk
        await prisma.airWayBill.createMany({
            data: awbData.map(data => ({
                consignorId: data.consignorId,
                consigneeId: data.consigneeId,
                numOfArticles: data.numOfArticles,
                fromBranchId: data.fromBranchId,
                toBranchId: data.toBranchId,
                AWBCode: data.AWBCode,
            })),
        });

        return true;
    });

    return result;
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
            completeFlag:true,
            createdOn:true,
            consignor: {
                select: {
                    consignorCode: true,
                    publicName: true,
                    legalName: true,
                    address1: true,
                    wareHouseId:true,
                    disstrict: {
                        select: {
                            name: true,
                        },
                    },
                    state: {
                        select: {
                            name: true,
                        },
                    },
                    city: {
                        select: {
                            name: true,
                        },
                    }
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
                    branchCode:true,
                }
            },
            toBranch: {
                select: {
                    branchName: true,
                    branchCode:true,
                }
            },
            AWBIdTripLineItems: {
                select: {
                    id: true,
                    tripId: true,
                    unloadLocationId: true,
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
        orderBy: {
            createdOn: 'desc', // Order by createdDate in descending order
        }
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
                            branchName: true,
                            branchCode:true,
                        }
                    },
                    toBranch: {
                        select: {
                            branchName: true,
                            branchCode:true,
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
        const genFlagUpdate = await prisma.airWayBill.update({
            where: {
              id: AWBId,
            },
            data: {
              articleGenFlag:true,
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
        const count = await prisma.awbArticle.count({
            where: {
              AWBId: AWBId,
              status: {
                in: ['Created', 'Printed'], // Include only 'created' and 'printed' statuses
            },
        },
          });
        if (numArticlesToAdd <= 0) {
            throw Error(`Article count should be positive. Got ${numArticlesToAdd}`);
        } else if (lastArticle === null) {
            throw Error(`Add AWB articles is only allowed if some articles have already been generated for AWB=${AWBId}`);
        } else if (count !== awb.numOfArticles) {
            throw Error(`Data integrity check failed. AWB->numOfArticles=${awb.numOfArticles} is not equal to latest No.of articleIndex count=${count}.`);
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

    let checkstatus= await prisma.awbArticle.findFirst({
        where: {
            id:articleId
        },
    });
    if(checkstatus?.status=="Deleted"){
        console.log("no action status is already deleted")
        return
    }
    await prisma.awbArticle.update({
        where: { id: articleId},
        data: {
            status: ArticleStatus.Deleted,
        }
    });

    const notDeletedArticleCount = await prisma.awbArticle.count({
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
            numOfArticles: notDeletedArticleCount,
        }
    });

    
    let awbarticletriplogsRes=await prisma.awbArticleTripLogs.findFirst({
        where: { AWBArticleId:articleId }
    });
    console.log("awbarticletriplogsRes",awbarticletriplogsRes)
    
    if(awbarticletriplogsRes?.id && awbarticletriplogsRes.tripLineItemId){
        
        await prisma.awbArticleTripLogs.update({
            where: { id: awbarticletriplogsRes.id},
            data: {
                scanType: ArticleLogsScanType.Deleted,
            }
        });
        await prisma.tripLineItem.update({
            where: { id: awbarticletriplogsRes.tripLineItemId},
            data: {
                rollupScanCount: {
                    decrement: 1,
                     // Decrement rollupScanCount by 1    
                     // logs :-       total 43 ,     21 deleted,    22 load    - triplineitem 3869 
                     // awbarticle :- total 64,      42 deleted,    22 created - awbid 6683
                }
            }
        });
    }
    else{
        console.log("in else")
    }
    return notDeletedArticleCount;
};

export const assignedTriptoAWB = async (AWBId:number,tripId:number,finalDestinationId:number,status:string,loadLocationId:number) => {
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
                finalDestinationId: finalDestinationId,
                loadLocationId:loadLocationId
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
                finalDestinationId: finalDestinationId,
                loadLocationId:loadLocationId
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
          fromBranchId:true,
          toBranchId:true,
          AWBCDM:true,
          AWBWeight:true,
          AWBChargedWeight:true,
          AWBLineItems: {
            select: {
                id: true,
                lineItemDescription: true,
                articleWeight: true,
                lengthCms: true,
                breadthCms: true,
                heightCms: true,
                numOfArticles: true,
                SKUCode:true,
                boxType:true,
                SKUId:true,
                ratePerBox:true
            }
          },
          consignor: {
            select: {
              publicName: true,
              contractConsignorIds:{
                select:{
                    consignorPricingModel:true,
                    AWBLineItemLBHAccess:true,
                    AWBLineItemArticleWeightAccess:true,
                    AWBChargedWeightAccess:true,
                    AWBCDMAccess:true,
                    AWBWeightAccess:true,
                    chargedWeightCeilingFactor:true
                }
              }
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
              branchCode:true,
            },
          },
          toBranch: {
            select: {
              branchName: true,
              branchCode:true,
            },
          },
        },
      });

      return getUpdateAWBRes;

};

export const updateAWBLineItem = async (AWBId: number, awbLineItems: AwbLineItem[]) => {
    try {
        const result = await prisma.$transaction(async (prisma) => {
            const AWBConsignorId = await prisma.airWayBill.findUnique({
                where: { id: AWBId }
            });
            if (!AWBConsignorId) {
                console.log("AWB not found");
                return "Invalid AWB";
            }

            await prisma.awbLineItem.deleteMany({
                where: { AWBId: AWBId }
            });

            if(awbLineItems.length==0){
                await prisma.airWayBill.updateMany({
                    where: { id: AWBId },
                    data: {
                      rollupArticleCnt:null, 
                      AWBWeight:null,
                      rollupWeight:null,
                      rollupVolume:null,
                      rollupPresetChargedWeight:null,
                      AWBCDM:null,
                      AWBChargedWeight:null,
                      rollupChargedWeight:null,
                      AWBChargedWeightWithCeiling:null,
                      completeFlag:false
                    }
                })
                return
            }


            const factorRes = await prisma.contract.findFirst({
                where: { consignorId: AWBConsignorId.consignorId }
            });

            console.log(factorRes,"factorRes")
            if (factorRes?.consignorPricingModel == "BoxRate") {
                console.log("boxrate")
                const createPromises = awbLineItems.map(item => {
                    return prisma.awbLineItem.create({
                        data: {
                            AWBId: AWBId,
                            lineItemDescription: item.lineItemDescription,
                            numOfArticles: item.numOfArticles,
                            boxType:item.boxType,
                            ratePerBox:item.ratePerBox,
                         // actualFactorWeight: (item.numOfArticles ?? 0) * (item.ratePerBox ?? 0),
                         // volumetricFactorWeight:0
                        }
                    });
                });

            await Promise.all(createPromises);
            }
            else{
                // console.log("in else actual volume")

                // if (factorRes?.actualWeightFactor == null || factorRes?.volumetricWeightFactor == null || factorRes?.chargedWeightCeilingFactor==null) {
                //     console.log("Invalid factors", factorRes);
                //     return "Invalid factors";
                // }

                const createPromises = awbLineItems.map(item => {
                    const calculatedLineItemWeight = item.numOfArticles * Math.max(item.articleWeight || 0, item.minimumArticleWeight || 0);
                    const computedVolume = (item.lengthCms || 0) * (item.breadthCms || 0) * (item.heightCms || 0);
                    const calculatedLineItemVolume = item.numOfArticles * Math.max(item.articleVolume || 0, item.minimumArticleVolume || 0, computedVolume ||0);
                    const calculatedLineItemPresetChargedWeight = item.numOfArticles * (item.articlePresetChargedWeight ||  0);
                    let calculatedLineItemChargedWeight

                 

                    if(item.articlePresetChargedWeight!==undefined && item.articlePresetChargedWeight!==0 && item.articlePresetChargedWeight!==null){
                        console.log("calculatedLineItemChargedWeight - IF")
                        calculatedLineItemChargedWeight=calculatedLineItemPresetChargedWeight
                        // calculatedLineItemChargedWeight=item.articlePresetChargedWeight
                    }
                    else{
                        console.log("calculatedLineItemChargedWeight - else")
                        calculatedLineItemChargedWeight=Math.max(((calculatedLineItemWeight) *(item.articleWeightFactor ||0)),((calculatedLineItemVolume)*(item.articleVolumeFactor||0)))
                    }
                    console.log(item.articlePresetChargedWeight,
                        "calculatedLineItemWeight",calculatedLineItemWeight,
                        "computedVolume",computedVolume,
                        "calculatedLineItemVolume",calculatedLineItemVolume,
                        "calculatedLineItemPresetChargedWeight",calculatedLineItemPresetChargedWeight,
                        "calculatedLineItemChargedWeight",calculatedLineItemChargedWeight)

                    return prisma.awbLineItem.create({
                        data: {
                            AWBId: AWBId,
                            lineItemDescription: item.lineItemDescription,
                            lengthCms: item.lengthCms ?? 0,
                            breadthCms: item.breadthCms ?? 0,
                            heightCms: item.heightCms ?? 0,
                            numOfArticles: item.numOfArticles,
                            articleWeight: item.articleWeight,
                            articleVolume:item.articleVolume,
                            articlePresetChargedWeight:item.articlePresetChargedWeight,
                            articleWeightFactor:item.articleWeightFactor,
                            articleVolumeFactor:item.articleVolumeFactor,
                            minimumArticleWeight:item.minimumArticleWeight,
                            minimumArticleVolume:item.minimumArticleVolume,
                            lineItemWeight:calculatedLineItemWeight,
                            lineItemVolume:calculatedLineItemVolume,
                            lineItemPresetChargedWeight:calculatedLineItemPresetChargedWeight,
                            lineItemChargedWeight:calculatedLineItemChargedWeight,
                             // lineItemWeight: (item.numOfArticles ?? 0) * (item.articleWeight ?? 0),
                             //  articleVolume: ((item.lengthCms ?? 0) * (item.breadthCms ?? 0) * (item.heightCms ?? 0)) * (item.numOfArticles ?? 0),
                             // articleWeightFactor: (item.numOfArticles ?? 0) * (item.articleWeight ?? 0) * (factorRes.actualWeightFactor!),
                             // articleVolumeFactor: (item.numOfArticles ?? 0) * (item.articleWeight ?? 0) * (factorRes.volumetricWeightFactor!),
                            SKUId: item.SKUId,
                            SKUCode: item.SKUCode
                        }
                    });
                });

            await Promise.all(createPromises);
            }

            const aggregateResults = await prisma.awbLineItem.aggregate({
                _sum: {
                    articleWeight: true,
                    articleVolume: true,
                    numOfArticles: true,
                    lineItemWeight:true,
                    lineItemVolume:true,
                    articleWeightFactor:true,
                    articleVolumeFactor:true,
                    lineItemPresetChargedWeight:true,
                    lineItemChargedWeight:true,
                },
                where: {
                    AWBId: AWBId
                }
            });
            console.log(aggregateResults,"aggregateResults111111111111111111111111111111111111111111")
            const { numOfArticles,articleWeight,articleVolume,lineItemWeight,lineItemVolume,lineItemPresetChargedWeight,lineItemChargedWeight,articleWeightFactor,articleVolumeFactor} = aggregateResults._sum;

            // const awbLineItemsList = await prisma.awbLineItem.findMany({
            //     where: { AWBId: AWBId },
            //     select: {
            //         articleWeightFactor: true,
            //         articleVolumeFactor: true
            //     }
            // });

            // const AWBChargedWeight = awbLineItemsList.reduce((acc, item) => {
            //     const maxWeight = Math.max(item.actualFactorWeight ?? 0, item.volumetricFactorWeight ?? 0);
            //     return acc + maxWeight;
            // }, 0);

               // Sum of all actualFactorWeight values
            // const totalActualFactorWeight = awbLineItemsList.reduce((acc, item) => {
            //     return acc + (item.articleWeightFactor ?? 0);
            // }, 0);
            // // Sum of all volumetricFactorWeight values
            // const totalVolumetricFactorWeight = awbLineItemsList.reduce((acc, item) => {
            //     return acc + (item.articleVolumeFactor ?? 0);
            // }, 0);
            // // Determine AWBChargedWeight as the maximum of the two sums
            // const AWBChargedWeight = Math.max(totalActualFactorWeight, totalVolumetricFactorWeight);

      
            let CalAWBChargedWeight;
            if(lineItemChargedWeight!=0 || lineItemChargedWeight!=null){
                CalAWBChargedWeight=lineItemChargedWeight
            }
            else{
                if(lineItemPresetChargedWeight!=0 || lineItemPresetChargedWeight!=null){
                    CalAWBChargedWeight=lineItemChargedWeight
                }
                else{
                    const calWeightFactor=(lineItemWeight || 0) * (articleWeightFactor || 0)
                    const calVolumeFactor=(lineItemVolume||0) * (articleVolumeFactor || 0)
                    CalAWBChargedWeight=Math.max(calWeightFactor,calVolumeFactor);

 
                }
            }

            // rollupChargedWtCeiling logic
            // if(!CalAWBChargedWeight){
            //     console.log("dongaaaaaaaaaaaaa")
            //     return
            // }
            const rollupChargedWtCeiling = Math.ceil(CalAWBChargedWeight??0 / (factorRes?.chargedWeightCeilingFactor??0)) * (factorRes?.chargedWeightCeilingFactor??0);
                //   console.log(`AWBChargedWeight: ${AWBChargedWeight}, rollupChargedWtCeiling: ${rollupChargedWtCeiling}`);
      
      
            const updatedAirWayBill = await prisma.airWayBill.update({
                where: {
                    id: AWBId
                },
                data: {
                    rollupArticleCnt: numOfArticles || null,
                    rollupWeight: lineItemWeight|| null,
                    rollupVolume: lineItemVolume || null,
                    rollupPresetChargedWeight:lineItemPresetChargedWeight||null,
                    AWBWeight:lineItemWeight || null,
                    AWBCDM: (lineItemVolume ?? 0) / 1000,
                    AWBChargedWeight:CalAWBChargedWeight||null,
                    rollupChargedWeight:CalAWBChargedWeight||null,
                    // AWBChargedWeight: AWBChargedWeight || 0,
                    // rollupChargedWeight:AWBChargedWeight || 0,
                    AWBChargedWeightWithCeiling: rollupChargedWtCeiling || null
                }
            });


            return updatedAirWayBill;
        });
        await checkAWBComplete(AWBId)
        return result;
    } catch (error) {
        console.error("Error in updateAWBLineItem", error);
        throw error;
    }
};

export const updateAWB = async (AWBId: number,consigneeId: number, appointmentDate: Date | undefined,invoiceNumber: string,invoiceValue: number,ewayBillNumber: string,AWBCDM:any,AWBChargedWeight:float,AWBWeight:float): Promise<string | boolean> => {
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
            appointmentDate: appointmentDate|| null,
            invoiceNumber: invoiceNumber,
            invoiceValue: invoiceValue,
            ewayBillNumber: ewayBillNumber,
            AWBCDM:AWBCDM,
            AWBChargedWeight:AWBChargedWeight,
            AWBWeight:AWBWeight
          },
        });
        return true;
      });

      await checkAWBComplete(AWBId)
      return result;
    } catch (error) {
      console.error("Error in updateAWB", error);
      throw error;
    }
};

export const checkAWBComplete = async (AWBId: number) => {
    const AWBDetails = await prisma.airWayBill.findFirst({
        where: {
            id: AWBId,
        }
    });

    console.log(AWBDetails?.consignorId, "AWB DETAILS");

    if (!AWBDetails) {
        console.log("AWB details not found");
        return;
    }

    const contractTypeDetails = await prisma.contract.findFirst({
        where: {
            consignorId: AWBDetails.consignorId,
        }
    });

    console.log(contractTypeDetails?.consignorPricingModel, "contractTypeDetails");

    if (!contractTypeDetails) {
        console.log("Contract details not found");
        return;
    }

    let isComplete = false;

    if (contractTypeDetails.consignorPricingModel === "BoxRate") {
        if (
            AWBDetails.AWBCDM &&
            AWBDetails.numOfArticles === AWBDetails.rollupArticleCnt &&
            AWBDetails.invoiceNumber &&
            AWBDetails.invoiceValue
        ) {
            isComplete = true;
        }
    } else {
        if (
            AWBDetails.AWBChargedWeight &&
            AWBDetails.numOfArticles === AWBDetails.rollupArticleCnt &&
            AWBDetails.invoiceNumber &&
            AWBDetails.invoiceValue
        ) {
            isComplete = true;
        }
    }
console.log(isComplete,"iscomplete")
    if (isComplete) {
        await prisma.airWayBill.update({
            where: { id: AWBId },
            data: { completeFlag: true },
        });
        console.log("completeFlag updated to true");
    } else {
        console.log("completeFlag not updated");
    }

    return AWBDetails;
};

export const getAwbPdfData = async (AWBId: number) => {
    const result = await prisma.airWayBill.findUnique({
        where: {
            id: AWBId
        },
        select: {
            id: true,
            AWBCode: true,
            consignorId: true,
            consigneeId: true,
            invoiceNumber: true,
            invoiceValue: true,
            createdOn: true,
            AWBChargedWeight:true,
            AWBWeight:true,
            ewayBillNumber:true,
            ratePerKg:true,
            rollupVolume:true,
            rollupWeight:true,
            rollupArticleCnt:true,
            numOfArticles:true,
            fromBranchId:true,
            toBranchId:true,
            fromBranch: {
                select: {
                    branchName: true,
                    branchCode: true,
                }
            },
            toBranch: {
                select: {
                    branchName: true,
                    branchCode: true,
                }
            },
            consignor: {
                select: {
                    consignorCode: true,
                    publicName: true,
                    legalName: true,
                    gstNumber: true,
                    address1: true,
                    address2: true,
                }
            },
            consignee: {
                select: {
                    consigneeCode: true,
                    consigneeName: true,
                    phone1: true,
                    phone2: true,
                    email: true,
                    address1: true,
                    address2: true,
                }
            },
            AWBLineItems: {
                select: {
                    lineItemDescription: true,
                    lengthCms: true,
                    breadthCms: true,
                    heightCms: true,
                    numOfArticles: true,
                    articleWeight: true,
                    // chargedWeight: true,
                    articleVolume: true
                }
            }
        }
    });
    return result;
};

export const awbEntry = async (AWBId: number, fileId: number) => {
    const result = await prisma.airWayBill.update({ where: { id: AWBId }, data: { AWBPdf: fileId }, });
    return;
};


export const getSKUs = async (consignorId: number) => {
    const SKUDetails = await prisma.sKU.findMany({
      where: {
        consignorId: consignorId,
      }
    });
    return SKUDetails;

  };

export const getBoxTypes = async (consignorId: number) => {
    const results = await prisma.consignorRateTable.findMany({
      where: {
        consignorId: consignorId,  boxType: {
        not: null,
      },
      },
      distinct: ['boxType'],
      select:{
        boxType:true,
        ratePerBox:true
      }
    });

   return results;
};
