import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from 'pdfmake/build/vfs_fonts';
import fs from 'fs';
import path from 'path';
import {handleFileUpload, uploadPDF, UploadResult} from "./fileService";
import {MulterFile} from "../types/multerTypes";

import QRCode from 'qrcode';

type VfsFonts = {
    pdfMake: {
        vfs: any;
    };
};

(pdfMake as any).vfs = vfsFonts.pdfMake.vfs;

 const generateQRCode = async (data: string) => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(data, {
            errorCorrectionLevel: 'H',
            margin: 0,
        }); // generate base64 QR code
        return qrCodeDataUrl;
    } catch (error) {
        console.error('Error generating QR Code:', error);
    }
}

export const AWBPdfGenerator = async (pdfData: any): Promise<Buffer> => {
    const logoPath = path.join(__dirname, '../assests/logo.jpg');
    const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });

    const docDefinition = {
        content: [
            {

                image: await generateQRCode(pdfData.AWBCode),
                width: 70,
                absolutePosition: { x: 475, y: 30 },
                border: [true, true, true, true],
                borderColor: 'black',
                borderWidth: 1,
            },
            {

                table: {
                    widths: ['*', '*', '*'],
                    body: [
                        [
                            {
                                image: 'data:image/png;base64,' + logoBase64,
                                width: 140
                            },
                            {
                                margin: [0, 0, 20, 0],
                                stack: [
                                    {
                                        text: [
                                            {text: `Date: ${pdfData.createdOn.toISOString().split('T')[0]}`, style: 'textSmall' },
                                            {text: '\n\nDocket No.: ', style: 'textSmall'},
                                            {text: `${pdfData.AWBCode}\n`, style: 'subHeader'},
                                        ],
                                    }
                                ],
                            },
                            {
                                stack: [
                                    {

                                    }
                                ],
                            },
                        ],
                        [
                            {
                                stack: [
                                    { text: 'NAVATA SUPPLY CHAIN SOLUTIONS PRIVATE LIMITED', style: 'subHeader' },
                                ],
                                margin: [0, 0, 20, 0],
                            },
                            {
                                margin: [0, 0, 20, 0],
                                stack: [
                                    { text: 'Consignor Details', style: 'subHeader' },
                                ],
                            },
                            {
                                stack: [
                                    { text: 'Consignee Details', style: 'subHeader' },
                                ],
                            },
                        ],
                        [
                            {
                                stack: [
                                    {
                                        text: [
                                            { text: 'Regd Office: ', style: 'textBold' },
                                            { text: 'Plot No. 1, Block No. 1, Autonagar, Hyderabad, Telangana - 300070\n\n', style: 'textSmall' },
                                        ],
                                    },
                                    {
                                        text: [
                                            { text: 'E-Mail: ', style: 'textBold' },
                                            { text: 'support@navatascs.com\n\n', style: 'textSmall' },
                                        ],
                                    },
                                ],
                                margin: [0, 0, 20, 0],
                            },
                            {
                                margin: [0, 0, 20, 0],
                                stack: [
                                    {
                                        text: [
                                            { text: 'Name: ', style: 'textBold' },
                                            { text: `${pdfData.consignor.legalName}\n\n`, style: 'textSmall' },
                                        ],
                                    },
                                ],
                            },
                            {
                                stack: [
                                    {
                                        text: [
                                            { text: 'Name: ', style: 'textBold' },
                                            { text: `${pdfData.consignee.consigneeName}\n\n`, style: 'textSmall' },
                                        ],
                                    },
                                ],
                            },
                        ],
                        [
                            {
                                stack: [
                                    {
                                        text: [
                                            { text: 'GSTIN: ', style: 'textBold' },
                                            { text: '36AAGCN9247F127\n', style: 'textSmall' },
                                        ],
                                    },
                                    {
                                        text: [
                                            { text: 'TAN: ', style: 'textBold' },
                                            { text: 'HYDN09618A\n', style: 'textSmall' },
                                        ],
                                    },
                                    {
                                        text: [
                                            { text: 'PAN: ', style: 'textBold' },
                                            { text: 'HYDN09618A\n', style: 'textSmall' },
                                        ],
                                    },
                                ],
                                margin: [0, 0, 20, 0],
                            },
                            {
                                margin: [0, 0, 20, 0],
                                stack: [
                                    {
                                        text: [
                                            { text: 'Address: ', style: 'textBold' },
                                            { text: `${pdfData.consignor.address1}\n\n`, style: 'textSmall' },
                                        ],
                                    },
                                ],
                            },
                            {
                                stack: [
                                    {
                                        text: [
                                            { text: 'Address: ', style: 'textBold' },
                                            { text: `${pdfData.consignee.address1}\n\n`, style: 'textSmall' },
                                        ],
                                    },
                                ],
                            },
                        ],
                        [
                            {
                                stack: [

                                ],
                                margin: [0, 0, 20, 0],
                            },
                            {
                                margin: [0, 0, 20, 0],
                                stack: [
                                    {
                                        text: [
                                            { text: 'Contact Number: ', style: 'textBold' },
                                            { text: '000000000\n\n', style: 'textSmall' },
                                        ],
                                    },
                                ],
                            },
                            {
                                stack: [
                                    {
                                        text: [
                                            { text: 'Contact Number: ', style: 'textBold' },
                                            { text: `${pdfData.consignee.phone1}, ${pdfData.consignee.phone2}\n\n`, style: 'textSmall' },
                                        ],
                                    },
                                ],
                            },
                        ],
                        [
                            {  width: '*',
                                stack:[
                                    {
                                        text: [
                                            { text: 'Invoice No.: ', style: 'textBold' },
                                            {text: `${pdfData.invoiceNumber}\n\n`, style: 'textSmall' },
                                            { text: 'Invocie Value: ', style: 'textBold' },
                                            { text: `${pdfData.invoiceValue}\n\n`, style: 'textSmall' },
                                        ],
                                    },
                                ],
                                margin: [0, 0, 20, 0],
                            },
                            {
                                margin: [0, 0, 20, 0],
                                stack: [
                                    {
                                        text: [
                                            { text: 'From Hub: ', style: 'textBold' },
                                            { text: `${pdfData.fromBranch.branchCode}\n\n`, style: 'textSmall' },
                                        ],
                                    },
                                ],
                            },
                            {
                                stack: [
                                    {
                                        text: [
                                            { text: 'To Hub: ', style: 'textBold' },
                                            { text: `${pdfData.toBranch.branchCode}\n\n`, style: 'textSmall' },
                                        ],
                                    },
                                ],
                            },
                        ],

                    ]
                },
                layout: 'noBorders',
                margin: [0, 20, 0, 20],
            },
            '\n',
            {
                style: 'table',
                color: '#444',
                table: {
                    widths: [150, 35, 45, 45, 45, 45, 90],
                    headerRows: 2,
                    body: [
                        [
                            {
                                text: 'Description\n(said to contain)',
                                style: 'tableHeader',
                                rowSpan: 2,
                                alignment: 'center'
                            },
                            {text: 'No. of Articles', style: 'tableHeader', rowSpan: 2, alignment: 'center'},
                            //{text: 'Value in Rs.', style: 'tableHeader', rowSpan: 2, alignment: 'center'},
                            {text: 'Weight in Kgs.', style: 'tableHeader', colSpan: 2, alignment: 'center'},
                            {},
                            {text: 'Rate per Kg', style: 'tableHeader', rowSpan: 2, alignment: 'center'},
                            {text: 'others', style: 'tableHeader', rowSpan: 2, alignment: 'center'},
                            {text: 'Total', style: 'tableHeader', rowSpan: 2, alignment: 'center'},
                        ],
                        [
                            {},
                            {},
                           // {},
                            {text: 'Actual', style: 'tableHeader', alignment: 'center'},
                            {text: 'Charged', style: 'tableHeader', alignment: 'center'},
                            {},
                            {},
                            {},
                        ],
                        ...pdfData.AWBLineItems.map((item: any) => [
                            // Dynamically add rows based on pdfData
                            { text: item.lineItemDescription, style: 'textSmall' },
                            { text: item.numOfArticles, style: 'textSmall' },
                            //{ text: '500', style: 'textSmall' },
                            { text: item.ActualWeightKg, style: 'textSmall' }, // Actual weight
                            { text: item.chargedWeight, style: 'textSmall' }, // Charged weight
                            { text: pdfData.ratePerKg, style: 'textSmall' },
                            { text: 'NULL', style: 'textSmall' },
                            { text: 'Billed HO', style: 'textSmall' },
                        ]),
                        [{text: 'Grand Total:', style: 'textSmall'},
                            {text: `${pdfData.numOfArticles}`, style: 'textSmall'},
                            {text: 1, style: 'textSmall'},
                            {text: 1, style: 'textSmall'}, {
                            text: 1,
                            style: 'textSmall'
                        },
                            {text: 1, style: 'textSmall'}, {text: 1, style: 'textSmall'}
                        ],

                    ]
                },

            },

        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            subHeader: {
                fontSize: 8,
                bold: true,
                margin: [0, 10, 0, 5]
            },
            textBold: {
                fontSize: 7,
                color: 'black',
                bold: true,
            },
            table: {
                margin: [0, 5, 0, 15]
            },
            tableHeader: {
                bold: true,
                fontSize: 8,
                color: 'black',
                alignment: 'center',
            },
            textSmall: {
                fontSize: 7,
                color: 'black',
            }
        },
        defaultStyle: {
            // alignment: 'justify'
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
