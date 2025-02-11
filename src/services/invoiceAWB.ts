import prisma from '../client';
import moment from 'moment';
interface AWBLineItem {
    id: number;
    ratePerBox: number | null;
    boxType: string | null;
    numOfArticles: number;
  }

export const calculateShippingCosts = async (AWBIds: number[]) => {
  try {
    const AWBs = await prisma.airWayBill.findMany({
      where: {
        id: { in: AWBIds },
      },
      select: {
        id: true,
        consignorId: true,
        consigneeId: true,
        AWBChargedWeight: true,
        toBranchId: true,
        AWBChargedWeightWithCeiling: true,
        invoiceValue:true,
        numOfArticles:true,
        setDetentionCharges:true,
        consignee:{
          select:{
            consigneeId:true,
            modernTradeConsignee:true
          }
        }
      },
    });
    console.log(AWBs, "@@@@@@@@@@@@@@@@@@@@@@ AWB DATA");

    if (AWBs.length === 0) return "NoAWBs";
    const missingAWBIds = AWBIds.filter((AWBId) => !AWBs.some((awb) => awb.id === AWBId));
    if (missingAWBIds.length > 0) {
      console.log(`AWBs not found: ${missingAWBIds.join(", ")}`);
      return "NoAWBs"
    }

    
    // Loop through each AWB
    for (const AWB of AWBs) {
      // if (!AWB.consigneeId) return "AWBInvalidConsigneeId";
      // if (!AWB.AWBChargedWeightWithCeiling) return "AWBInvalidCeilingCW";

      const contractRes = await prisma.contract.findFirst({
        where: { consignorId: AWB.consignorId },
        select: {
          id: true,
          consignorPricingModel: true,
          baseChargeChargedWeightRange: true,
          ODAChargedWeightRange: true,
          docketCharge:true,
          FOVFixedValue:true,
          FOVPercentage:true,
          articleCharge:true,
          doorBookingCharge:true,
          doorBookingWeight:true,
          modernTradeFixedValue:true,
          modernTradeRatePerKg:true,
          loadUnloadCharge:true,
          detentionCharge:true,
          fuelSurchargePercentage:true,
        },
      });

      // if (!contractRes || !contractRes.baseChargeChargedWeightRange || !contractRes.ODAChargedWeightRange) return 'NoContract';

      const { baseChargeChargedWeightRange, consignorPricingModel, ODAChargedWeightRange,docketCharge,FOVFixedValue,FOVPercentage,articleCharge,modernTradeFixedValue,
        modernTradeRatePerKg,loadUnloadCharge,detentionCharge,fuelSurchargePercentage
       } = contractRes|| {};

      console.log(consignorPricingModel,"1pppppppppppppppppppppppppppppppp")
      const FOVCalculation = Math.max(FOVFixedValue??0, (FOVPercentage??0 * (AWB.invoiceValue??0)));
      
      let modernTradeChargeCalculation: number | null = null;
      if(AWB.consignee?.modernTradeConsignee==true){
        modernTradeChargeCalculation=Math.max(modernTradeFixedValue??0, (modernTradeRatePerKg??0 * (AWB?.AWBChargedWeightWithCeiling??0)))
      }      
      let detentionChargeCalculation: number | null = null;
      if(AWB.setDetentionCharges==true){
        detentionChargeCalculation=detentionCharge??0
      }

      if (consignorPricingModel === "BoxRate") {
        console.log("innnnnnnn box type");

        const awbLineItemRes = await prisma.awbLineItem.findMany({
          where: { AWBId: AWB.id },
          select: {
            id: true,
            numOfArticles: true,
            boxType: true,
            ratePerBox: true,
          },
        });

        // if (awbLineItemRes.length === 0 || !AWB.AWBChargedWeightWithCeiling) return "noAWBLineItem";

        const baseChargeCalcRes = await baseChargeCalculation(AWB.id, AWB.consignorId, AWB.toBranchId, AWB.AWBChargedWeightWithCeiling??0, baseChargeChargedWeightRange??false, awbLineItemRes, consignorPricingModel);
        
        if (typeof baseChargeCalcRes === 'object' && baseChargeCalcRes !== null) {
          const { internalInvoiceData, totalBaseCharge } = baseChargeCalcRes;

          const ODACharges = await Promise.all(
            awbLineItemRes.map(async (lineItem) => {
              return {
                AWBLineItemId: lineItem.id,
                ODACharge: await odaChargeCalculation(AWB.id, AWB.consignorId, AWB.consigneeId ?? 0, AWB.AWBChargedWeightWithCeiling ?? 0, ODAChargedWeightRange??false, [lineItem], consignorPricingModel),
              };
            })
          );
          console.log(ODACharges, "Individual ODA Charges");

          // Perform delete and create in a single transaction
          await prisma.$transaction(async (tx) => {
            // Step 1: Delete related records in InternalInvoiceLineItems
            await tx.internalInvoiceLineItems.deleteMany({
              where: {
                internalInvoiceId: {
                  in: (await tx.internalInvoice.findMany({
                    where: { AWBId: AWB.id },
                    select: { id: true },
                  })).map(inv => inv.id),
                },
              },
            });

            // // Step 2: Delete InternalInvoice(s)
            // await tx.internalInvoice.deleteMany({
            //   where: { AWBId: AWB.id },
            // });

            // Create a new internal invoice
            console.log(totalBaseCharge,ODACharges,"PPPPPPPPPPPPPPPPPPPPPPPPPPPPPP")
            if (totalBaseCharge !== undefined && ODACharges !== undefined) {
                // Step 2: Check if an internal invoice exists
                const existingInvoice = await tx.internalInvoice.findFirst({
                  where: { AWBId: AWB.id },
                });

                let internalInvoice:any;
                if (existingInvoice) {
                  // Update the existing internal invoice
                  internalInvoice = await tx.internalInvoice.update({
                    where: { id: existingInvoice.id },
                    data: {
                      baseCharge: totalBaseCharge,
                      consignorId: AWB.consignorId,
                      consigneeId: AWB.consigneeId ?? 0,
                      contractId: contractRes?.id ?? null,
                      ODACharge: ODACharges.reduce((sum, item) => sum + (item.ODACharge ?? 0), 0),
                      docketCharge: docketCharge ?? null,
                      FOV: FOVCalculation ?? null,
                      articleCharge: AWB?.numOfArticles ?? null,
                      modernTradeCharge: modernTradeChargeCalculation ?? null,
                      loadUnloadCharge: AWB.numOfArticles * (loadUnloadCharge ?? 0),
                      detentionCharge: detentionChargeCalculation ?? null,
                      fuelSurcharge: (totalBaseCharge + ODACharges.reduce((sum, item) => sum + (item.ODACharge ?? 0), 0)) * (fuelSurchargePercentage ?? 0),
                    },
                  });
            
                  console.log(`Updated existing internal invoice with ID: ${internalInvoice.id}`);
                } else {
                  // Create a new internal invoice
                  internalInvoice = await tx.internalInvoice.create({
                    data: {
                      AWBId: AWB.id,
                      baseCharge: totalBaseCharge,
                      consignorId: AWB.consignorId,
                      consigneeId: AWB.consigneeId ?? 0,
                      contractId: contractRes?.id ?? null,
                      ODACharge: ODACharges.reduce((sum, item) => sum + (item.ODACharge ?? 0), 0),
                      docketCharge: docketCharge ?? null,
                      FOV: FOVCalculation ?? null,
                      articleCharge: AWB?.numOfArticles ?? null,
                      modernTradeCharge: modernTradeChargeCalculation ?? null,
                      loadUnloadCharge: AWB.numOfArticles * (loadUnloadCharge ?? 0),
                      detentionCharge: detentionChargeCalculation ?? null,
                      fuelSurcharge: (totalBaseCharge + ODACharges.reduce((sum, item) => sum + (item.ODACharge ?? 0), 0)) * (fuelSurchargePercentage ?? 0),
                    },
                  });
            
                  console.log(`Created new internal invoice with ID: ${internalInvoice.id}`);
                }
            
                // Create new InternalInvoiceLineItems
                await tx.internalInvoiceLineItems.createMany({
                  data: internalInvoiceData.map(item => {
                    const ODAChargeItem = ODACharges.find(oda => oda.AWBLineItemId === item.AWBLineItemId);
                    return {
                      AWBLineItemId: item.AWBLineItemId,
                      internalInvoiceId: internalInvoice.id,
                      baseCharge: item.baseCharge,
                      ODACharge: ODAChargeItem ? ODAChargeItem.ODACharge ?? 0 : 0,
                    };
                  }),
                });
              }
            });
        }
      } 
      else {
        // Handle non-box rate calculations
        const baseChargeRes = await baseChargeCalculation(AWB.id, AWB.consignorId, AWB.toBranchId, AWB.AWBChargedWeightWithCeiling??0, baseChargeChargedWeightRange??false, [], consignorPricingModel ?? "");
        const ODAChargeRes = await odaChargeCalculation(AWB.id, AWB.consignorId, AWB.consigneeId??0, AWB.AWBChargedWeightWithCeiling??0, ODAChargedWeightRange??false, [], consignorPricingModel ?? "");

        // Perform delete and create in a single transaction
        if (typeof baseChargeRes === 'number' && baseChargeRes !== null && baseChargeRes !== undefined && ODAChargeRes !== undefined) {
          await prisma.$transaction(async (tx) => {
            // Step 1: Delete related records in InternalInvoiceLineItems
            await tx.internalInvoiceLineItems.deleteMany({
              where: {
                internalInvoiceId: {
                  in: (await tx.internalInvoice.findMany({
                    where: { AWBId: AWB.id },
                    select: { id: true },
                  })).map(inv => inv.id),
                },
              },
            });

            // // Step 2: Delete InternalInvoice(s)
            // await tx.internalInvoice.deleteMany({
            //   where: { AWBId: AWB.id },
            // });
            const existingInvoice = await tx.internalInvoice.findFirst({
              where: { AWBId: AWB.id },
            });
        
            if (existingInvoice) {
              // Update the existing internal invoice
              await tx.internalInvoice.update({
                where: { id: existingInvoice.id },
                data: {
                  baseCharge: baseChargeRes,
                  ODACharge: ODAChargeRes,
                  consignor: AWB.consignorId ? { connect: { consignorId: AWB.consignorId } } : undefined,
                  consignee: AWB.consigneeId ? { connect: { consigneeId: AWB.consigneeId } } : undefined,
                  contract: contractRes?.id ? { connect: { id: contractRes.id } } : undefined,
                  docketCharge: docketCharge ?? null,
                  FOV: FOVCalculation ?? null,
                  articleCharge: AWB?.numOfArticles ?? null,
                  modernTradeCharge: modernTradeChargeCalculation ?? null,
                  loadUnloadCharge: AWB.numOfArticles * (loadUnloadCharge ?? 0),
                  detentionCharge: detentionChargeCalculation ?? null,
                  fuelSurcharge: ((baseChargeRes ?? 0) + (ODAChargeRes ?? 0)) * (fuelSurchargePercentage ?? 0),
                },
              });
        
              console.log(`Updated existing internal invoice with ID: ${existingInvoice.id}`);
            } else {
              // Create a new internal invoice
              const internalInvoice = await tx.internalInvoice.create({
                data: {
                  baseCharge: baseChargeRes,
                  ODACharge: ODAChargeRes,
                  AirWayBill: { connect: { id: AWB.id } },
                  consignor: AWB.consignorId ? { connect: { consignorId: AWB.consignorId } } : undefined,
                  consignee: AWB.consigneeId ? { connect: { consigneeId: AWB.consigneeId } } : undefined,
                  contract: contractRes?.id ? { connect: { id: contractRes.id } } : undefined,
                  docketCharge: docketCharge ?? null,
                  FOV: FOVCalculation ?? null,
                  articleCharge: AWB?.numOfArticles ?? null,
                  modernTradeCharge: modernTradeChargeCalculation ?? null,
                  loadUnloadCharge: AWB.numOfArticles * (loadUnloadCharge ?? 0),
                  detentionCharge: detentionChargeCalculation ?? null,
                  fuelSurcharge: ((baseChargeRes ?? 0) + (ODAChargeRes ?? 0)) * (fuelSurchargePercentage ?? 0),
                },
              });
        
              console.log(`Created new internal invoice with ID: ${internalInvoice.id}`);
            }
          });
        }
      }
    }
    return "Success";
  } catch (error) {
    console.error("Error calculating shipping costs:", error);
    throw new Error("Failed to calculate shipping costs");
  }
};

export const baseChargeCalculation = async (AWBId: number, consignorId: number, AWBToBranch: number, AWBChargedWeightWithCeiling: number, baseChargeChargedWeightRange: boolean, awbLineItemRes:AWBLineItem[], consignorPricingModel: string) => {
  let baseCharge;
  let applicableRange;

  const consignorRateTableRes = await prisma.consignorRateTable.findMany({
    where: {
      consignorId:consignorId,
      branchId: AWBToBranch,
    },
    select: {
      id: true,
      ratePerKg: true,
      ratePerBox: true,
      chargedWeightHigher: true,
      chargedWeightLower: true,
    },
  });
  // if(consignorRateTableRes.length>0){
    // console.log(consignorRateTableRes, "consignorRateTableRes",consignorPricingModel,baseChargeChargedWeightRange);
  if (consignorPricingModel === "BoxRate") {

    // if (baseChargeChargedWeightRange === true) {
      console.log(awbLineItemRes, "awblineitems");
      let totalBaseCharge = 0;
      const internalInvoiceData = awbLineItemRes.map(({ id, numOfArticles, ratePerBox }) => {
        const baseChargeForItem = numOfArticles * (ratePerBox??0);
        totalBaseCharge += baseChargeForItem; // Accumulate total base charge
        return {
          AWBLineItemId: id,
          baseCharge: baseChargeForItem,
        };
      });
      console.log("Prepared data for bulk insertion:", internalInvoiceData, totalBaseCharge);
      return { internalInvoiceData, totalBaseCharge };
    // }
  } else {
    console.log("innnnnnnnnnnnnnnnnnnnnnnnn other than boxrate");
    if (baseChargeChargedWeightRange === true) {
      console.log("in withCharge otherthanboxRate:- baseCharge", consignorRateTableRes);
      applicableRange = consignorRateTableRes.find((range) => {
        console.log(`Checking range: ${range.chargedWeightLower} - ${range.chargedWeightHigher}`);
        return AWBChargedWeightWithCeiling >= (range.chargedWeightLower || 0) &&
        AWBChargedWeightWithCeiling <= (range.chargedWeightHigher || 0);
      });
      if(applicableRange && applicableRange.ratePerKg){
        console.log("Applicable Range:", applicableRange);
        baseCharge = AWBChargedWeightWithCeiling * applicableRange.ratePerKg;
        console.log(AWBChargedWeightWithCeiling, applicableRange.ratePerKg);
        return baseCharge;
      }
      else{
        return null;
        // throw new Error('No applicable range found for the charged weight.');
      }
    }
    if (baseChargeChargedWeightRange === false) {
      console.log("innnnnnnnnnnnnnnnnnnnnnnnn false   basechargee");
      // console.log(consignorRateTableRes[0].ratePerKg,"***************")
      //   if(consignorRateTableRes[0].ratePerKg){
          
            // console.log("in withoutCharge otherthanboxRate:- baseCharge", AWBChargedWeightWithCeiling, consignorRateTableRes[0].ratePerKg);
            baseCharge = AWBChargedWeightWithCeiling * (consignorRateTableRes[0]?.ratePerKg || 0);
            console.log("innnnnnnnnnnnnnnnnnnnnnnnn false   ifcondition basecahrge ",baseCharge);
            return baseCharge;
        // }
        // else{
        //   return null;
        //     // throw new Error('RatePerKg is missing in Consignor Model.');
        // }
    }
  }
  // }
  // else{
  //   throw new Error('No consignorRateTable response.');
  // }
  
};

export const odaChargeCalculation=async(AWBId: number, consignorId: number,consigneeId: number,AWBChargedWeightWithCeiling: number,ODAChargedWeightRange: boolean,awbLineItemRes:AWBLineItem[],consignorPricingModel: string)=>{
  let ODACharge;
  let applicableRange;
  const odaResponse = await prisma.oDA.findMany({
    where: {
      consignorId:consignorId
    }
  });
  const consigneeResponse = await prisma.consignee.findUnique({
    where: {
      consigneeId:consigneeId, 
    },
    select: {
      distanceToBranchKms: true,
    },
  });
  // if(!consigneeResponse?.distanceToBranchKms)
  //   {
  //       throw new Error('DistanceToBranchKms in consignee not exists.');
  //   }
    let distance=consigneeResponse?.distanceToBranchKms ?? 0
    if (consignorPricingModel === "BoxRate") { 
    console.log(consignorPricingModel, "oda charge type boxtype innnn");
    // Log the distance for verification
    console.log("Distance to Branch (km):", distance);
    applicableRange = odaResponse.find((range) => 
      distance >= (range.kmStartingRange??0) && distance <= (range.kmEndingRange??Number.MAX_VALUE)
    );
    // Log the applicable range details
    if (applicableRange) {
      console.log("Applicable ODA Range:", applicableRange);
      console.log("ODA calculation innn applicable Range$$$");
      let totalODACharge = 0;
      for (const lineItem of awbLineItemRes) {
        const { boxType, numOfArticles } = lineItem;
      
        // Find matching ODA rate for the box type
        
          const odaBoxRate = odaResponse.find((oda) => oda.ODABoxType === boxType);
    
        // if (odaBoxRate) {
          // Check if the distance falls within the km range of the found ODA rate
          const isDistanceApplicable = distance >= (odaBoxRate?.kmStartingRange??0) && distance <= (odaBoxRate?.kmEndingRange??0);
      
          // if (isDistanceApplicable) {
            console.log("Found applicable ODA Box Rate:", odaBoxRate);
      
            const ratePerBox = odaBoxRate?.ODARatePerBox ?? 0;
            const minimumCharge = odaBoxRate?.minimumCharge ?? 0;
      
            // Calculate charge for the current box type
            const chargeForBox = Math.max(minimumCharge, ratePerBox * numOfArticles);
            totalODACharge += chargeForBox;
      
            // Log charge for the current box type
            console.log(`Charge for ${numOfArticles} articles of box type ${boxType}:`, chargeForBox);
          // } else {
            // console.log(`Box type ${boxType} is not applicable due to distance. Skipping charge calculation.`);
          // }
        // } else {
          // console.log(`No ODA Box Rate found for box type: ${boxType}`);
        // }
      }
  
      ODACharge = totalODACharge;
      console.log("Total ODA Charge:", ODACharge);
      return ODACharge;
    } else {
      console.log("No applicable range found for the distance:", distance);
      return 0; // Or handle as needed
    }

  }
  else{
    if(ODAChargedWeightRange==true){
      applicableRange = odaResponse.find(range =>
        distance >= (range.kmStartingRange || 0) &&
        distance <= (range.kmEndingRange || 0) &&
        AWBChargedWeightWithCeiling >= (range.chargedWeightLower || 0) &&
        AWBChargedWeightWithCeiling <= (range.chargedWeightHigher || Number.MAX_VALUE)
      );
      if (applicableRange) {
        const ODARatePerKg = applicableRange.ODARatePerKg ?? 0;
        const minimumCharge = applicableRange.minimumCharge ?? 0;
        const ODACalculation = ODARatePerKg * AWBChargedWeightWithCeiling;
        ODACharge = Math.max(minimumCharge, ODACalculation);
        console.log(minimumCharge, ODACalculation, ODACharge);
        return ODACharge
      }
      else{
        return null
      }
    }
    if(ODAChargedWeightRange==false){
      applicableRange = odaResponse.find(range =>
        distance >= (range.kmStartingRange || 0) &&
        distance <= (range.kmEndingRange || 0)
      );
      if (applicableRange) {
        const ODARatePerKg = applicableRange.ODARatePerKg ?? 0;
        const minimumCharge = applicableRange.minimumCharge ?? 0;
        const ODACalculation = ODARatePerKg * AWBChargedWeightWithCeiling;
        ODACharge = Math.max(minimumCharge, ODACalculation);
        console.log(minimumCharge, ODARatePerKg,AWBChargedWeightWithCeiling,ODACalculation);
        return ODACharge
      }
      else{
        return null
      }
    }
    
  }
}

export const doorBookingCharge = async () => {
  const yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const yesterdayAWBs  = await prisma.airWayBill.findMany({
    where: {
      createdOn: {
        gte: new Date(`${yesterdayDate}T00:00:00`),
        lte: new Date(`${yesterdayDate}T23:59:59`),
      },
    },
    select: { id: true,
      consignorId:true,
      AWBChargedWeightWithCeiling:true,
     },
  });

  if (yesterdayAWBs.length === 0) {
    console.log("No AWBs found for yesterday.");
    return;
  }
  const awbIds = yesterdayAWBs .map(awb => awb.id);
  // Count how many AWBs already exist in internalInvoice
  const existingInternalInvoices = await prisma.internalInvoice.findMany({
    where: {
      AWBId: { in: awbIds },
    },
    select: { AWBId: true },
  });

  const existingAWBIds = existingInternalInvoices.map(inv => inv.AWBId);
  
  // Determine which AWBs are not in internalInvoice
  const nonExistingAWBIds = awbIds.filter(id => !existingAWBIds.includes(id));

  console.log("total AWB:",awbIds,
    "existing AWB in internal:",existingAWBIds,
    "non existing AWB:",nonExistingAWBIds
  )

  if (nonExistingAWBIds.length > 0) {
    console.log('Calling calculateShippingCosts with:', nonExistingAWBIds);
    await calculateShippingCosts(nonExistingAWBIds);
    existingAWBIds.push(...nonExistingAWBIds);
    console.log('Merged AWB list for processing:', existingAWBIds)
  }
  if (existingAWBIds.length > 0) {
    console.log("ENTERS DOOR BOOKING CHARGE")
    // Group AWBs by consignorId and sum AWBChargedWeightWithCeiling
    const result = await prisma.airWayBill.groupBy({
      by: ['consignorId'],
      where: {
        id: { in: existingAWBIds },
      },
      _sum: {
        AWBChargedWeightWithCeiling: true,
      },
      _count: {
        id: true,
      },
    });
  
    for (const entry of result) {
      const consignorId = entry.consignorId;
      const totalChargedWeight = entry._sum.AWBChargedWeightWithCeiling ?? 0;
      const numberOfAWBs = entry._count.id;
  
      // Fetch doorBookingWeight and doorBookingCharge from contract
      const contract = await prisma.contract.findFirst({
        where: { consignorId },
        select: {
          doorBookingWeight: true,
          doorBookingCharge: true,
        },
      });
        const contractWeight = contract?.doorBookingWeight ?? 0;
        const doorBookingCharge = contract?.doorBookingCharge ?? 0;
  
        if (totalChargedWeight < contractWeight) {
          const perAWBCharge = doorBookingCharge / numberOfAWBs;
  
          console.log(
            `Consignor ${consignorId}: Applying door booking charge of ${perAWBCharge.toFixed(2)} per AWB for ${numberOfAWBs} AWBs.`
          );
  
          // Fetch AWBs for the consignor
          const awbsForConsignor = await prisma.airWayBill.findMany({
            where: {
              id: { in: existingAWBIds },
              consignorId,
            },
            select: { id: true },
          });
  
          // Update doorBookingCharge for each AWB in internalInvoice
          for (const awb of awbsForConsignor) {
            await prisma.internalInvoice.updateMany({
              where: { AWBId: awb.id },
              data: { doorBookingCharge: perAWBCharge },
            });
  
            console.log(
              `Updated doorBookingCharge for AWB ${awb.id} with ${perAWBCharge.toFixed(
                2
              )}`
            );
          }
        }
       else {
        console.log(`No contract found for consignor ${consignorId}`);
      }
    }
  }
  


 return;
};
