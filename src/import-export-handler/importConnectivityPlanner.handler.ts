import { ActionHandler, ActionResponse } from 'adminjs';
import fs from 'fs';
import util from 'util';
import { connectivityPlanData } from '../types/connectivityDataType.js';
import csv from 'csvtojson';
import { parse } from 'json2csv';

import { getFileFromRequest } from './utils.js';
import { insertConnectivityPlan } from '../services/tripService.js';

const readFile = util.promisify(fs.readFile);

export const importConnectivityPlannerHandler: ActionHandler<ActionResponse> = async (
  request,
  response,
  context
) => {
  try {
    const file = getFileFromRequest(request);

    const fileContent = await readFile(file.path);
    const records = await csv().fromString(fileContent.toString());

    const backendResponse = await insertConnectivityPlan(records as connectivityPlanData[]);

    const csvExporter = (data: any) => {
      return parse(data.responseObjects);
    };

    const exportedData = csvExporter(backendResponse);

    return {
      succeeded: true,
      notice: {
        message: 'Import successful. Downloading results...',
        type: 'success',
      },
      exportedData: exportedData,
      filename: `connectivity-plan-results-${Date.now()}.csv`,
    };

  } catch (error) {
    console.error('Error during import: ', error);
    return {
      succeeded: false,
      notice: {
        message: 'There was an error during the import process',
        type: 'error',
      },
    };
  }
};