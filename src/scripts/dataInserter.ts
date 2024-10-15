import { PrismaClient } from '@prisma/client';
//import {getDMMF} from '@prisma/internals';
//import path from 'path';

const prisma = new PrismaClient();


/*async function getDmmf() {
    try {
        const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
        const dmmf = await getDMMF({
            datamodelPath: schemaPath,
            retry: 3,
        });
        console.log(dmmf.datamodel.models[0].name);
        return dmmf;
    } catch (error) {
        console.error('Error fetching DMMF:', error);
    }
}*/

async function getDefaultGroupId() {
    const defalutGroupName = 'others'
    const othersGroup = await prisma.cRMObjectGroup.findFirst({
        where: {
            viewName: {
                equals: defalutGroupName,
            },
        },
    });

    if (othersGroup) {
        return othersGroup.id;
    }

    const maxViewIndex = await prisma.cRMObjectGroup.aggregate({
        _max: {
            viewIndex: true,
        },
    });

    const newViewIndex = (maxViewIndex._max.viewIndex || 0) + 1;

    const newGroup = await prisma.cRMObjectGroup.create({
        data: {
            viewName: defalutGroupName,
            viewIndex: newViewIndex,
        },
    });

    return newGroup.id;
}


async function insertSchemaData(models:any) {
    const othersGroupId = await getDefaultGroupId();

    for (const model of models) {
        const existingCrmObject = await prisma.cRMObject.findFirst({
            where: {
                name: model.name,
            },
        });

        let crmObject;

        if (!existingCrmObject) {
            crmObject = await prisma.cRMObject.create({
                data: {
                    name: model.name,
                    viewName: model.name,
                    viewIndex: models.indexOf(model) + 1,
                    CRMObjectGroupId: othersGroupId
                }
            });
        } else {
            crmObject = existingCrmObject;
        }

        for (const field of model.fields) {
            const existingCrmField = await prisma.cRMField.findFirst({
                where: {
                    name: field.name,
                    CRMObjectId: crmObject.id,
                },
            });

            if (!existingCrmField) {
                await prisma.cRMField.create({
                    data: {
                        name: field.name,
                        viewName: field.name,
                        isRelation: field.kind === 'object',
                        idFieldName: field.kind === 'object' ? field.relationFromFields[0] : null,
                        labelFieldName: field.kind === 'object' ? field.name : null,
                        isInCreateView: false,
                        isInListView: false,
                        isInEditView: false,
                        isInDetailView: false,
                        isInRelatedList: field.kind === 'object',
                        isSearchableField: field.kind !== 'object',
                        CRMObjectId: crmObject.id
                    }
                });
            }
        }
    }
}

async function insertRelations(models:any) {
    for (const model of models) {
        const crmObject = await prisma.cRMObject.findFirst({
            where: {
                name: model.name,
            },
        });

        if (!crmObject) {
            console.warn(`CRMObject for model ${model.name} not found. Skipping relations.`);
            continue;
        }

        for (const field of model.fields) {
            if (field.kind === 'object') {
                const relatedObjectName = field.type;
                const relatedCrmObject = await prisma.cRMObject.findFirst({
                    where: {
                        name: relatedObjectName,
                    },
                });

                if (relatedCrmObject) {
                    const existingRelation = await prisma.cRMObjectRelations.findFirst({
                        where: {
                            primaryObjectId: crmObject.id,
                            relatedObjectId: relatedCrmObject.id,
                        },
                    });

                    if (!existingRelation) {
                        await prisma.cRMObjectRelations.create({
                            data: {
                                primaryObjectId: crmObject.id,
                                relatedObjectId: relatedCrmObject.id,
                            }
                        });
                    }
                }
            }
        }
    }
}

async function cleanUpDeletedEnteries(models:any) {
    // Create a Set of model names for quick lookup
    const modelNamesSet = new Set(models.map((model: { name: any; }) => model.name));

    // Fetch all CRMObjects
    const existingCrmObjects = await prisma.cRMObject.findMany();

    // Iterate over existing CRMObjects and delete those not in models
    for (const crmObject of existingCrmObjects) {
        if (!modelNamesSet.has(crmObject.name)) {
            // Delete associated CRMField entries first
            await prisma.cRMField.deleteMany({
                where: {
                    CRMObjectId: crmObject.id,
                },
            });

            // Delete associated CRMObjectRelations
            await prisma.cRMObjectRelations.deleteMany({
                where: {
                    OR: [
                        { primaryObjectId: crmObject.id },
                        { relatedObjectId: crmObject.id },
                    ],
                },
            });

            // Delete the CRMObject
            await prisma.cRMObject.delete({
                where: {
                    id: crmObject.id,
                },
            });
            console.log(`Deleted CRMObject: ${crmObject.name}`);
        } else {
            // If the object exists in models, we also need to clean up its fields
            const modelFieldsSet = new Set(models.find((model: { name: string; }) => model.name === crmObject.name).fields.map((field: { name: any; }) => field.name));

            const existingCrmFields = await prisma.cRMField.findMany({
                where: {
                    CRMObjectId: crmObject.id,
                },
            });

            // Iterate over existing CRMFields and delete those not in modelFields
            for (const crmField of existingCrmFields) {
                if (!modelFieldsSet.has(crmField.name)) {
                    await prisma.cRMField.delete({
                        where: {
                            id: crmField.id,
                        },
                    });
                    console.log(`Deleted CRMField: ${crmField.name} from CRMObject: ${crmObject.name}`);
                }
            }
        }
    }
}


export async function insertData(models:any) {
    //const dmmf = await getDmmf();
    //const models = dmmf!.datamodel.models;

    await insertSchemaData(models)
        .then(() => {
            console.log('Objects and Fields Inserted Successfully');
        })
        .catch((error) => {
            console.error('Error inserting data:', error);
        })

    await insertRelations(models)
        .then(() => {
            console.log('Object Relations Inserted Successfully');
        })
        .catch((error) => {
            console.error('Error inserting Relations:', error);
        })

    await cleanUpDeletedEnteries(models)
        .then(() => {
            console.log('CleanUp  Successful');
        })
        .catch((error) => {
            console.error('Error Cleaning Up:', error);
        })
}

/*
insertData()
    .catch((error) => {
        console.error('Error inserting data or relations:', error);
    })
    .finally(async () => {
        await prisma.$disconnect();
        return;
    });
*/
