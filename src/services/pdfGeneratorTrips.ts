import pdfMake, { fonts } from 'pdfmake/build/pdfmake.js';
import vfsFonts from 'pdfmake/build/vfs_fonts.js';
import fs from 'fs';
import path from 'path';

type VfsFonts = {
    pdfMake: {
        vfs: any;
    };
};

// Set the virtual file system for pdfmake
(pdfMake as any).vfs = vfsFonts.pdfMake.vfs;

export const tripsPdfGenerator = async (pdfData: any): Promise<Buffer> => {
    const logoPath = path.join(__dirname, '../assests/logo.jpg');
    const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });

    const trip = pdfData[0]?.tripDetails;
    const tripLineItems = pdfData[0]?.tripLineItems || [];

    if (!trip) {
        throw new Error('Trip details are missing');
    }

    if (!tripLineItems.length) {
        console.warn("Warning: No trip line items found for trip ID", trip.tripId);
    }

    const docDefinition = {
        content: [
            {
                alignment: 'center',
                columns: [
                    {
                        image: 'data:image/png;base64,' + logoBase64,
                        width: 140,
                        alignment: 'right',
                        margin: [0, 0, 0, 0]
                    },
                ]
            },
            {
                margin: [0, 10, 0, 0],
                columns: [
                    {
                        width: '*',
                        stack: [
                            {
                                text: [
                                    { text: 'Trip ID: ', style: 'label' },
                                    { text: trip.tripId || '', style: 'textSmall' }
                                ],
                                margin: [0, 5, 0, 0]
                            },
                            {
                                text: [
                                    { text: 'Route: ', style: 'label' },
                                    { text: trip.route || '', style: 'textSmall' }
                                ],
                                margin: [0, 5, 0, 0]
                            },
                            {
                                text: [
                                    { text: 'Dispatch Time: ', style: 'label' },
                                ],
                                margin: [0, 5, 0, 0]
                            },

                            {
                                text: [
                                    { text: 'Load Location: ', style: 'label' },
                                    { text: tripLineItems[0].loadLocation || '', style: 'textSmall' }
                                ],
                                margin: [0, 5, 0, 0]
                            }
                            
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            {
                                text: [
                                    { text: 'Vehicle Num: ', style: 'label' },
                                    { text: trip.vehicleNum || '', style: 'textSmall' }
                                ],
                                margin: [0, 5, 0, 0]
                            },
                            {
                                text: [
                                    { text: 'Vendor Name: ', style: 'label' },
                                    { text: trip.vendorName || '', style: 'textSmall' }
                                ],
                                margin: [0, 5, 0, 0]
                            },
                            {
                                text: [
                                    { text: 'Driver Name: ', style: 'label' },
                                    { text: trip.driverName || '', style: 'textSmall' }
                                ],
                                margin: [0, 5, 0, 0]
                            },
                        ]
                    }
                ]
            },
            '\n',
            {
                style: 'table',
                color: '#444',
                table: {
                    widths: [48, 42, 45, 45, 40 , 27, 27, 30, 30, 32, 26, 30],
                    headerRows: 1,
                    body: [
                        [
                            { text: 'AWB', style: 'tableHeader', alignment: 'center' },
                            { text: 'Booking Date', style: 'tableHeader', alignment: 'center' },
                            { text: 'Consignor', style: 'tableHeader', alignment: 'center' },
                            { text: 'Consignee', style: 'tableHeader', alignment: 'center' },
                            { text: 'Unload Location', style: 'tableHeader', alignment: 'center' },
                            { text: 'AWB From', style: 'tableHeader', alignment: 'center' },
                            { text: 'AWB To', style: 'tableHeader', alignment: 'center' },
                            { text: 'No. of Articles', style: 'tableHeader', alignment: 'center' },
                            { text: 'Loaded Articles', style: 'tableHeader', alignment: 'center' },
                            { text: 'Damaged Articles', style: 'tableHeader', alignment: 'center' },
                            { text: 'Actual Wt kgs', style: 'tableHeader', alignment: 'center' },
                            { text: 'Charged Wt kgs', style: 'tableHeader', alignment: 'center' },
                        ],
                        ...tripLineItems.map((item: any) => [
                            { text: item.AWBCode || '', style: 'textSmall' },
                            { text: (item.AWBCreatedOn || '').toISOString().substring(0, 10), style: 'textSmall' },
                            { text: item.consignorName || '', style: 'textSmall' },
                            { text: item.consigneeName || '', style: 'textSmall' },
                            { text: item.unloadLocation || '', style: 'textSmall' },
                            { text: item.awbFromLocationCOde || '', style: 'textSmall' },
                            { text: item.awbToLocationCOde || '', style: 'textSmall' },
                            { text: item.numberOfArticles || '', style: 'textSmall' },
                            { text: item.numOfScan || '', style: 'textSmall' },
                            { text: item.rollupDepsCount || '', style: 'textSmall' },
                            { text: item.awbRollupActualWeighgtkgs || '', style: 'textSmall' },
                            { text: item.awbRollupChargedWeighgtkgs || '', style: 'textSmall' },
                        ])
                    ]
                },
            },
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
            },
            label: {
                fontSize: 9,
                bold: true,
            },
            tableExample: {
                margin: [0, 5, 0, 15]
            },
            tableHeader: {
                bold: true,
                fontSize: 8,
                color: 'black',
                alignment: 'center',
            },
            textSmall: {
                fontSize: 8,
                color: 'black',
            }
        },
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
