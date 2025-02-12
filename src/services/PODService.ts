import prisma from '../client';
import axios from 'axios';
import {MulterFile} from "../types/multerTypes";
import FormData from 'form-data';
import { DateTime } from 'luxon'; // For date manipulation if needed
import { response } from "express";


export const triggerExternalService = async (files: MulterFile[],uploadResults:any[]) => {
    const apiUrl = process.env.EXTERNAL_API_URL!;
    const apiKey = process.env.EXTERNAL_API_KEY!;
    const parserApp = process.env.PARSER_APP!;
    
    // Process each file
    const results = await Promise.all(
      files.map(async (file,index) => {
        const fileResult = uploadResults[index];
        try {
          console.log(`Triggering external service for file: ${file.originalname}`);
  
          const formData = new FormData();
          formData.append('file', file.buffer, file.originalname);
          formData.append('parserApp', parserApp);
          formData.append('extra_accuracy', 'true');
  
          const response = await axios.post(apiUrl, formData, {
            headers: {
              ...formData.getHeaders(),
              'x-api-key': apiKey,
            },
          });
  
          return {
            fileName: file.originalname,
            response: response.data,
          };
  
        } catch (error: any) {
        //const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
          const errorMessage = error.response?.data || error.message || 'Unknown error';
          console.error(error.message,`Error triggering external service for file ${file.originalname}:`, errorMessage);
          try {
            await prisma.pOD.create({
              data: {
                // errorMessage: `${errorMessage}`, // Store the specific error message
                response:JSON.stringify(errorMessage),
                fileId:fileResult.fileId
              },
            });
          } catch (dbError) {
            console.error('Error saving error message to the database:', dbError);
          }
  
          // Throw the error to halt the process if needed
          throw new Error(`Error for file ${file.originalname}: ${errorMessage}`);
        }
      })
    );
    return results;
};


  
export const podCreation = async (
    externalApiResponses: any[],
    fileName: string,
    fileUploadResp: any[]
  ) => {
    console.log("enters into PODCreation service");
    const podData = externalApiResponses.map(async (response, index) => {
      const { parsedData } = response.response;
  
      const bookingDate = DateTime.fromFormat(
        parsedData.NSCS_Book_Date,
        "dd-MM-yyyy"
      ).toJSDate();
  
      const AWBId = await prisma.airWayBill.findFirst({
        where: {
          AWBCode: fileName,
        },
        select: {
          id: true,
        },
      });
      console.log("AWB response:",AWBId,"awbcode:fileName",fileName)
  
      // Match the fileId for the current POD
      const fileResult = fileUploadResp[index];
  
      const pod = {
        PODAWBCode: parsedData.Docket_Number,
        AirWayBill: AWBId?.id
        ? { connect: { id: AWBId.id } }
        : undefined,
        PODBookingDate: bookingDate,
        PODNumberOfArticles: parseInt(parsedData.No_of_Articles, 10),
        PODNSCSDestHub: parsedData.NSCS_Dest_Hub,
        stampPresent: parsedData.StampPresent,
        signature: parsedData.Signature,
        remarks: parsedData.Remarks || null,
        PODInvoiceNumber: parsedData.Invoice_Number,
        fileId: fileResult.fileId, // Include fileId here
        response: JSON.stringify(parsedData)
      };
      try {
        const createdPod = await prisma.pOD.create({
          data: pod,
        });
  
        // Update ePOD column in AirWayBill model
        if (AWBId?.id) {
            console.log("triplineitemepod received updated")
          await prisma.tripLineItem.updateMany({
            where: { AWBId: AWBId.id },
            data: { ePODReceived: true }, // Assuming ePOD stores the POD record ID
          });
          console.log(`Updated AirWayBill ePOD with POD ID: ${createdPod.id}`);
        }
  
        return createdPod;
      } catch (error) {
        console.error("Error inserting POD or updating AirWayBill:", error);
      }
    });
  
    try {
      const insertedPods = await Promise.all(podData);
      console.log("PODs successfully created:", insertedPods);
    } catch (error) {
      console.error("Error inserting PODs:", error);
    }
};