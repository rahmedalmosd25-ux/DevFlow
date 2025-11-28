import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { TicketResponse, BookTicketRequest } from '../types/ticket.types.js';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { sendTicketEmail } from '../utils/email.js';

export const bookTicket = async (
  req: Request<{}, TicketResponse, BookTicketRequest>,
  res: Response<TicketResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { eventId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!eventId) {
      res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
      return;
    }

    // Check if event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tickets: true,
      },
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    if (event.status !== 'published') {
      res.status(400).json({
        success: false,
        message: 'Event is not published',
      });
      return;
    }

    // Check if user already has a ticket for this event
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        userId,
        eventId,
      },
    });

    if (existingTicket) {
      res.status(409).json({
        success: false,
        message: 'You already have a ticket for this event',
      });
      return;
    }

    // Check if event has available tickets
    const ticketsCount = event.tickets.length;
    if (ticketsCount >= event.quantity) {
      res.status(400).json({
        success: false,
        message: 'Event is sold out',
      });
      return;
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        userId,
        eventId,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateTime: true,
            location: true,
            image: true,
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Generate QR code data for email
    const qrData = JSON.stringify({
      ticketId: ticket.id,
      eventId: ticket.eventId,
      userId: ticket.userId,
      eventTitle: ticket.event.title,
    });

    // Send confirmation email (don't wait for it to complete)
    sendTicketEmail({
      ticketId: ticket.id,
      eventTitle: ticket.event.title,
      eventDate: ticket.event.dateTime.toISOString(),
      eventLocation: ticket.event.location,
      eventCategory: ticket.event.category,
      userName: ticket.user.name,
      userEmail: ticket.user.email,
      qrCodeData: qrData,
    }).catch((error) => {
      // Log error but don't fail the request
      console.error('Failed to send ticket email:', error);
    });

    res.status(201).json({
      success: true,
      message: 'Ticket booked successfully',
      data: {
        ticket,
      },
    });
  } catch (error) {
    console.error('Book ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getUserTickets = async (
  req: Request,
  res: Response<TicketResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Fetch all tickets for the authenticated user
    const tickets = await prisma.ticket.findMany({
      where: {
        userId,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateTime: true,
            location: true,
            image: true,
            category: true,
          },
        },
      },
      orderBy: {
        event: {
          dateTime: 'asc',
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Tickets retrieved successfully',
      data: {
        tickets,
        count: tickets.length,
      },
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getTicketQRCode = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const ticketId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Fetch ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        user: true,
      },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    // Verify ticket belongs to user
    if (ticket.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this ticket',
      });
      return;
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      ticketId: ticket.id,
      eventId: ticket.eventId,
      userId: ticket.userId,
      eventTitle: ticket.event.title,
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
    });

    res.status(200).json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        ticket: {
          id: ticket.id,
          eventTitle: ticket.event.title,
          dateTime: ticket.event.dateTime,
          location: ticket.event.location,
        },
      },
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const downloadTicketPDF = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const ticketId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Fetch ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        user: true,
      },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    // Verify ticket belongs to user
    if (ticket.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to download this ticket',
      });
      return;
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      ticketId: ticket.id,
      eventId: ticket.eventId,
      userId: ticket.userId,
      eventTitle: ticket.event.title,
    });

    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      width: 200,
      margin: 2,
    });

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket.id}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(24).text('Event Ticket', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(18).text(ticket.event.title, { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Ticket ID: ${ticket.id}`, { align: 'left' });
    doc.text(`Event Date: ${new Date(ticket.event.dateTime).toLocaleString()}`, { align: 'left' });
    doc.text(`Location: ${ticket.event.location}`, { align: 'left' });
    doc.text(`Category: ${ticket.event.category}`, { align: 'left' });
    doc.text(`Attendee: ${ticket.user.name}`, { align: 'left' });
    doc.text(`Email: ${ticket.user.email}`, { align: 'left' });
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
    console.error('Download PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
};

export const cancelTicket = async (
  req: Request<{ id: string }>,
  res: Response<TicketResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const ticketId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Fetch ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
      },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    // Verify ticket belongs to user
    if (ticket.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this ticket',
      });
      return;
    }

    // Prevent canceling if already checked in
    if (ticket.checkIn) {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel a ticket that has already been checked in',
      });
      return;
    }

    // Delete the ticket
    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    res.status(200).json({
      success: true,
      message: 'Ticket cancelled successfully',
      data: {
        ticket,
      },
    });
  } catch (error) {
    console.error('Cancel ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

