import pdfMake from 'pdfmake/build/pdfmake';
import vfsFonts from 'pdfmake/build/vfs_fonts';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

(pdfMake as any).vfs = vfsFonts.pdfMake.vfs;

const generateQRCode = async (data: string) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 0,
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR Code:', error);
    throw error;
  }
};

export const AWBPdfGenerator = async (pdfData: any): Promise<Buffer> => {
  try {
    const logoPath = path.join(__dirname, '../assests/logo.jpg');
    const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
    const qrCodeImage = await generateQRCode(pdfData.AWBCode);

    console.log(pdfData);

    const lineItems = (pdfData:any) => pdfData.AWBLineItems?.length
      ? pdfData.AWBLineItems.map((item: any) => [
        { text: item.numOfArticles || '', style: 'textSmallTable' },
        { text: item.lineItemDescription || '', style: 'textSmallTable' },
        { text: pdfData.invoiceValue || '', style: 'textSmallTable' },
        { text: item.AWBWeight || '', style: 'textSmallTable' },
        { text: pdfData.AWBChargedWeight || '', style: 'textSmallTable' },
        { text: pdfData.ratePerKg || '', style: 'textSmallTable' },
        { text: '', style: 'textSmallTable' },
        { text: '', style: 'textSmallTable' },
      ])
      : [[
        { text: '', style: 'textSmallTable' },
        { text: '', style: 'textSmallTable' },
        { text: '', style: 'textSmallTable' },
        { text: '', style: 'textSmallTable' },
        { text: '', style: 'textSmallTable' },
        { text: '', style: 'textSmallTable' },
        { text: '', style: 'textSmallTable' },
        { text: '', style: 'textSmallTable' },
      ]];

      const documentComponent = (pdfData: any , yPosition : number) => [
        {
          image: qrCodeImage,
          width: 50,
          absolutePosition: { x: 500, y: yPosition },
        },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  image: 'data:image/png;base64,' + logoBase64,
                  width: 100,
                  margin: [0, 0, 0, 0],
                },
                {
                  margin: [0, 0, 0, 0],
                  stack: [
                    {
                      text: [
                        { text: 'Docket No.: ', style: 'textBold' },
                        { text: pdfData.AWBCode, style: 'subHeader' },
                        { text: '\nInvoice Number: ', style: 'textBold' },
                        { text: pdfData.invoiceNumber, style: 'subHeader' },
                      ],
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: [
                        { text: `Date: ${pdfData.createdOn.toISOString().split('T')[0]}`, style: 'textBold' },
                        { text: `\n\nDest. Hub:`, style: 'textBold' },
                        { text: pdfData.finalDestinationCode, style: 'subHeader' },
                      ]
                    }
                  ]
                },
              ],
              [
                {
                  text: [
                    { text: 'NAVATA SUPPLY CHAIN SOLUTIONS PRIVATE LIMITED\n', style: 'textBold', margin: [0, 0, 20, 0] },
                    { text: 'Regd Office: ', style: 'textSmall' },
                    { text: 'Plot No. 1, Block No. 1, Autonagar, Hyderabad, Telangana - 300070\n', style: 'textSmall' },
                    { text: 'E-Mail: ', style: 'textBold' },
                    { text: 'support@navatascs.com\n\n', style: 'textSmall' },
                    { text: 'GSTIN: 36AAGCN9247F1Z7\n', style: 'textBold' },
                    { text: 'Reverse Charge: \n\n', style: 'textBold' },
                    { text: 'TAN: HYDN09618A\n', style: 'textBold' },
                    { text: 'PAN: AAGCN9247F', style: 'textBold' },
                    { text: '\n\n' },
                  ],
                },
                {
                  text: [
                    { text: '\n\nFrom\n\n', style: 'textBold', margin: [0, 0, 30, 0] },
                    { text: 'Consignor Name: ', style: 'textBold' },
                    { text: `${pdfData.consignor.legalName || ''}\n\n`, style: 'textSmall' },
                    { text: 'Consignor Address: ', style: 'textBold' },
                    { text: `${pdfData.consignor.address1 || ''}\n\n`, style: 'textSmall' },
                    { text: 'Contact Number: ', style: 'textBold' },
                    { text: `${pdfData.consignor.phone1 || ''}\n`,style: 'textSmall'},
                    { text: 'GSTIN: ', style: 'textBold' },
                    { text: `${pdfData.consignor.gstNumber || ''}\n\n`},
                  ],
                },
                {
                  text: [
                    { text: '\n\nTo ,\n\n', style: 'textBold', margin: [0, 0, 30, 0] },
                    { text: 'Consignee Name: ', style: 'textBold' },
                    { text: `${pdfData.consignee.consigneeName || ''}\n\n`, style: 'textSmall' },
                    { text: 'Consignee Address: ', style: 'textBold' },
                    { text: `${pdfData.consignee.address1 || ''}\n\n`, style: 'textSmall' },
                    { text: 'Contact Number: ', style: 'textBold' },
                    { text: `${pdfData.consignee.phone1 || ''}\n\n`,style: 'textSmall' },
                  ],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          style: 'table',
          table: {
            widths: [30, 140, 50, 35, 35, 50, 50, 50],
            headerRows: 2,
            body: [
              [
                { text: 'No. of Articles', style: 'tableHeader', alignment: 'center', rowSpan: 2 },
                { text: 'Description\n(said to contain)', style: 'tableHeader', alignment: 'center', rowSpan: 2 },
                { text: 'Value in Rs.', style: 'tableHeader', alignment: 'center', rowSpan: 2 },
                { text: 'Weight in Kgs.', style: 'tableHeader', colSpan: 2, alignment: 'center' },
                {},
                { text: 'Rate per Kg', style: 'tableHeader', alignment: 'center', rowSpan: 2 },
                { text: 'Others', style: 'tableHeader', alignment: 'center', rowSpan: 2 },
                { text: 'Total', style: 'tableHeader', alignment: 'center', rowSpan: 2 },
              ],
              [
                {}, {}, {},
                { text: 'Actual', style: 'tableHeader', alignment: 'center' },
                { text: 'Charged', style: 'tableHeader', alignment: 'center' },
                {}, {}, {},
              ],
              ...lineItems(pdfData),
            ],
          },
        },
        '\n',
        {
          text: 'Services rendered are subjected to terms and conditions mentioned over leaf.',
          fontSize: 7,
          italics: true,
          alignment: 'left',
          margin: [0, 0, 0, 0],
        },
        {
          style: 'table',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Remarks:', style: 'textSmall', alignment: 'left', margin: [0, 60, 0, 0], underline: true },
                { text: 'Stamp and Signature:', style: 'textSmall', alignment: 'left', margin: [0, 60, 0, 0], underline: true },
              ],
            ],
          },
        },
      ];
      
    const docDefinition = {
      content: [       
        documentComponent(pdfData,50),
        '\n\n\n\n',
        documentComponent(pdfData,445),     
      ],
      styles: {
        subHeader: { fontSize: 10, bold: true },
        textBold: { fontSize: 8, bold: true },
        textSmall: { fontSize: 7, bold: true },
        textSmallTable: { fontSize: 7, alignment: 'center', margin: [0, 25] },
        tableHeader: { fontSize: 8, bold: true, alignment: 'center' },
      },
    };

    const pdfDoc = (pdfMake as any).createPdf(docDefinition);
    const buffer: Uint8Array = await new Promise((resolve, reject) => {
      pdfDoc.getBuffer((buf: Uint8Array) => resolve(buf));
    });
    return Buffer.from(buffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
