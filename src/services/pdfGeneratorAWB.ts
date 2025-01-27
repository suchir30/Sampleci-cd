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

    const documentComponent = (pdfData: any, yPosition: number) => [
      {
        image: qrCodeImage,
        width: 60,
        absolutePosition: { x: 495, y: yPosition },
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
                      { text: 'Docket No.: ', style: 'textSmall' },
                      { text: pdfData.AWBCode, style: 'subHeader' },
                      { text: '\nInvoice Number: ', style: 'textSmall' },
                      { text: pdfData.invoiceNumber, style: 'subHeader' },
                    ],
                  },
                ],
              },
              {
                stack: [
                  {
                    text: [
                      { text: `Date: `, style: 'textSmall' },
                      { text: `${pdfData.createdOn.toISOString().split('T')[0]}`, style: 'textBold' },
                      { text: `\n\nDest. Hub: `, style: 'textSmall' },
                      { text: pdfData.toBranch?.branchCode, style: 'subHeader' },
                    ]
                  }
                ]
              },
            ],
            [
              {
                text: [
                  { text: 'NAVATA SUPPLY CHAIN SOLUTIONS Pvt. Ltd\n', style: 'textBold', margin: [0, 0, 20, 0] },
                  { text: 'Regd Office: ', style: 'textBold' },
                  { text: 'Plot No. 1, Block No. 1, Autonagar, Hyderabad, Telangana - 300070\n', style: 'textSmall' },
                  { text: 'E-Mail: ', style: 'textBold' },
                  { text: 'support@navatascs.com\n\n', style: 'textSmall' },
                  { text: 'GSTIN: ', style: 'textBold' },
                  { text: '36AAGCN9247F1Z7\n', style: 'textSmall' },
                  { text: `Reverse Charge: `, style: 'textBold' },
                  { text: `${pdfData?.reverseCharge || ''} \n\n`, style: 'textSmall' },
                  { text: 'TAN: ', style: 'textBold' },
                  { text: 'HYDN09618A\n', style: 'textSmall' },
                  { text: 'PAN: ', style: 'textBold' },
                  { text: 'AAGCN9247F', style: 'textSmall' },
                  { text: '\n\n' },
                ],
              },
              {
                text: [
                  { text: '\n\nFrom ,\n\n', style: 'textSmall', margin: [0, 0, 30, 0] },
                  { text: 'Consignor Name: ', style: 'textSmall' },
                  { text: `${pdfData.consignor.legalName || ''}\n\n`, style: 'textBold' },
                  { text: 'Consignor Address: ', style: 'textSmall' },
                  { text: `${pdfData.consignor.address1.slice(0, 20) || ''}\n\n`, style: 'textBold' },
                  { text: 'Contact Number: ', style: 'textSmall' },
                  { text: `${pdfData.consignor.phone1 || ''}\n`, style: 'textBold' },
                  { text: 'GSTIN: ', style: 'textSmall' },
                  { text: `${pdfData.consignor.gstNumber || ''}\n\n`, style: 'textBold'},
                ],
              },
              {
                text: [
                  { text: '\n\nTo ,\n\n', style: 'textSmall', margin: [0, 0, 30, 0] },
                  { text: 'Consignee Name: ', style: 'textSmall' },
                  { text: `${pdfData.consignee.consigneeName || ''}\n\n`, style: 'textBold' },
                  { text: 'Consignee Address: ', style: 'textSmall' },
                  { text: `${pdfData.consignee.address1.slice(0, 20) || ''}\n\n`, style: 'textBold' },
                  { text: 'Contact Number: ', style: 'textSmall' },
                  { text: `${pdfData.consignee.phone1 || ''}\n\n`, style: 'textBold' },
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
            [
              { text: pdfData.numOfArticles || '', style: 'textSmallTable' },
              { text: pdfData.lineItemDescription || '', style: 'textSmallTable' },
              { text: pdfData.invoiceValue || '', style: 'textSmallTable' },
              { text: pdfData.AWBWeight || '', style: 'textSmallTable' },
              { text: pdfData.AWBChargedWeight || '', style: 'textSmallTable' },
              { text: pdfData.ratePerKg || '', style: 'textSmallTable' },
              { text: '', style: 'textSmallTable' },
              { text: '', style: 'textSmallTable' },
            ],
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
              { text: 'Remarks:', style: 'textBold', alignment: 'left', margin: [0, 60, 0, 0] },
              { text: 'Stamp and Signature:', style: 'textBold', alignment: 'left', margin: [0, 60, 0, 0] },
            ],
          ],
        },
      },
    ];

    const docDefinition = {
      content: [
        documentComponent(pdfData, 35),
        '\n\n\n\n',
        documentComponent(pdfData, 420),
      ],
      styles: {
        subHeader: { fontSize: 10, bold: true },
        textBold: { fontSize: 8, bold: true },
        textSmall: { fontSize: 7 },
        textSmallTable: { fontSize: 8, alignment: 'center', margin: [0, 20], bold: true },
        tableHeader: { fontSize: 7, alignment: 'center' },
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
