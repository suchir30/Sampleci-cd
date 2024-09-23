import prisma from "../client";
import {MulterFile} from "../types/multerTypes";
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import path from "path";
import fs from "fs";
import {error} from "winston";

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

export const updateFileExpiration = async (fileId: number, newExpirationDate: Date): Promise<void> => {
    try {
        await prisma.fileUpload.update({
            where: {
                id: fileId,
            },
            data: {
                expiresOn: newExpirationDate,
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
        await updateFileExpiration(file.id, newExpirationDate);

        return signedUrl;
    }

    return file.uri;
};



