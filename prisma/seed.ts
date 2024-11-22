import fs from 'fs';
import csvParser from 'csv-parser';
const { PrismaClient,AWBStatus,ArticleStatus,ContractConsignorType,ContractType,DEPSStatus,DEPSTypeList,PTlRateType,TripLineItemStatus,HLFLineItemStatus,BoxType,ArticleLogsScanType} = require('@prisma/client');
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
const models = [
    'IndustryTypeMaster',
    'CommodityMaster',
    'CityMaster',
    'DistrictMaster',
    'StateMaster',
    'Branch',
    'Consignor',
    'PincodesMaster',
    'Consignee',
    'User',
    'GstMaster',
    'DriverMaster',
    'VehicleMaster',
    'AirWayBill',
    'AwbArticle',
    'AwbLineItem',
    'TripDetails',
    'TripLineItem',
    'HLFLineItem',
    'DEPS',
    'Contract',
    'VendorMaster',
    'ConsignorRateTable',
    'SKU'
];
const enum_lookup: { [key: string]: any } = {
    AWBStatus,
    ArticleStatus,
    TripLineItemStatus,
    DEPSTypeList,
    DEPSStatus,
    ContractConsignorType,
    ContractType,
    PTlRateType,
    HLFLineItemStatus,
    BoxType,
    ArticleLogsScanType
    
    // Add other enum types here...
};
async function processRow(row: any, modelName: string) {
    const promises = Object.keys(row).map(async (key) => {
        const prismaType = prisma[modelName]?.fields[key]?.typeName;
        const throwTypeError = () => {
            throw Error(`Invalid value "${row[key]}" for field "${key}" of model "${modelName}"`);
        };
        // Remove null fields
        if (!row[key]) {
            delete row[key];
            return;
        }
        // Handle Special fields
        if (modelName === "User" && key === "password") {
            row.hashedPassword = await bcrypt.hash(row[key], 10);
            delete row[key];
            return;
        }
        if ((prisma[modelName]?.fields[key]?.isEnum)&& enum_lookup[prismaType]) {
            const enumValues = Object.values(enum_lookup[prismaType]);
            if (!enumValues.includes(row[key])) {
                throwTypeError();
            }
            return;
        }
            switch (prismaType) {
                case "String":
                case "DateTime":
                    break; // keep as string
                case "Int":
                    if (!/^\d+$/.test(row[key])) {
                        throwTypeError();
                    }
                    row[key] = parseInt(row[key], 10);
                    break;
                case "Boolean":
                    if (!/^[01]$/.test(row[key])) {
                        throwTypeError();
                    }
                    row[key] = row[key] === "1";
                    break;
                case "Float":
                    if (!/^\d+(\.\d+)?$/.test(row[key])) { 
                        throwTypeError(); 
                    }
                    row[key] = parseFloat(row[key]);
                    break;
                default:
                    throw Error(`Unhandled prisma type: "${prismaType}" found for key "${key}" of model "${modelName}"`);
        }
        return row;
    });
    await Promise.all(promises);
    return row;
}

async function seedModelFromCSV(prisma: any, modelName: string) {
    const csvFilePath = `./docs/loadFilesCSV/${modelName}.csv`;
    const data: any[] = [];
    return new Promise<void>((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', async () => {
                try {
                    const processedData = await Promise.all(data.map(row => processRow(row, modelName)));
                    console.log("Data count:", modelName, processedData.length);
                    await prisma[modelName].createMany({
                        data: processedData,
                        skipDuplicates: true,
                    });
                    console.log(`Successfully seeded ${modelName}.`);
                    resolve();
                } catch (error) {
                    console.error(`Error seeding ${modelName}:`, error);
                    reject(error);
                }
            })
            .on('error', (error) => {
                console.error(`Error reading ${csvFilePath}:`, error);
                reject(error);
            });
    });
}

async function main() {
    for (const modelName of models) {
        await seedModelFromCSV(prisma, modelName);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });