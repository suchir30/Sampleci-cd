import prisma from '../client';
import moment from 'moment';
interface AWBLineItem {
    id: number;
    ratePerBox: number | null;
    boxType: string | null;
    numOfArticles: number;
  }
export const calculateShippingCosts = async (AWBId: number) => {
  try {
    const AWB = await prisma.airWayBill.findUnique({
      where: { id: AWBId },
      select: {
        consignorId: true,
        consigneeId: true,
        rollupChargedWtInKgs: true,
        toBranchId: true,
        chargedWeightWithCeiling: true,
      },
    });
    console.log(AWB, "@@@@@@@@@@@@@@@@@@@@@@ AWB DATA");
    if (!AWB) return "NoAWB";
    if (!AWB.consigneeId) return "AWBInvalidConsigneeId"
     if (!AWB.chargedWeightWithCeiling) return "AWBInvalidCeilingCW"
    const contractRes = await prisma.contract.findFirst({
      where: { consignorId: AWB.consignorId },
      select: {
        id: true,
        consignorContractType: true,
        baseChargeType: true,
        odaChargeType: true,
      },
    });
    if (!contractRes || !contractRes.baseChargeType || !contractRes.odaChargeType) return 'NoContract';
    const { baseChargeType, consignorContractType, odaChargeType } = contractRes;
    if (consignorContractType === "BoxRate") {
      if (baseChargeType !== "withoutChargedWeightRange" || contractRes.odaChargeType !== "withoutChargedWeightRange") {
        return "boxTypeWithChargeNoExists";
      }
      console.log("innnnnnnn box type");
      const awbLineItemRes = await prisma.awbLineItem.findMany({
        where: { AWBId },
        select: {
          id: true,
          numOfArticles: true,
          boxType: true,
          ratePerBox: true,
        },
      });
      if (awbLineItemRes.length === 0 || !AWB.chargedWeightWithCeiling) return "noAWBLineItem";
      const baseChargeCalcRes = await baseChargeCalculation(AWBId, AWB.consignorId, AWB.toBranchId, AWB.chargedWeightWithCeiling, baseChargeType, awbLineItemRes, consignorContractType);
      if(typeof baseChargeCalcRes === 'object' && baseChargeCalcRes !== null){
        const { internalInvoiceData, totalBaseCharge } = baseChargeCalcRes;
        const ODACharges = await Promise.all(
            awbLineItemRes.map(async (lineItem) => {
              return {
                AWBLineItemId: lineItem.id,
                ODACharge: await odaChargeCalculation(AWBId, AWB.consignorId, AWB.consigneeId??0, AWB.chargedWeightWithCeiling??0, odaChargeType, [lineItem], consignorContractType)
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
                where: { AWBId },
                select: { id: true },
              })).map(inv => inv.id),
            },
          },
        });
        // Step 2: Delete InternalInvoice(s)
        await tx.internalInvoice.deleteMany({
          where: { AWBId },
        });
        // Create a new internal invoice
        if(totalBaseCharge !== undefined && ODACharges !== undefined){
            const internalInvoice = await tx.internalInvoice.create({
                data: {
                  AWBId,
                  baseCharge: totalBaseCharge,
                  consignorId: AWB.consignorId,
                  consigneeId: AWB.consigneeId??0,
                  contractId: contractRes.id,
                  ODACharge: ODACharges.reduce((sum, item) => sum + (item.ODACharge ?? 0), 0), // Total ODA Charge
                },
              });
              console.log(internalInvoice.id, "primary key of internal invoice",ODACharges.reduce((sum, item) => sum + (item.ODACharge ?? 0), 0),);
              await tx.internalInvoiceLineItems.createMany({
                data: internalInvoiceData.map(item => {
                  const ODAChargeItem = ODACharges.find(oda => oda.AWBLineItemId === item.AWBLineItemId);
                  return {
                    AWBLineItemId: item.AWBLineItemId,
                    internalInvoiceId: internalInvoice.id,
                    baseCharge: item.baseCharge,
                    ODACharge: ODAChargeItem ? ODAChargeItem.ODACharge?? 0:0, // Use calculated ODA Charge
                  };
                }),
              });
        }
      
      });

      }
    //   const { internalInvoiceData, totalBaseCharge } = await baseChargeCalculation(AWBId, AWB.consignorId, AWB.toBranchId, AWB.chargedWeightWithCeiling, baseChargeType, awbLineItemRes, consignorContractType);
      // Calculate ODA charges per line item
     
     
      return;
    } else {
      // Handle non-box rate calculations
      const baseChargeRes = await baseChargeCalculation(AWBId, AWB.consignorId, AWB.toBranchId, AWB.chargedWeightWithCeiling, baseChargeType, [], consignorContractType);
      const ODAChargeRes = await odaChargeCalculation(AWBId, AWB.consignorId, AWB.consigneeId, AWB.chargedWeightWithCeiling, odaChargeType, [], consignorContractType);
      // Perform delete and create in a single transaction
      if(typeof baseChargeRes === 'number' && baseChargeRes !== null && baseChargeRes !== undefined && ODAChargeRes !== undefined){
        await prisma.$transaction(async (tx) => {
            // Step 1: Delete related records in InternalInvoiceLineItems
            await tx.internalInvoiceLineItems.deleteMany({
              where: {
                internalInvoiceId: {
                  in: (await tx.internalInvoice.findMany({
                    where: { AWBId },
                    select: { id: true },
                  })).map(inv => inv.id),
                },
              },
            });
            // Step 2: Delete InternalInvoice(s)
            await tx.internalInvoice.deleteMany({
              where: { AWBId },
            });
            // Create a new internal invoice
            const internalInvoice = await tx.internalInvoice.create({
              data: {
                baseCharge: baseChargeRes,
                ODACharge: ODAChargeRes,
                AirWayBill: { connect: { id: AWBId } },
                consignor: { connect: { consignorId: AWB.consignorId } },
                consignee: { connect: { consigneeId: AWB.consigneeId??0} },
                contract: { connect: { id: contractRes.id } },
              },
            });
            console.log(internalInvoice.id, "primary key of internal invoice", baseChargeRes, "baseChargeRes*********");
          });
      }
     
      return;
    }
  } catch (error) {
    console.error("Error calculating shipping costs:", error);
    throw new Error("Failed to calculate shipping costs");
  }
};

export const baseChargeCalculation = async (AWBId: number, consignorId: number, AWBToBranch: number, chargedWeightWithCeiling: number, baseChargeType: string, awbLineItemRes:AWBLineItem[], consignorContractType: string) => {
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
  if(consignorRateTableRes.length>0){
    console.log(consignorRateTableRes, "consignorRateTableRes");
  if (consignorContractType === "BoxRate") {
    if (baseChargeType === "withoutChargedWeightRange") {
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
    }
  } else {
    if (baseChargeType === "withChargedWeightRange") {
      console.log("in withCharge otherthanboxRate:- baseCharge", consignorRateTableRes);
      applicableRange = consignorRateTableRes.find((range) => {
        console.log(`Checking range: ${range.chargedWeightLower} - ${range.chargedWeightHigher}`);
        return chargedWeightWithCeiling >= (range.chargedWeightLower || 0) &&
          chargedWeightWithCeiling <= (range.chargedWeightHigher || 0);
      });
      if(applicableRange && applicableRange.ratePerKg){
        console.log("Applicable Range:", applicableRange);
        baseCharge = chargedWeightWithCeiling * applicableRange.ratePerKg;
        console.log(chargedWeightWithCeiling, applicableRange.ratePerKg);
        return baseCharge;
      }
      else{
        throw new Error('No applicable range found for the charged weight.');
      }
    }
    if (baseChargeType === "withoutChargedWeightRange") {
        if(consignorRateTableRes[0].ratePerKg){
            console.log("in withoutCharge otherthanboxRate:- baseCharge", chargedWeightWithCeiling, consignorRateTableRes[0].ratePerKg);
            baseCharge = chargedWeightWithCeiling * consignorRateTableRes[0].ratePerKg;
            return baseCharge;
        }
        else{
            throw new Error('RatePerKg is missing in Consignor Model.');
        }
    }
  }
  }
  else{
    throw new Error('No consignorRateTable response.');
  }
  
};

export const odaChargeCalculation=async(AWBId: number, consignorId: number,consigneeId: number,chargedWeightWithCeiling: number,odaChargeType: string,awbLineItemRes:AWBLineItem[],consignorContractType: string)=>{
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
  if(!consigneeResponse?.distanceToBranchKms)
    {
        throw new Error('DistanceToBranchKms in consignee not exists.');
    }
    let distance=consigneeResponse?.distanceToBranchKms
    if (consignorContractType === "BoxRate") {
    console.log(consignorContractType, "oda charge type boxtype innnn");
    // Log the distance for verification
    console.log("Distance to Branch (km):", distance);
    applicableRange = odaResponse.find((range) => 
      distance >= (range.kmStartingRange??0) && distance <= (range.kmEndingRange??Number.MAX_VALUE)
    );
    // Log the applicable range details
    if (applicableRange) {
      console.log("Applicable ODA Range:", applicableRange);
    } else {
      console.log("No applicable range found for the distance:", distance);
      return 0; // Or handle as needed
    }
    console.log("ODA calculation innn applicable Range$$$");
    let totalODACharge = 0;
    for (const lineItem of awbLineItemRes) {
      const { boxType, numOfArticles } = lineItem;
    
      // Find matching ODA rate for the box type
      
        const odaBoxRate = odaResponse.find((oda) => oda.ODABoxType === boxType);
  
      if (odaBoxRate) {
        // Check if the distance falls within the km range of the found ODA rate
        const isDistanceApplicable = distance >= (odaBoxRate.kmStartingRange??0) && distance <= (odaBoxRate.kmEndingRange??0);
    
        if (isDistanceApplicable) {
          console.log("Found applicable ODA Box Rate:", odaBoxRate);
    
          const ratePerBox = odaBoxRate.ODARatePerBox ?? 0;
          const minimumCharge = odaBoxRate.minimumCharge ?? 0;
    
          // Calculate charge for the current box type
          const chargeForBox = Math.max(minimumCharge, ratePerBox * numOfArticles);
          totalODACharge += chargeForBox;
    
          // Log charge for the current box type
          console.log(`Charge for ${numOfArticles} articles of box type ${boxType}:`, chargeForBox);
        } else {
          console.log(`Box type ${boxType} is not applicable due to distance. Skipping charge calculation.`);
        }
      } else {
        console.log(`No ODA Box Rate found for box type: ${boxType}`);
      }
    }

    ODACharge = totalODACharge;
    console.log("Total ODA Charge:", ODACharge);
    return ODACharge;
  }
  else{
    if(odaChargeType=="withChargedWeightRange"){
      applicableRange = odaResponse.find(range =>
        distance >= (range.kmStartingRange || 0) &&
        distance <= (range.kmEndingRange || 0) &&
        chargedWeightWithCeiling >= (range.chargedWeightLower || 0) &&
        chargedWeightWithCeiling <= (range.chargedWeightHigher || Number.MAX_VALUE)
      );
      if (applicableRange) {
        const ODARatePerKg = applicableRange.ODARatePerKg ?? 0;
        const minimumCharge = applicableRange.minimumCharge ?? 0;
        const ODACalculation = ODARatePerKg * chargedWeightWithCeiling;
        ODACharge = Math.max(minimumCharge, ODACalculation);
        console.log(minimumCharge, ODACalculation, ODACharge);
        return ODACharge
      }
    }
    if(odaChargeType=="withoutChargedWeightRange"){
      applicableRange = odaResponse.find(range =>
        distance >= (range.kmStartingRange || 0) &&
        distance <= (range.kmEndingRange || 0)
      );
      if (applicableRange) {
        const ODARatePerKg = applicableRange.ODARatePerKg ?? 0;
        const minimumCharge = applicableRange.minimumCharge ?? 0;
        const ODACalculation = ODARatePerKg * chargedWeightWithCeiling;
        ODACharge = Math.max(minimumCharge, ODACalculation);
        console.log(minimumCharge, ODARatePerKg,chargedWeightWithCeiling,ODACalculation);
        return ODACharge
      }
    }
    
  }
}
