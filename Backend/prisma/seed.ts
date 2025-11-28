import { PrismaClient } from '../generated/prisma/client.js';
import { adapter } from '../prisma.config.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  adapter: adapter,
});

const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

  // Create Users
  console.log('👥 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        phone: '+1 (555) 000-0001',
        role: 'admin',
      },
    }),
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        password: hashedPassword,
        phone: '+1 (555) 000-0002',
        role: 'user',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        password: hashedPassword,
        phone: '+1 (555) 000-0003',
        role: 'user',
      },
    }),
    prisma.user.create({
      data: {
        email: 'alice.johnson@example.com',
        name: 'Alice Johnson',
        password: hashedPassword,
        phone: '+1 (555) 000-0004',
        role: 'user',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.williams@example.com',
        name: 'Bob Williams',
        password: hashedPassword,
        phone: '+1 (555) 000-0005',
        role: 'user',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create Events
  console.log('🎉 Creating events...');
  const now = new Date();
  const events = await Promise.all([
    // Published Events
    prisma.event.create({
      data: {
        userId: users[1].id, // John Doe
        title: 'Summer Music Festival',
        description: 'Join us for an amazing summer music festival featuring top artists from around the world. Food, drinks, and great music await!',
        dateTime: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        location: 'Central Park, New York',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        category: 'Festival',
        status: 'published',
        quantity: 5000,
      },
    }),
    prisma.event.create({
      data: {
        userId: users[2].id, // Jane Smith
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring talks on AI, Web3, and the future of software development.',
        dateTime: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        location: 'Convention Center, San Francisco',
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        category: 'Conference',
        status: 'published',
        quantity: 1000,
      },
    }),
    prisma.event.create({
      data: {
        userId: users[1].id, // John Doe
        title: 'Mountain Hiking Adventure',
        description: 'Explore beautiful mountain trails with experienced guides. Perfect for beginners and experienced hikers.',
        dateTime: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        location: 'Rocky Mountains, Colorado',
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
        category: 'Hiking',
        status: 'published',
        quantity: 50,
      },
    }),
    prisma.event.create({
      data: {
        userId: users[3].id, // Alice Johnson
        title: 'Beach Party Night',
        description: 'Dance the night away at our beach party! DJ, drinks, and amazing vibes.',
        dateTime: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        location: 'Miami Beach, Florida',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
        category: 'Party',
        status: 'published',
        quantity: 300,
      },
    }),
    prisma.event.create({
      data: {
        userId: users[2].id, // Jane Smith
        title: 'Board Games Tournament',
        description: 'Compete in various board games. Prizes for winners!',
        dateTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        location: 'Game Cafe, Seattle',
        image: 'https://images.unsplash.com/photo-1606166186600-53b3f6e7a0e3?w=800',
        category: 'Games',
        status: 'published',
        quantity: 100,
      },
    }),
    prisma.event.create({
      data: {
        userId: users[4].id, // Bob Williams
        title: 'European Travel Tour',
        description: 'Join us for a 10-day tour through beautiful European cities.',
        dateTime: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        location: 'Paris, France',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
        category: 'Traveling',
        status: 'published',
        quantity: 25,
      },
    }),
    // Drafted Events
    prisma.event.create({
      data: {
        userId: users[0].id, // Admin
        title: 'Winter Wonderland Party',
        description: 'A magical winter celebration (draft)',
        dateTime: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        location: 'Downtown Plaza, Chicago',
        image: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800',
        category: 'Party',
        status: 'drafted',
        quantity: 200,
      },
    }),
    prisma.event.create({
      data: {
        userId: users[1].id, // John Doe
        title: 'Gaming Championship',
        description: 'Esports tournament (draft)',
        dateTime: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
        location: 'Esports Arena, Los Angeles',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
        category: 'Games',
        status: 'drafted',
        quantity: 500,
      },
    }),
  ]);

  console.log(`✅ Created ${events.length} events`);

  // Create Tickets
  console.log('🎫 Creating tickets...');
  const tickets = await Promise.all([
    // Tickets for published events
    prisma.ticket.create({
      data: {
        userId: users[2].id, // Jane Smith
        eventId: events[0].id, // Summer Music Festival
        checkIn: false,
      },
    }),
    prisma.ticket.create({
      data: {
        userId: users[3].id, // Alice Johnson
        eventId: events[0].id, // Summer Music Festival
        checkIn: true,
        checkInAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.ticket.create({
      data: {
        userId: users[4].id, // Bob Williams
        eventId: events[1].id, // Tech Conference
        checkIn: false,
      },
    }),
    prisma.ticket.create({
      data: {
        userId: users[1].id, // John Doe
        eventId: events[2].id, // Mountain Hiking
        checkIn: false,
      },
    }),
    prisma.ticket.create({
      data: {
        userId: users[2].id, // Jane Smith
        eventId: events[3].id, // Beach Party
        checkIn: false,
      },
    }),
  ]);

  console.log(`✅ Created ${tickets.length} tickets`);

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@example.com / password123');
  console.log('   User:  john.doe@example.com / password123');
  console.log('   User:  jane.smith@example.com / password123');
  console.log('   User:  alice.johnson@example.com / password123');
  console.log('   User:  bob.williams@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

