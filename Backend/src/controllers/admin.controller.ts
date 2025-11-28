import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export interface UsersResponse {
  success: boolean;
  message: string;
  data?: {
    users: any[];
    count?: number;
  };
}

export interface AllEventsResponse {
  success: boolean;
  message: string;
  data?: {
    events: any[];
    count?: number;
  };
}

export const getAllUsers = async (
  req: Request,
  res: Response<UsersResponse>
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        _count: {
          select: {
            events: true,
            tickets: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        count: users.length,
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getAllEvents = async (
  req: Request,
  res: Response<AllEventsResponse>
): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
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
      message: 'All events retrieved successfully',
      data: {
        events,
        count: events.length,
      },
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

