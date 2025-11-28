import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { EventResponse, CreateEventRequest, UpdateEventRequest } from '../types/event.types.js';

export const getPublishedEvents = async (
  req: Request,
  res: Response<EventResponse>
): Promise<void> => {
  try {
    // Fetch all published events with user information
    const events = await prisma.event.findMany({
      where: {
        status: 'published',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc', // Order by date, upcoming events first
      },
    });

    res.status(200).json({
      success: true,
      message: 'Published events retrieved successfully',
      data: {
        events,
        count: events.length,
      },
    });
  } catch (error) {
    console.error('Get published events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createEvent = async (
  req: Request<{}, EventResponse, CreateEventRequest>,
  res: Response<EventResponse>
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

    const { title, description, dateTime, location, image, category, status, quantity } = req.body;

    // Validate required fields
    if (!title || !dateTime || !location || !category || !quantity) {
      res.status(400).json({
        success: false,
        message: 'Title, dateTime, location, category, and quantity are required',
      });
      return;
    }

    // Validate quantity
    if (quantity <= 0) {
      res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      });
      return;
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        userId,
        title,
        description: description || null,
        dateTime: new Date(dateTime),
        location,
        image: image || null,
        category,
        status: status || 'drafted',
        quantity,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event,
      },
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getUserEvents = async (
  req: Request,
  res: Response<EventResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Admin can see all events, regular users see only their events
    const whereClause = userRole === 'admin' ? {} : { userId };

    // Fetch all events for the authenticated user (or all events if admin)
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      message: 'User events retrieved successfully',
      data: {
        events,
        count: events.length,
      },
    });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getEventById = async (
  req: Request<{ id: string }, EventResponse>,
  res: Response<EventResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const eventId = req.params.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Fetch event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Allow admin to access any event, or user to access their own event
    if (event.userId !== userId && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this event',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: {
        event,
      },
    });
  } catch (error) {
    console.error('Get event by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getEventTickets = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const eventId = req.params.id;

    // Fetch event to verify it exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Fetch all tickets for this event with user information
    const tickets = await prisma.ticket.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Event tickets retrieved successfully',
      data: {
        tickets: tickets.map(ticket => ({
          id: ticket.id,
          userId: ticket.userId,
          eventId: ticket.eventId,
          checkIn: ticket.checkIn,
          checkInAt: ticket.checkInAt,
          user: ticket.user,
        })),
        count: tickets.length,
      },
    });
  } catch (error) {
    console.error('Get event tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateEvent = async (
  req: Request<{ id: string }, EventResponse, UpdateEventRequest>,
  res: Response<EventResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const eventId = req.params.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Allow admin to update any event, or user to update their own event
    const userRole = req.user?.role;
    if (existingEvent.userId !== userId && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this event',
      });
      return;
    }

    const { title, description, dateTime, location, image, category, status, quantity } = req.body;

    // Build update data object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dateTime !== undefined) updateData.dateTime = new Date(dateTime);
    if (location !== undefined) updateData.location = location;
    if (image !== undefined) updateData.image = image;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (quantity !== undefined) {
      if (quantity <= 0) {
        res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0',
        });
        return;
      }
      updateData.quantity = quantity;
    }

    // Update event
    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event,
      },
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const deleteEvent = async (
  req: Request<{ id: string }, EventResponse>,
  res: Response<EventResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const eventId = req.params.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Allow admin to delete any event, or user to delete their own event
    const userRole = req.user?.role;
    if (existingEvent.userId !== userId && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this event',
      });
      return;
    }

    // Delete event (cascade will handle related tickets)
    await prisma.event.delete({
      where: { id: eventId },
    });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

