const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateIncidentPDF(data, outputPath) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(outputPath));

  doc.fontSize(18).text('Incident Report', { align: 'center' });
  doc.moveDown();

  data.forEach(item => {
    doc.fontSize(12).text(`${item.timestamp}: ${item.event} at ${item.location}`);
  });

  doc.end();
}

module.exports = generateIncidentPDF;