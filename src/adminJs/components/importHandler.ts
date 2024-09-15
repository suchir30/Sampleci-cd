import {ActionHandler, ActionRequest, ActionResponse, BaseRecord, BaseResource, ValidationError} from "adminjs";
import * as util from "util";
import * as fs from "fs";
import {Importer} from "@adminjs/import-export/src/parsers.js";
import csv from 'csvtojson';
import xml2js from 'xml2js';


const readFile = util.promisify(fs.readFile);

export const saveRecords = async (records, resource) => {
    return Promise.all(
        records.map(async record => {
            try {
                // Check if the record exists
                const existingRecord = await resource.findOne(record.id); // Assumes 'id' as unique identifier
                if (existingRecord) {
                    // Update existing record
                    return await resource.update(record.id, record);
                } else {
                    // Create new record
                    return await resource.create(record);
                }
            } catch (e) {
                console.error(e);
                return e;
            }
        })
    );
};

export const getImporterByFileName = (fileName: string): Importer => {
    if (fileName.includes('.json')) {
        return jsonImporter;
    }
    if (fileName.includes('.csv')) {
        return csvImporter;
    }
    if (fileName.includes('.xml')) {
        return xmlImporter;
    }
    throw new Error('No parser found');
};

export const jsonImporter: Importer = async (jsonString, resource) => {
    const records = JSON.parse(jsonString);

    return saveRecords(records, resource);
};

export const csvImporter: any = async (csvString, resource) => {
    const records = await csv().fromString(csvString);
    const typedRecord =  records.map(row => {
        const typedRow = {};
        for (const key in row) {
            if (row.hasOwnProperty(key)) {
                typedRow[key] = guessType(row[key]);
            }
        }
        return typedRow;
    });

    return saveRecords(typedRecord, resource);
};

export const xmlImporter: Importer = async (xmlString, resource) => {
    const parser = new xml2js.Parser({ explicitArray: false });
    const {
        records: { record },
    } = await parser.parseStringPromise(xmlString);

    return saveRecords(record, resource);
};

export const getFileFromRequest = (request: ActionRequest) => {
    const file = request.payload?.file;

    if (!file?.path) {
        throw new ValidationError({
            file: { message: 'No file uploaded' },
        });
    }

    return file;
};

const guessType = (value) => {
    if (value === '') {
        return null; // Convert empty string to null
    } else if (value === 'true' || value === 'false') {
        return value === 'true';
    } else if (!isNaN(value)) {
        return parseFloat(value);
    } else {
        return value;
    }
};

export const customImportHandler: ActionHandler<ActionResponse> = async (
    request,
    response,
    context
) => {
    console.log('called\n\n\n');
    const file = getFileFromRequest(request);
    console.log(file.path);
    const importer = getImporterByFileName(file.name);

    const fileContent = await readFile(file.path);
    const resp = await importer(fileContent.toString(), context.resource);
    console.log(resp);
    return {};
};
