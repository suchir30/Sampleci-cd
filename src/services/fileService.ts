import prisma from "../client";
import {MulterFile} from "../types/multerTypes";
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import path from "path";
import fs from "fs";
import {error} from "winston";
import {throwValidationError} from "../utils/apiUtils";
import axios from 'axios';
import FormData from 'form-data';
import { DateTime } from 'luxon'; // For date manipulation if needed
import { response } from "express";


export interface UploadResult {
    filePath?: string;
    uri?: string;
    expiresOn?: Date;
}
export const fileUploadRes = async (normalizedFilePaths: UploadResult[], type: string) => {
    try {
        const createdRecords = await prisma.$transaction(async (prisma) => {
            const createPromises = normalizedFilePaths.map(async (object) => {

                let data: any = {
                    path: object.filePath,
                    type: type,
                    uri: object.uri,
                    sourceType: process.env.FILE_SOURCE,
                    expiresOn: object?.expiresOn
                };


                const result = await prisma.fileUpload.create({
                    data: data,
                });

                console.log(result);


                console.log(`Created ImageLinks record with ID: ${result.id}`);



                return {
                    fileId: result.id,
                    fileUri: result.uri,
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
export const getFileDetails = async (fileIds: number[]) => {
    try {
        const files = await prisma.fileUpload.findMany({
            where: {
                id: {
                    in: fileIds,
                },
            },
            select: {
                id: true,
                path: true,
                sourceType: true,
                uri: true,
                expiresOn: true,
            },
        });

        return files;
    } catch (error) {
        console.error('Error fetching file details:', error);
        throw error;
    }
}

export const updateFileExpiration = async (fileId: number, newExpirationDate: Date,signedUrl:string): Promise<void> => {
    try {
        await prisma.fileUpload.update({
            where: {
                id: fileId,
            },
            data: {
                expiresOn: newExpirationDate,
                uri:signedUrl
            },
        });
        console.log(`Expiration date updated successfully for file ID: ${fileId}`);
    } catch (error) {
        console.error(`Error updating expiration date for file ID: ${fileId}`, error);
        throw new Error('Could not update expiration date');
    }
};


//Helper functions

export const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "na",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "na",
    },
    region: process.env.S3_BUCKET_REGION || "na"
});


export const handleFileUpload = async (files: MulterFile[], type: string, useTimestamp = true): Promise<UploadResult[]> => {
    const validTypes = ['DEPS', 'AWB', 'GST', 'ShippingLabel', 'TripCheckin', 'LoadingSheet', 'UnloadingSheet', 'HireLetter', 'POD'];

    if (!validTypes.includes(type)) {
        throw throwValidationError([{ message: `Invalid type provided. Type should be one of: ${validTypes.join(', ')}` }]);
    }
    const currentTimestamp = useTimestamp? Date.now().toString(): '';
    switch (process.env.FILE_SOURCE){
        case 'S3Bucket':
            return uploadToS3(files, type, currentTimestamp);
        case 'Local':
            return uploadToLocal(files, type, currentTimestamp);
        default :
            throw error("No File Source Specified");
    }
};

const uploadToS3 = async (files: MulterFile[], type: string, currentTimestamp: string): Promise<UploadResult[]> => {

    const expirationTime = eval(process.env.URL_EXPIRATION_TIME || "7200");
    const expirationDate = new Date(Date.now() + expirationTime * 1000);

    const uploadPromises = files.map(async (file) =>{
        const fileName = `${currentTimestamp}_${file.originalname}`;
        const fileKey = `${type}/${fileName}`;
        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        try {
            await s3Client.send(new PutObjectCommand(uploadParams));
            const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${fileKey}`;
            const command = new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: fileKey });
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expirationTime });

            return { filePath: fileUrl, uri: signedUrl, expiresOn: expirationDate };
        } catch (err) {
            console.error('Error uploading file to S3:', err);
            throw err;
        }
    });
    return Promise.all(uploadPromises);
};

const uploadToLocal = (files: MulterFile[], type: string, currentTimestamp: string): Promise<UploadResult[]> => {
    const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads', type);
    fs.mkdirSync(uploadDir, { recursive: true });

    const uploadPromises = files.map(async (file) => {

        const filePath = path.join('uploads', type, `${currentTimestamp}_${file.originalname}`);
        const uri = `${process.env.BASE_URL}/${filePath}`;

        return new Promise<UploadResult>((resolve, reject) => {
            fs.writeFile(filePath, file.buffer, (err) => {
                if (err) {
                    console.error('Error writing file to local:', err);
                    return reject(err);
                }
                console.log(`File ${file.originalname} uploaded successfully`);
                resolve({ filePath, uri });
            });
        });
    });

    return Promise.all(uploadPromises);
};

export const refreshSignedUrlIfNeeded = async (file: any): Promise<string> => {
    const expirationTime = eval(process.env.URL_EXPIRATION_TIME || "7200");
    const fileExpiresInSeconds = (new Date(file.expiresOn || "na").getTime() - Date.now()) / 1000;
    const twoHoursInSeconds = 2 * 60 * 60;

    if (fileExpiresInSeconds <= twoHoursInSeconds) {
        /*const s3Client = new S3Client({
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || "na",
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "na",
            },
            region: process.env.S3_BUCKET_REGION || "na"
        });*/

        const getObjectParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.path.replace(`https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/`, ''),
        };
        const command = new GetObjectCommand(getObjectParams);
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expirationTime });

        const newExpirationDate = new Date(Date.now() + expirationTime * 1000);
        await updateFileExpiration(file.id, newExpirationDate,signedUrl);

        return signedUrl;
    }

    return file.uri;
};

export const uploadPDF = async (buffer: Buffer, filename: string, type: string, useTimeStamp = true): Promise<UploadResult[]> => {
    try {
        const fileName = `${filename}.pdf`;
        const file: MulterFile = {
            originalname: fileName,
            buffer: buffer,
            mimetype: 'application/pdf',
            fieldname: 'file',
            encoding: '7bit',
            size: buffer.length,
            destination: '',
            filename: '',
            path: '',
        };

        const uploadResults = await handleFileUpload([file], type, useTimeStamp);
        if (uploadResults && uploadResults.length > 0) {
            return uploadResults;
        } else {
            throw new Error('File upload failed');
        }
    } catch (error) {
        console.error('Error uploading PDF:', error);
        throw error;
    }
}

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
        response:"success"
      };
  
      return await prisma.pOD.create({
        data: pod,
      });
    });
  
    try {
      const insertedPods = await Promise.all(podData);
      console.log("PODs successfully created:", insertedPods);
    } catch (error) {
      console.error("Error inserting PODs:", error);
    }
  };
  

