const express = require('express');
const multer = require('multer');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const cors = require('cors');
const fs = require('fs');

const upload = multer();
const app = express();
app.use(cors());

app.get('/', (req, res) => res.json({ status: 'mock-sign-server running' }));

// POST /sign - accepts multipart/form-data with file field 'pdf'
app.post('/sign', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const pdfBytes = req.file.buffer;
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const helvFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add a small "Signed" text and rectangle on the last page
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage.getSize();

    lastPage.drawRectangle({
      x: 40,
      y: 40,
      width: 200,
      height: 60,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0.2, 0.2, 0.2),
      borderWidth: 1
    });

    lastPage.drawText(`  Sabyasachi Sahoo
        Signed by Mock Server`, {
      x: 50,
      y: 70,
      size: 12,
      font: helvFont,
      color: rgb(0.1, 0.1, 0.7)
    });

    const signedPdfBytes = await pdfDoc.save();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="signed.pdf"',
    });
    return res.send(Buffer.from(signedPdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signing failed' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Mock sign server listening on port ${port}`));
