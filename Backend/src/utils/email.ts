import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

dotenv.config();

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create transporter
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth,
});

interface TicketEmailData {
  ticketId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventCategory: string;
  userName: string;
  userEmail: string;
  qrCodeData: string;
}

/**
 * Generate PDF ticket
 */
export const generateTicketPDF = async (ticketData: TicketEmailData): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate QR code buffer
      const qrCodeBuffer = await QRCode.toBuffer(ticketData.qrCodeData, {
        width: 200,
        margin: 2,
      });

      // Create PDF
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Add content to PDF
      doc.fontSize(24).text('Event Ticket', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(18).text(ticketData.eventTitle, { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12);
      doc.text(`Ticket ID: ${ticketData.ticketId}`, { align: 'left' });
      doc.text(`Event Date: ${ticketData.eventDate}`, { align: 'left' });
      doc.text(`Location: ${ticketData.eventLocation}`, { align: 'left' });
      doc.text(`Category: ${ticketData.eventCategory}`, { align: 'left' });
      doc.text(`Attendee: ${ticketData.userName}`, { align: 'left' });
      doc.text(`Email: ${ticketData.userEmail}`, { align: 'left' });
      doc.moveDown();

      // Add QR code image
      doc.image(qrCodeBuffer, {
        fit: [200, 200],
        align: 'center',
      });

      doc.moveDown();
      doc.fontSize(10).fillColor('gray').text('Scan QR code for check-in', { align: 'center' });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate QR code as data URL
 */
export const generateQRCodeDataURL = async (data: string): Promise<string> => {
  return await QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
  });
};

/**
 * Send ticket confirmation email
 */
export const sendTicketEmail = async (ticketData: TicketEmailData): Promise<void> => {
  try {
    // Verify transporter configuration
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('SMTP credentials not configured. Skipping email send.');
      return;
    }

    // Generate QR code for email
    const qrCodeDataURL = await generateQRCodeDataURL(ticketData.qrCodeData);

    // Generate PDF ticket
    const pdfBuffer = await generateTicketPDF(ticketData);

    // Format date
    const eventDate = new Date(ticketData.eventDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    // HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Event Ticket</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎫 Your Event Ticket</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #667eea; margin-top: 0;">${ticketData.eventTitle}</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="margin: 10px 0;"><strong>Ticket ID:</strong> ${ticketData.ticketId}</p>
              <p style="margin: 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
              <p style="margin: 10px 0;"><strong>Location:</strong> ${ticketData.eventLocation}</p>
              <p style="margin: 10px 0;"><strong>Category:</strong> ${ticketData.eventCategory}</p>
              <p style="margin: 10px 0;"><strong>Attendee:</strong> ${ticketData.userName}</p>
            </div>



            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px;"><strong>📎 Attached:</strong> Your ticket PDF is attached to this email. You can download and print it for easy access at the event.</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; font-size: 12px; margin: 0;">We look forward to seeing you at the event!</p>
              <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">If you have any questions, please contact the event organizer.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version
    const textContent = `
Your Event Ticket

${ticketData.eventTitle}

Ticket ID: ${ticketData.ticketId}
Date & Time: ${formattedDate}
Location: ${ticketData.eventLocation}
Category: ${ticketData.eventCategory}
Attendee: ${ticketData.userName}

Your ticket PDF is attached to this email. You can download and print it for easy access at the event.

We look forward to seeing you at the event!
    `;

    // Send email
    const mailOptions = {
      from: `"Event App" <${emailConfig.auth.user}>`,
      to: ticketData.userEmail,
      subject: `Your Ticket for ${ticketData.eventTitle}`,
      text: textContent,
      html: htmlContent,
      attachments: [
        {
          filename: `ticket-${ticketData.ticketId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Ticket email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending ticket email:', error);
    // Don't throw error - email failure shouldn't break ticket booking
    // Just log the error and continue
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      return false;
    }
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
};

