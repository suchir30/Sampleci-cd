import pdfMake, { fonts } from 'pdfmake/build/pdfmake.js';
import vfsFonts from 'pdfmake/build/vfs_fonts.js';
import fs from 'fs';
import path from 'path';

// Set the virtual file system for pdfmake
(pdfMake as any).vfs = vfsFonts.pdfMake.vfs;

export const tripHirePdfGenerator = async (pdfData: any): Promise<Buffer> => {
    const tripHireDetails = pdfData[0];
    console.log(tripHireDetails);
    const docDefinition = {
        content: [

            [
                {
                    text: [
                        { text: `Trip Code: `, style: 'textSmallLabel', alignment: 'right', bold: true },
                        { text: ` ${tripHireDetails?.tripCode || ''}`, style: 'textSmallValue', alignment: 'right' },

                    ],
                },
                {
                    text: [
                        { text: `FTL: `, style: 'textSmallLabel', alignment: 'right', margin: [0, 0, 8, 0], bold: true },
                        { text: ` ${tripHireDetails?.FTLLocalNumber || ''}`, style: 'textSmallValue', alignment: 'right' },
                    ],
                },
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
                            {
                                text: [
                                    { text: `Vendor Office Name: `, style: 'textSmallLabel' },
                                    { text: ` ${tripHireDetails?.vendorName}`, style: 'textSmallValue' },

                                ],
                            },
                            {
                                text: [
                                    { text: `Vendor Code: `, style: 'textSmallLabel' },
                                    { text: ` ${tripHireDetails?.vendorCode}`, style: 'textSmallValue' },

                                ],
                            },
                            {
                                text: [
                                    { text: `Address: `, style: 'textSmallLabel' },
                                    { text: ` ${tripHireDetails?.vendorAddress}`, style: 'textSmallValue' },

                                ],
                            },
                            {
                                text: [
                                    { text: `Phone Number: `, style: 'textSmallLabel' },
                                    { text: ` ${tripHireDetails?.vendorPhone}`, style: 'textSmallValue' },
                                ],
                            },
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
                            {
                                text: [
                                    { text: `Station: `, style: 'textSmallLabel' },
                                    { text: `  ${tripHireDetails?.originBrnachName} -  ${tripHireDetails?.route}`, style: 'textSmallValue' },

                                ],
                            },
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            {
                                text: [
                                    { text: `Date: `, style: 'textSmallLabel', alignment: 'right' },
                                    { text: ` ${new Date().toLocaleDateString() || ''}`, style: 'textSmallValue', alignment: 'right' },
                                ],
                            },
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
                            { text: 'To,', style: 'textSmallLabel' },
                            { text: 'The Manager', style: 'textSmallLabel' },
                            { text: 'Navata Supply Chain Solutions', style: 'textSmallLabel' },
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
                            {
                                text: [
                                    { text: `Hire Amount: `, style: 'textSmallLabel' },
                                    { text: ` ${tripHireDetails?.hireAmount || ''}`, style: 'textSmallValue' },
                                ],
                            },
                            {
                                text: [
                                    { text: `TDS Amount: `, style: 'textSmallLabel' },
                                    { text: `  ${tripHireDetails?.TDSAmount || ''} `, style: 'textSmallValue' },
                                ],
                            },
                            {
                                text: [
                                    { text: `Advance Amount: `, style: 'textSmallLabel' },
                                    { text: `  ${tripHireDetails?.advanceAmount || ''} `, style: 'textSmallValue' },

                                ],
                            },
                            {
                                text: [
                                    { text: `Advance Amount: `, style: 'textSmallLabel' },
                                    { text: `  ${tripHireDetails?.advanceAmount || ''} `, style: 'textSmallValue' },
                                ],
                            },
                            {
                                text: [
                                    { text: `Loading/Unloading Charges: `, style: 'textSmallLabel' },
                                    { text: `  ${tripHireDetails?.loadingUnloadingCharges || ''} `, style: 'textSmallValue' },
                                ],
                            },
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            {
                                text: [
                                    { text: `\nBroker Name : `, style: 'textSmallLabel' },
                                    { text: ` ${tripHireDetails?.brokerName || ''}`, style: 'textSmallValue' },
                                ],
                            },
                            {
                                text: [
                                    { text: `\nBroker Phone : `, style: 'textSmallLabel' },
                                    { text: `  ${tripHireDetails?.brokerPhone || ''}`, style: 'textSmallValue' },
                                ],
                            },
                        ],
                    },
                ]
            },
            '\n',
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            {
                                text: [
                                    { text: `Lorry Number : `, style: 'textSmallLabel' },
                                    { text: ` ${tripHireDetails?.vehicleNumber || ''}`, style: 'textSmallValue' },

                                ],
                            },
                            {
                                text: [
                                    { text: `Engaged From : `, style: 'textSmallLabel' },
                                    { text: `  ${tripHireDetails?.originBrnachName || ''}`, style: 'textSmallValue' },

                                ],
                            },
                            {
                                text: [
                                    { text: `Stops : `, style: 'textSmallLabel' },
                                    { text: `  ${tripHireDetails?.stops || ''}`, style: 'textSmallValue' },

                                ],
                            },
                            {
                                text: [
                                    { text: `Engaged To: `, style: 'textSmallLabel' },
                                    { text: `  ${tripHireDetails?.route || ''} `, style: 'textSmallValue' },
                                ],
                            },
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            { text: 'CDM :', style: 'textSmallLabel' },
                            { text: 'Total Number of AirWayBills :', style: 'textSmallLabel' },
                            { text: 'Total Number of Articles :', style: 'textSmallLabel' },
                            { text: 'Total Actual Weight (Kgs) :', style: 'textSmallLabel' },
                            { text: 'Total Charged Weight (Kgs) :', style: 'textSmallLabel' },
                            {
                                text:[
                                    { text: `Lorry Hire Amount Rs : `, style: 'textSmallLabel' },
                                    { text: `  ${tripHireDetails?.hireAmount || ''} `, style: 'textSmallValue' },        
                                ],
                            },
                        ],
                        margin: [10, 0, 0, 0]

                    }
                ]
            },
            '\n',
            {
                text: [
                    { text: 'Sir,', style: 'textSmallLabel' },
                    { text: '\n' },
                    { text: 'Subject: Private Lorry Hire Fixation -', style: 'textSmallLabel', alignment: 'center' },
                    { text: '\n' },
                    { text: `Please pay the Lorry Hire Amount of Rs:_____ ${tripHireDetails?.hireAmount || ''}_____ after unloading the consignments which are in sound condition at your end and tallying with the particulars furnished below:`, style: 'textSmallLabel', alignment: 'left' },
                ]
            },
            '\n',
            {
                columns: [
                    {
                        width: '50%',
                        stack: [
                            { text: `Driver Name :  ${tripHireDetails?.driverName || ''}`, style: 'textSmallValue' },
                            // { text: '\n' },
                            { text: `Driver Address:  ${tripHireDetails?.driverAddress || ''}`, style: 'textSmallValue' },
                            { text: `Driver Phone No. :  ${tripHireDetails?.driverPhone || ''}`, style: 'textSmallValue' },
                            { text: '\n' },
                            { text: `Owner Name:  ${tripHireDetails?.vehicleOwnerName || ''}`, style: 'textSmallValue' },
                            // { text: '\n' },
                            { text: `Owner Address:  ${tripHireDetails?.vechicleOwnerAddress || ''}`, style: 'textSmallValue' },
                            { text: `Owner Phone No. :  ${tripHireDetails?.vechicleOwnerPhone || ''}`, style: 'textSmallValue' },
                        ],
                    },
                    {
                        width: '*',
                        stack: [
                            { text: `Driver License Number: ${tripHireDetails?.driverlicenseNumber || ''} `, style: 'textSmallLabel' },
                            { text: `Driver License Exp. Date:  ${tripHireDetails?.driverlicenseExpiryDate.toISOString().substring(0, 10) || ''}`, style: 'textSmallLabel' },
                            { text: `Place of Issue:  ${tripHireDetails?.placeOfIssueRTA || ''}`, style: 'textSmallLabel' },
                            { text: `Lorry Make & Model:  ${tripHireDetails?.vehicleType || ''}`, style: 'textSmallLabel' },
                            { text: `Engine Number:  ${tripHireDetails?.engineNumber || ''}`, style: 'textSmallLabel' },
                            { text: `Chassis Number:  ${tripHireDetails?.chassisNumber || ''}`, style: 'textSmallLabel' },
                            { text: `Insurance Valid Date:  ${tripHireDetails?.insuranceValidDate.toISOString().substring(0, 10) || ''}`, style: 'textSmallLabel' },
                            { text: `Owner PAN Card No:  ${tripHireDetails?.vehicleOwnerPANCardNumber || ''}`, style: 'textSmallLabel' },
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
                            { text: 'Opening :', style: 'textSmallValue' , margin: [80, 0, 0, 0] },
                            { text: 'Meter reading -', style: 'textSmallValue' },
                            { text: 'Closing :', style: 'textSmallValue', margin: [80, 0, 0, 0] },
                        ],

                    },
                    {
                        width: '*',
                        stack: [
                            { text: 'Departure :', style: 'textSmallLabel' },
                            { text: 'Expected Arrival Time :', style: 'textSmallLabel' },
                            { text: 'Actual Reaching Date & Time :', style: 'textSmallLabel' },
                            { text: 'Difference between Expected vs Actual :', style: 'textSmallLabel' },
                        ],
                        margin: [10, 0, 0, 0],
                    },
                ]
            },
           ' \n',
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'Signature of driver :', style: 'textSmallValue'  },
                            { text: 'Signature of Loading clerk :', style: 'textSmallValue' },
                            { text: 'Signature of unloading clerk :', style: 'textSmallValue' },
                        ],

                    },
                    {
                        width: '*',
                        stack: [
                            { text: 'Signature of cleaner :', style: 'textSmallLabel' },
                            { text: 'Signature of clerk who prepared this hire letter:', style: 'textSmallLabel' },
                            { text: 'Signature of verified after unloading :', style: 'textSmallLabel' },
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
            textSmallValue: {
                fontSize: 11,
                color: 'black',
            },
            textSmallLabel: {
                fontSize: 11,
                color: 'black',
                // margin: [0, 0, 10, 0],
                // alignment: 'right',
            }
        }
    };

    try {
        const pdfDoc = (pdfMake as any).createPdf(docDefinition);
        const buffer: Uint8Array = await new Promise((resolve, reject) => {
            pdfDoc.getBuffer((buf: Uint8Array) => {
                resolve(buf);
            });
        });
        console.log("PDF generated");
        return Buffer.from(buffer);
    } catch (error) {
        console.error("Error generating or uploading PDF:", error);
        throw error;
    }
};
