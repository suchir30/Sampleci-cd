import pdfMake, { fonts } from 'pdfmake/build/pdfmake.js';
import vfsFonts from 'pdfmake/build/vfs_fonts.js';
import fs from 'fs';
import path from 'path';

// Set the virtual file system for pdfmake
(pdfMake as any).vfs = vfsFonts.pdfMake.vfs;

export const tripHirePdfGenerator = async (pdfData: any): Promise<string> => {
    const tripHireDetails = pdfData[0];
    const docDefinition = {
        content: [

            [
                { text: `Trip Code:  ${tripHireDetails.tripCode || ''}`, style: 'textSmallRight', alignment: 'right', bold: true},
                { text: `FTL:  ${tripHireDetails.FTLLocalNumber || ''}`, style: 'textSmallRight', alignment: 'right', bold: true,margin: [0, 0, 8, 0] },
                { text: '\n' },
            ],
            {
                text: 'Navata Supply Chain Solutions',
                style: 'header',
                alignment: 'center',
                margin: [0, 0, 0, 20]
            },
            {
                columns: [
                    {
                        width: '90%',
                        stack: [
                            { text: `Vendor Office Name:  ${tripHireDetails.vendorName}`, style: 'textSmallLeft' },
                            { text: `Address:  ${tripHireDetails.vendorAddress || ''}`, style: 'textSmallLeft' },
                            { text: `Phone Number:  ${tripHireDetails.vendorPhone || ''}`, style: 'textSmallLeft' },
                        ]
                    },
                ]
            },
            '\n\n',
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: `Station:  ${tripHireDetails.originBrnachName} -  ${tripHireDetails.route}`, style: 'textSmallLeft' },
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            { text: `Date:  ${new Date().toLocaleDateString()}`, style: 'textSmallRight', alignment: 'right' },
                        ]
                    },
                ]
            },
            '\n',
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'To,', style: 'textSmallLeft' },
                            { text: '\n' },
                            { text: 'The Manager', style: 'textSmallLeft' },
                            { text: 'Navata Supply Chain Solutions', style: 'textSmallLeft' },
                        ]
                    },
                ]
            },
            '\n\n',
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: `Hire Amount:  ${tripHireDetails.hireAmount || ''} `, style: 'textSmallLeft'},
                            { text: `TDS Amount:  ${tripHireDetails.TDSAmount || ''} `, style: 'textSmallLeft'},
                            { text: `Advance Amount:  ${tripHireDetails.advanceAmount || ''} `, style: 'textSmallLeft'},
                            { text: `Balance Amount:  ${tripHireDetails.balanceAmount || ''}`, style: 'textSmallLeft'},
                        ]
                    },
                ]
            },
            '\n\n',
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: `Lorry Number:  ${tripHireDetails.vehicleNum || ''}`, style: 'textSmallLeft' },
                            { text: `Engaged From:  ${tripHireDetails.originBrnachName || ''}`, style: 'textSmallLeft' },
                            { text: `Engaged To:  ${tripHireDetails.route || ''} `, style: 'textSmallLeft' },
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            { text: 'Total Number of AirWayBills:', style: 'textSmallRight' },
                            { text: 'Total Number of Articles:', style: 'textSmallRight' },
                            { text: 'Total Actual Weight (Kgs):', style: 'textSmallRight' },
                            { text: 'Total Charged Weight (Kgs):', style: 'textSmallRight' },
                            { text: `Lorry Hire Amount Rs:  ${tripHireDetails.hireAmount || ''} `, style: 'textSmallRight' },
                        ],
                        margin: [10, 0, 0, 0]
                        
                    }
                ]
            },
            '\n',
            {
                text: [
                    { text: 'Sir,', style: 'textSmallLeft' },
                    { text: '\n' },
                    { text: 'Subject: Private Lorry Hire Fixation -', style: 'textSmallLeft', alignment: 'center' },
                    { text: '\n' },
                    { text: `Please pay the Lorry Hire Amount of Rs:_____ ${tripHireDetails.hireAmount || ''}_____ after unloading the consignments which are in sound condition at your end and tallying with the particulars furnished below:`, style: 'textSmallLeft', alignment: 'left' },
                ]
            },
            '\n\n',
            {
                columns: [
                    {
                        width: '50%',
                        stack: [
                            { text: `Driver Name:  ${tripHireDetails.driverName || ''}`, style: 'textSmallLeft' },
                            // { text: '\n' },
                            { text: `Driver Address:  ${tripHireDetails.driverAddress || ''}`, style: 'textSmallLeft' },
                            { text: '\n' },
                            { text: `Owner Name:  ${tripHireDetails.vehicleOwnerName || ''}`, style: 'textSmallLeft' },
                            // { text: '\n' },
                            { text: `Owner Address:  ${tripHireDetails.vechicleOwnerAddress || ''}`, style: 'textSmallLeft' },
                        ],
                    },
                    {
                        width: '*',
                        stack: [
                            { text: `Driver License Number:  ${tripHireDetails.driverlicenseNumber || ''}`, style: 'textSmallRight' },
                            { text: `Driver License Exp. Date:  ${tripHireDetails.driverlicenseExpiryDate.toISOString().substring(0, 10) || ''}`, style: 'textSmallRight' },
                            { text: `Place of Issue:  ${tripHireDetails.placeOfIssueRTA || ''}`, style: 'textSmallRight' },
                            { text: `Lorry Make & Model:  ${tripHireDetails.vehicleType || ''}`, style: 'textSmallRight' },
                            { text: `Engine Number:  ${tripHireDetails.engineNumber || ''}`, style: 'textSmallRight' },
                            { text: `Chassis Number:  ${tripHireDetails.chassisNumber || ''}`, style: 'textSmallRight' },
                            { text: `Insurance Valid Date:  ${tripHireDetails.insuranceValidDate.toISOString().substring(0, 10) || ''}`, style: 'textSmallRight' },
                            { text: `Owner PAN Card No:  ${tripHireDetails.vehicleOwnerPANCardNumber || ''}`, style: 'textSmallRight' },
                        ],
                        margin: [10, 0, 0, 0],
                    },
                ]
            },
            '\n\n',
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'Meter reading : Opening :', style: 'textSmallLeft' },
                            { text: '\n' },
                            { text: 'Meter reading : Closing :', style: 'textSmallLeft'},
                        ],

                    },
                    {
                        width: '*',
                        stack: [
                            { text: 'Departure :', style: 'textSmallRight' },
                            { text: 'Expected Arrival Time :', style: 'textSmallRight' },
                            { text: 'Actual Reaching Date & Time :', style: 'textSmallRight' },
                            { text: 'Difference between Expected vs Actual :', style: 'textSmallRight' },
                        ],
                        margin: [10, 0, 0, 0],
                    },
                ]
            }
        ],
        styles: {
            header: {
                fontSize: 14,
                bold: true,
            },
            textSmallLeft: {
                fontSize: 11,
                color: 'black',
            },
            textSmallRight: {
                fontSize: 11,
                color: 'black',
                // margin: [0, 0, 10, 0],
                // alignment: 'right',
            }
        }
    };

    return new Promise<string>((resolve, reject) => {
        const pdfDoc = (pdfMake as any).createPdf(docDefinition);
        pdfDoc.getBuffer((buffer: Uint8Array) => {
            const relativePath = path.join(process.env.UPLOAD_DIR || 'uploads', 'TripHireLetter', `Trip Hire Letter.pdf`);
            const filePath = path.join(__dirname, '..', '..', relativePath);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFile(filePath, Buffer.from(buffer), (err) => {
                if (err) {
                    return reject(err);
                }

                resolve(relativePath);
            });
        });
    });
};
