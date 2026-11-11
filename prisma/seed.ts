import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function monthsAgo(months: number): Date {
  return addMonths(new Date(), -months);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const existing = await prisma.customer.count();
  if (existing > 0) {
    console.log("Veritabanında zaten kayıt var, seed atlandı.");
    return;
  }

  const ahmet = await prisma.customer.create({
    data: {
      ad: "Ahmet",
      soyad: "Yılmaz",
      telefon: "0532 111 22 33",
      email: "ahmet@ornek.com",
      adres: "Atatürk Mah. 12. Sokak No:5, Kadıköy/İstanbul",
      not: "Her ayın ilk haftası müsait.",
    },
  });

  const mehmet = await prisma.customer.create({
    data: {
      ad: "Mehmet",
      soyad: "Demir",
      telefon: "0542 333 44 55",
      adres: "Cumhuriyet Cad. No:88, Çankaya/Ankara",
    },
  });

  const ayse = await prisma.customer.create({
    data: {
      ad: "Ayşe",
      soyad: "Kaya",
      telefon: "0505 555 66 77",
      email: "ayse@ornek.com",
      adres: "Deniz Mah. Sahil Yolu No:3, Konak/İzmir",
    },
  });

  const device1 = await prisma.device.create({
    data: {
      customerId: ahmet.id,
      marka: "Aqua",
      model: "RO-100",
      seriNo: "AQ-2024-001",
      cihazTipi: "TEZGAH_ALTI",
      kurulumTarihi: monthsAgo(18),
    },
  });

  const device2 = await prisma.device.create({
    data: {
      customerId: mehmet.id,
      marka: "Pure",
      model: "P-200",
      cihazTipi: "POMPALI",
      kurulumTarihi: monthsAgo(12),
    },
  });

  await prisma.filter.createMany({
    data: [
      {
        deviceId: device1.id,
        ad: "Sediment Filtre",
        degisimPeriyoduAy: 6,
        sonDegisimTarihi: addDays(addMonths(new Date(), -6), -31), // 31 gün gecikmiş
      },
      {
        deviceId: device1.id,
        ad: "Karbon Filtre",
        degisimPeriyoduAy: 6,
        sonDegisimTarihi: addDays(addMonths(new Date(), -6), 15), // 15 gün kaldı
      },
      {
        deviceId: device1.id,
        ad: "Membran",
        degisimPeriyoduAy: 24,
        sonDegisimTarihi: monthsAgo(18),
      },
      {
        deviceId: device2.id,
        ad: "Sediment Filtre",
        degisimPeriyoduAy: 6,
        sonDegisimTarihi: monthsAgo(2),
      },
    ],
  });

  const filters1 = await prisma.filter.findMany({
    where: { deviceId: device1.id },
  });

  const servis1 = await prisma.service.create({
    data: {
      customerId: ahmet.id,
      deviceId: device1.id,
      tarih: monthsAgo(1),
      teknisyen: "Ali Usta",
      yapilanIslem: "Filtre değişimi ve genel bakım",
      ucret: 450,
      filters: {
        connect: filters1.slice(0, 2).map((f) => ({ id: f.id })),
      },
    },
  });

  await prisma.service.create({
    data: {
      customerId: mehmet.id,
      deviceId: device2.id,
      tarih: monthsAgo(2),
      yapilanIslem: "Sediment filtre değişimi",
      ucret: 200,
    },
  });

  await prisma.payment.create({
    data: {
      customerId: ahmet.id,
      serviceId: servis1.id,
      tutar: 450,
      tarih: monthsAgo(1),
      odemeYontemi: "KREDI_KARTI",
    },
  });

  await prisma.appointment.create({
    data: {
      customerId: ayse.id,
      tarih: addMonths(new Date(), 3),
      durum: "BEKLIYOR",
      not: "Kurulum için gelecek",
    },
  });

  await prisma.appointment.create({
    data: {
      customerId: mehmet.id,
      tarih: addMonths(new Date(), 10 / 1440), // yarın
      durum: "BEKLIYOR",
      not: "Bakım randevusu",
    },
  });

  console.log("Örnek veriler eklendi.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
