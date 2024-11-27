import {CRMFieldType, PrismaClient} from '@prisma/client';
import { getDMMF } from '@prisma/internals';
import path from 'path';

const prisma = new PrismaClient();

const groupMappings = {
    'AirWayBill': ['AirWayBill', 'AWBLineItem', 'AWBArticle', 'AWBArticleTripLogs'],
    'Trips': ['TripDetails', 'TripLineItem', 'TripCheckin', 'VendorMaster', 'DriverMaster', 'vehicleMaster'],
    'HubLoadFactor': ['HLFLineItem'],
    'DEPS': ['DEPS', 'DEPSImages'],
    'Customers': ['Consignor', 'Consignee', 'Contract', 'ConsignorRateTable', 'SKU', 'ODA', 'InternalInvoice', 'InternalInvoiceLineItems'],
    'User': ['User'],
    'Masters': ['CityMaster', 'StateMaster', 'DistrictMaster', 'PincodesMaster', 'GSTMaster', 'commodityMaster', 'industryTypeMaster']
};

async function getDmmf() {
    try {
        const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
        const dmmf = await getDMMF({
            datamodelPath: schemaPath,
            retry: 3,
        });
        return dmmf;
    } catch (error) {
        console.error('Error fetching DMMF:', error);
    }
}

function unCapitalizeFirstLetter(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

async function getGroupId(groupName: string): Promise<number> {
    try {
        const existingGroup = await prisma.cRMObjectGroup.findFirst({
            where: {
                viewName: groupName,
            },
        });

        if (existingGroup) {
            return existingGroup.id;
        }

        const maxViewIndex = await prisma.cRMObjectGroup.aggregate({
            _max: {
                viewIndex: true,
            },
        });

        const newViewIndex = (maxViewIndex._max.viewIndex || 0) + 1;

        const newGroup = await prisma.cRMObjectGroup.create({
            data: {
                viewName: groupName,
                viewIndex: newViewIndex,
            },
        });

        return newGroup.id;
    } catch (error) {
        console.error(`Error in getGroupId for ${groupName}:`, error);
        throw error;
    }
}

function getObjectGroup(modelName: string): string {
    for (const [group, objects] of Object.entries(groupMappings)) {
        if (objects.some(obj => obj.toLowerCase() === modelName.toLowerCase())) {
            return group;
        }
    }
    return 'others'; // Default group for unmapped objects
}

function guessFieldType (kind: string, type: string): CRMFieldType | null {
    const typeMapping: Record<string, CRMFieldType> = {
        Float: "calculated",
        Boolean: "checkbox",
        DateTime: "datePicker",
        String: "textInput",
        Int: "numberInput",
    }

    const kindMapping: Record<string, CRMFieldType> = {
        enum: "picklist",
        object: "relation",
    }

    if (kind === 'scalar'){
        if (typeMapping[type]) {
            return typeMapping[type];
        }
    }else {
        if (kindMapping[kind]) {
            return kindMapping[kind];
        }
    }

    return null;
}

async function insertSchemaData(models: any) {
    // Create all groups first
    const groupIds = new Map<string, number>();
    for (const groupName of Object.keys(groupMappings)) {
        const groupId = await getGroupId(groupName);
        groupIds.set(groupName, groupId);
    }
    // Also create 'others' group for unmapped objects
    const othersGroupId = await getGroupId('others');
    groupIds.set('others', othersGroupId);

    const crmObjects = new Map<string, any>();
    for (const model of models) {
        const modelName = unCapitalizeFirstLetter(model.name);
        const groupName = getObjectGroup(modelName);
        const groupId = groupIds.get(groupName) ?? othersGroupId;

        // Determine primaryFieldName and labelFieldName
        const primaryField = model.fields.find((field: any) => field.isId);
        const labelField = model.fields.find((field: any) =>
            field.name.toLowerCase().includes("name") || field.name.toLowerCase().includes("code")
        ) || { name: primaryField?.name };

        // Convert model name from camelCase to ViewName format
        const viewName = model.name
            .replace(/([a-z])([A-Z])/g, '$1 $2')  // Split camelCase
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')  // Handle cases like "eXample" → "e Xample"
            .replace(/\b([A-Z]+)\b/g, (match: string) => match.toUpperCase())  // Preserve acronyms in uppercase
            .replace(/^[a-z]/, (match: string) => match.toUpperCase());  // Capitalize the first letter of the whole string

        try {
            const crmObject = await prisma.cRMObject.upsert({
                where: { name: modelName },
                update: {},
                create: {
                    name: modelName,
                    viewName: viewName,
                    viewIndex: models.indexOf(model) + 1,
                    CRMObjectGroupId: groupId,
                    primaryKeyName: primaryField?.name || null,
                    labelFieldName: labelField?.name || null,
                },
            });
            crmObjects.set(modelName, crmObject);
        } catch (error) {
            console.error(`Error creating/updating CRMObject ${modelName}:`, error);
        }
    }

    const fieldsToSkipByModel = new Map<string, Set<string>>();

    for (const model of models) {
        const fieldsToSkip = new Set<string>();

        for (const field of model.fields) {
            if (field.relationFromFields && field.relationFromFields.length > 0) {
                field.relationFromFields.forEach((fieldName: string) => fieldsToSkip.add(fieldName));
            }
        }

        fieldsToSkipByModel.set(model.name, fieldsToSkip);
    }

    for (const model of models) {
        const fieldsToSkip = fieldsToSkipByModel.get(model.name);
        const modelName = unCapitalizeFirstLetter(model.name);
        const crmObject = crmObjects.get(modelName);

        for (const field of model.fields) {
            if (fieldsToSkip && fieldsToSkip.has(field.name)) {
                continue;
            }

            const isRequired = field.isRequired || false;
            const relatedObject = field.kind === 'object' ? crmObjects.get(unCapitalizeFirstLetter(field.type)) : null;
            const viewName = field.name
                .replace(/([a-z])([A-Z])/g, '$1 $2')  // Split camelCase
                .replace(/([a-z0-9])([A-Z])/g, '$1 $2')  // Handle cases like "eXample" → "e Xample"
                .replace(/\b([A-Z]+)\b/g, (match: string) => match.toUpperCase())  // Preserve acronyms in uppercase
                .replace(/^[a-z]/, (match: string) => match.toUpperCase());  // Capitalize the first letter of the whole string

            try {
                const existingCrmField = await prisma.cRMField.findFirst({
                    where: {
                        name: field.name,
                        CRMObjectId: crmObject.id,
                    },
                });

                if (!existingCrmField) {
                    const crmField = await prisma.cRMField.create({
                        data: {
                            name: field.name,
                            viewName: viewName,
                            isRelation: field.kind === 'object',
                            idFieldName: field.kind === 'object' ? field.relationFromFields?.[0] || null : null,
                            fieldType:  guessFieldType(field.kind, field.type),
                            enumListName: field.kind === 'enum' ?  field.type : null,
                            isInCreateView: false,
                            isInListView: false,
                            isInEditView: false,
                            isInDetailView: false,
                            isInRelatedList: field.kind === 'object',
                            isSearchableField: field.kind !== 'object',
                            isRequired,
                            relatedObjectId: relatedObject ? relatedObject.id : null,
                            CRMObjectId: crmObject.id,
                        },
                    });

                    // If field is the primary ID, set it as SortFieldId for CRMObject
                    if (field.isId) {
                        await prisma.cRMObject.update({
                            where: { id: crmObject.id },
                            data: { sortFieldId: crmField.id },
                        });
                    }
                }
            } catch (error) {
                console.error(`Error processing field ${field.name} for CRMObject ${modelName}:`, error);
            }
        }
    }

    /*for (const model of models) {
        const modelName = unCapitalizeFirstLetter(model.name);
        const groupName = getObjectGroup(modelName);
        const groupId = groupIds.get(groupName);

        try {
            const existingCrmObject = await prisma.cRMObject.findFirst({
                where: {
                    name: modelName,
                },
            });

            let crmObject;

            if (!existingCrmObject) {
                crmObject = await prisma.cRMObject.create({
                    data: {
                        name: modelName,
                        viewName: modelName,
                        viewIndex: models.indexOf(model) + 1,
                        CRMObjectGroupId: groupId ?? -1,
                    },
                });
            } else {
                // Update group if different
                if (existingCrmObject.CRMObjectGroupId !== groupId) {
                    crmObject = await prisma.cRMObject.update({
                        where: { id: existingCrmObject.id },
                        data: { CRMObjectGroupId: groupId ?? -1 },
                    });
                } else {
                    crmObject = existingCrmObject;
                }
            }

            for (const field of model.fields) {
                try {
                    const existingCrmField = await prisma.cRMField.findFirst({
                        where: {
                            name: field.name,
                            CRMObjectId: crmObject.id,
                        },
                    });

                    if (!existingCrmField) {
                        const crmField = await prisma.cRMField.create({
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
                                CRMObjectId: crmObject.id,
                            },
                        });

                        if (field.isId) {
                            await prisma.cRMObject.update({
                                where: { id: crmObject.id },
                                data: { SortFieldId: crmField.id },
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error processing field ${field.name} for CRMObject ${modelName}:`, error);
                }
            }
        } catch (error) {
            console.error(`Error processing CRMObject ${modelName}:`, error);
        }
    }*/
}

async function insertRelations(models: any) {
    for (const model of models) {
        const modelName = unCapitalizeFirstLetter(model.name);

        try {
            const crmObject = await prisma.cRMObject.findFirst({
                where: {
                    name: modelName,
                },
            });

            if (!crmObject) {
                console.warn(`CRMObject for model ${modelName} not found. Skipping relations.`);
                continue;
            }

            for (const field of model.fields) {
                if (field.kind === 'object' && field.relationFromFields?.length === 0 && field.relationToFields?.length === 0) {
                    try {
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
                                    },
                                });
                            }
                        }
                    } catch (error) {
                        console.error(`Error processing relation for CRMObject ${modelName} and field ${field.name}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Error processing relations for CRMObject ${modelName}:`, error);
        }
    }
}

async function cleanUpDeletedEnteries(models: any) {
    try {
        const modelNamesSet = new Set(models.map((model: { name: any; }) => unCapitalizeFirstLetter(model.name)));

        const existingCrmObjects = await prisma.cRMObject.findMany();

        for (const crmObject of existingCrmObjects) {
            if (!modelNamesSet.has(crmObject.name)) {
                await prisma.cRMField.deleteMany({
                    where: {
                        CRMObjectId: crmObject.id,
                    },
                });

                await prisma.cRMObjectRelations.deleteMany({
                    where: {
                        OR: [
                            { primaryObjectId: crmObject.id },
                            { relatedObjectId: crmObject.id },
                        ],
                    },
                });

                await prisma.cRMObject.delete({
                    where: {
                        id: crmObject.id,
                    },
                });
                console.log(`Deleted CRMObject: ${crmObject.name}`);
            } else {
                const modelFieldsSet = new Set(
                    models.find((model: { name: string }) => unCapitalizeFirstLetter(model.name) === crmObject.name).fields.map(
                        (field: { name: any }) => field.name
                    )
                );

                const existingCrmFields = await prisma.cRMField.findMany({
                    where: {
                        CRMObjectId: crmObject.id,
                    },
                });

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
    } catch (error) {
        console.error('Error cleaning up entries:', error);
    }
}

export async function insertData(models: any) {
    if (!models) {
        const dmmf = await getDmmf();
        models = dmmf!.datamodel.models;
    }

    await insertSchemaData(models)
        .then(() => {
            console.log('Objects and Fields Inserted Successfully');
        })
        .catch((error) => {
            console.error('Error inserting data:', error);
        });

    await insertRelations(models)
        .then(() => {
            console.log('Object Relations Inserted Successfully');
        })
        .catch((error) => {
            console.error('Error inserting Relations:', error);
        });

    await cleanUpDeletedEnteries(models)
        .then(() => {
            console.log('CleanUp Successful');
        })
        .catch((error) => {
            console.error('Error Cleaning Up:', error);
        });
}

insertData(null);
