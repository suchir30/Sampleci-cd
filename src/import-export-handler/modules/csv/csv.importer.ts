import csv from 'csvtojson';
import { saveRecords } from '../../utils.js';
const convertValue = (value, type) => {
  if (value === '') {
    return null;
  }

  switch (type) {
    case 'Int':
      return parseInt(value, 10);
    case 'Float':
      return parseFloat(value);
    case 'Boolean':
      return value.toLowerCase() === 'true';
    case 'String':
    default:
      return value;
  }
};
export const csvImporter = async (csvString, resource) => {
  const records = await csv().fromString(csvString);
  console.log(records);
  const fieldTypes = {};
  const modelName = resource.model;
  console.log(modelName);
  resource.model.fields.forEach(field => {
    fieldTypes[field.name] = field.type;
  });

  const typedRecords = records.map(row => {
    const typedRow = {};
    for (const key in row) {
      if (row.hasOwnProperty(key) && fieldTypes[key]) {
        typedRow[key] = convertValue(row[key], fieldTypes[key]);
      } else {
        typedRow[key] = row[key];
      }
    }
    return typedRow;
  });
  return saveRecords(typedRecords, resource);
}