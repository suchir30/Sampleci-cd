import prisma from "../client.js";

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
