const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://app1:5%5ES0CEpvYwC1%28%23YN1UoJ@14.225.217.232:5436/ceo1983_project'
    }
  }
});

async function run() {
  const existing = await prisma.$queryRaw`SELECT * FROM public.events LIMIT 1`;
  const current = existing[0];
  console.log('Testing event:', current.id);

  const name = 'Test Update Name';
  const tagline = 'Test Tagline';
  const safeDate = '2026-12-05';
  const location = 'Phòng họp test';
  const safeCapacity = 50;
  const type = 'forum';
  const status = 'upcoming';
  const evImg = '';
  const safeTicketPrice = 0;
  const desc = 'Test desc';
  const photoGallery = '';
  const scannersJson = '[]';
  const sponsorsJson = '[]';
  const startTime = '08:30';
  const endTime = '11:30';
  const agendaJson = '[]';
  const checkinQr = null;
  const id = current.id;

  try {
    console.log('Executing try query...');
    await prisma.$executeRaw`
      UPDATE public.events SET
        name = ${name},
        tagline = ${tagline},
        date = ${safeDate}::date,
        location = ${location},
        capacity = ${safeCapacity},
        type = ${type},
        status = ${status},
        image = ${evImg},
        banner = ${evImg},
        ticket_price = ${safeTicketPrice},
        fee = ${safeTicketPrice},
        description = ${desc},
        photo_gallery_url = ${photoGallery},
        qr_scanners = ${scannersJson}::jsonb,
        sponsors = ${sponsorsJson}::jsonb,
        start_time = ${startTime},
        end_time = ${endTime},
        agenda = ${agendaJson}::jsonb,
        checkin_qr = ${checkinQr},
        updated_at = now()
      WHERE id = ${id}
    `;
    console.log('Try query SUCCESS!');
  } catch (err1) {
    console.error('Try query FAILED:', err1.message);

    try {
      console.log('Executing catch query...');
      await prisma.$executeRaw`
        UPDATE public.events SET
          name = ${name},
          date = ${safeDate}::date,
          location = ${location},
          capacity = ${safeCapacity},
          type = ${type},
          status = ${status},
          image = ${evImg},
          banner = ${evImg},
          ticket_price = ${safeTicketPrice},
          fee = ${safeTicketPrice},
          description = ${desc},
          photo_gallery_url = ${photoGallery},
          qr_scanners = ${scannersJson}::jsonb,
          sponsors = ${sponsorsJson}::jsonb,
          start_time = ${startTime},
          end_time = ${endTime},
          agenda = ${agendaJson}::jsonb,
          checkin_qr = ${checkinQr},
          updated_at = now()
        WHERE id = ${id}
      `;
      console.log('Catch query SUCCESS!');
    } catch (err2) {
      console.error('Catch query FAILED:', err2.message);
    }
  }

  await prisma.$disconnect();
}

run().catch(console.error);

