import { AirWayBill, ArticleStatus, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import moment from 'moment';

import { AWBCreateData } from '../types/awbTypes';

export const generateBulkAWBForConsignor = async (consignorId: number, awbData: AWBCreateData[]) => {

    return await prisma.$transaction(async prisma => {
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
};

export const updateArticleCountForAWB = async (AWBId: number, newArticleCount: number) => {
    // todo: is this allowed once articles are generated?

    if (newArticleCount <= 0) {
        throw Error("New article count is non-positive.");
    }

    const updateArticles = await prisma.airWayBill.update({
        where: { id: AWBId },
        data: { numOfArticles: newArticleCount },
    });
    return updateArticles;

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
    return createdArticles;
}

export const generateAWBArticles = async (AWBId: number) => {
    return prisma.$transaction(async prisma => {
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
            throw Error(`Articles have already been generated for AWB=${AWBId}`);
        }
        return await createAWBArticlesHelper(prisma, AWBId, awb.AWBCode, awb.numOfArticles);
    });
}

export const addAWBArticles = async (AWBId: number, numArticlesToAdd: number) => {
    return prisma.$transaction(async prisma => {
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
}

export const markAWBArticlesAsPrinted = async (AWBId: number) => {
    const printedArticles = await prisma.awbArticle.updateMany({
        where: {
            AWBId: AWBId,
            status: {
                not: ArticleStatus.DELETED
            }
        },
        data: { status: ArticleStatus.PRINTED }
    });
    return printedArticles;
};

export const markAWBArticleAsDeleted = async (articleId: number, AWBId: number) => {
    const deletedArticle = prisma.awbArticle.update({
        where: { id: articleId, AWBId },
        data: {
            status: ArticleStatus.DELETED,
        }
    });
    return deletedArticle;
};
