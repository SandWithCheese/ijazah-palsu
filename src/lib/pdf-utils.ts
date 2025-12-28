/**
 * PDF Utilities for Digital Diploma System
 *
 * Implements specification requirement to add verification URL/QR code to diploma PDF
 * after decryption and verification.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'

/**
 * Add verification URL and QR code to a diploma PDF
 *
 * @param pdfBytes Original PDF as ArrayBuffer
 * @param verificationUrl URL to be added to the diploma
 * @param diplomaId Diploma ID for reference
 * @returns Modified PDF as ArrayBuffer
 */
export async function addVerificationUrlToPDF(
  pdfBytes: ArrayBuffer,
  verificationUrl: string,
  diplomaId: string,
): Promise<ArrayBuffer> {
  try {
    // Load the existing PDF
    const pdfDoc = await PDFDocument.load(pdfBytes)

    // Get the last page (where we'll add the URL/QR)
    const pages = pdfDoc.getPages()
    const lastPage = pages[pages.length - 1]
    const { width, height } = lastPage.getSize()

    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    // Convert data URL to PNG image
    const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl)

    // Position for QR code (bottom right corner with margin)
    const qrSize = 100
    const margin = 30
    const qrX = width - qrSize - margin
    const qrY = margin

    // Draw QR code
    lastPage.drawImage(qrCodeImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    })

    // Add text label above QR code
    const labelText = 'Verification URL:'
    const labelFontSize = 8
    const labelY = qrY + qrSize + 5

    lastPage.drawText(labelText, {
      x: qrX,
      y: labelY,
      size: labelFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    // Add the URL text above the label (truncated if too long)
    const urlFontSize = 7
    const maxUrlWidth = qrSize
    let displayUrl = verificationUrl

    // Truncate URL if too long to fit
    let urlWidth = font.widthOfTextAtSize(displayUrl, urlFontSize)
    if (urlWidth > maxUrlWidth) {
      // Try to fit by removing middle part
      const urlParts = verificationUrl.split('/')
      displayUrl = `${urlParts[0]}//${urlParts[2]}/.../${urlParts[urlParts.length - 1]}`
      urlWidth = font.widthOfTextAtSize(displayUrl, urlFontSize)

      // If still too long, just show "See QR Code"
      if (urlWidth > maxUrlWidth) {
        displayUrl = 'Scan QR code to verify'
      }
    }

    const urlY = labelY + labelFontSize + 3

    lastPage.drawText(displayUrl, {
      x: qrX,
      y: urlY,
      size: urlFontSize,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    })

    // Add diploma ID reference
    const idText = `Diploma ID: ${diplomaId}`
    const idY = qrY - 12

    lastPage.drawText(idText, {
      x: qrX,
      y: idY,
      size: 7,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    })

    // Add verification instruction
    const instructionText = 'Scan to verify authenticity'
    const instructionY = idY - 10

    lastPage.drawText(instructionText, {
      x: qrX,
      y: instructionY,
      size: 6,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    })

    // Add a subtle border around the QR section
    const borderPadding = 10
    lastPage.drawRectangle({
      x: qrX - borderPadding,
      y: instructionY - 5,
      width: qrSize + borderPadding * 2,
      height: urlY - instructionY + labelFontSize + 15,
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 0.5,
    })

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save()

    // Convert Uint8Array to ArrayBuffer
    return modifiedPdfBytes.buffer

  } catch (error) {
    console.error('Error adding verification URL to PDF:', error)
    throw new Error('Failed to add verification URL to diploma')
  }
}

/**
 * Add verification URL as a new page (alternative approach for non-PDF files)
 *
 * @param verificationUrl URL to be added
 * @param diplomaId Diploma ID
 * @returns New PDF page as ArrayBuffer
 */
export async function createVerificationPage(
  verificationUrl: string,
  diplomaId: string,
): Promise<ArrayBuffer> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Add a new page
    const page = pdfDoc.addPage([595, 842]) // A4 size
    const { width, height } = page.getSize()

    // Embed fonts
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Title
    const title = 'Digital Diploma Verification'
    const titleSize = 24
    const titleWidth = titleFont.widthOfTextAtSize(title, titleSize)
    const titleX = (width - titleWidth) / 2

    page.drawText(title, {
      x: titleX,
      y: height - 100,
      size: titleSize,
      font: titleFont,
      color: rgb(0.1, 0.3, 0.6),
    })

    // Diploma ID
    const idText = `Diploma ID: ${diplomaId}`
    const idSize = 16
    const idWidth = bodyFont.widthOfTextAtSize(idText, idSize)
    const idX = (width - idWidth) / 2

    page.drawText(idText, {
      x: idX,
      y: height - 150,
      size: idSize,
      font: bodyFont,
      color: rgb(0, 0, 0),
    })

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
    })

    const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl)

    // Center QR code
    const qrSize = 200
    const qrX = (width - qrSize) / 2
    const qrY = height / 2 - qrSize / 2

    page.drawImage(qrCodeImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    })

    // Instruction text
    const instructionText = 'Scan this QR code to verify the authenticity of this diploma'
    const instructionSize = 12
    const instructionWidth = bodyFont.widthOfTextAtSize(
      instructionText,
      instructionSize,
    )
    const instructionX = (width - instructionWidth) / 2

    page.drawText(instructionText, {
      x: instructionX,
      y: qrY - 30,
      size: instructionSize,
      font: bodyFont,
      color: rgb(0.3, 0.3, 0.3),
    })

    // URL text
    const urlSize = 10
    const urlWidth = bodyFont.widthOfTextAtSize(verificationUrl, urlSize)
    const urlX = (width - Math.min(urlWidth, width - 100)) / 2

    page.drawText(verificationUrl, {
      x: urlX,
      y: qrY - 50,
      size: urlSize,
      font: bodyFont,
      color: rgb(0.5, 0.5, 0.5),
      maxWidth: width - 100,
    })

    // Save the PDF
    const pdfBytes = await pdfDoc.save()
    return pdfBytes.buffer

  } catch (error) {
    console.error('Error creating verification page:', error)
    throw new Error('Failed to create verification page')
  }
}


