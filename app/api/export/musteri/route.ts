import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  CIHAZ_TIPI_LABELS,
  ODEME_YONTEMI_LABELS,
  RANDEVU_DURUM_LABELS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CellValue = string | number | null | undefined;

function fmtDate(value: Date | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${d.getFullYear()}`;
}

function fmtDateTime(value: Date | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${fmtDate(d)} ${hh}:${mm}`;
}

function money(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function buildSheet(
  ws: ExcelJS.Worksheet,
  headers: string[],
  widths: number[],
  rows: CellValue[][]
) {
  ws.addRow(headers);
  rows.forEach((row) => ws.addRow(row));
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };
  ws.views = [{ state: "frozen", ySplit: 1 }];
}

export async function GET() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      devices: { include: { filters: true }, orderBy: { createdAt: "asc" } },
      services: { include: { filters: true }, orderBy: { tarih: "desc" } },
      payments: { orderBy: { tarih: "desc" } },
      appointments: { orderBy: { tarih: "desc" } },
    },
  });

  const customerName = (id: string) => {
    const c = customers.find((x) => x.id === id);
    return c ? `${c.ad} ${c.soyad ?? ""}`.trim() : "";
  };
  const deviceLabel = (id: string | null | undefined) => {
    if (!id) return "";
    for (const c of customers) {
      const d = c.devices.find((x) => x.id === id);
      if (d) return `${d.marka} ${d.model}`.trim();
    }
    return "";
  };

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Kale Su Arıtma";
  workbook.created = new Date();

  const musteriSheet = workbook.addWorksheet("Müşteriler");
  buildSheet(
    musteriSheet,
    [
      "Ad",
      "Soyad",
      "Telefon",
      "E-posta",
      "Adres",
      "Not",
      "Cihaz Sayısı",
      "Toplam Servis Ücreti",
      "Toplam Ödeme",
      "Bakiye",
      "Kayıt Tarihi",
    ],
    [15, 15, 16, 25, 30, 30, 13, 20, 20, 20, 14],
    customers.map((c) => {
      const billed = c.services.reduce(
        (sum, s) => sum + Number(s.ucret ?? 0),
        0
      );
      const paid = c.payments.reduce((sum, p) => sum + Number(p.tutar ?? 0), 0);
      return [
        c.ad,
        c.soyad ?? "",
        c.telefon,
        c.email ?? "",
        c.adres ?? "",
        c.not ?? "",
        c.devices.length,
        billed,
        paid,
        billed - paid,
        fmtDate(c.createdAt),
      ];
    })
  );

  const cihazSheet = workbook.addWorksheet("Cihazlar");
  buildSheet(
    cihazSheet,
    [
      "Müşteri",
      "Telefon",
      "Marka",
      "Model",
      "Seri No",
      "Cihaz Tipi",
      "Kurulum Tarihi",
      "Not",
    ],
    [25, 16, 15, 15, 15, 15, 14, 30],
    customers.flatMap((c) =>
      c.devices.map((d) => [
        customerName(c.id),
        c.telefon,
        d.marka,
        d.model,
        d.seriNo ?? "",
        CIHAZ_TIPI_LABELS[d.cihazTipi],
        fmtDate(d.kurulumTarihi),
        d.not ?? "",
      ])
    )
  );

  const filtreSheet = workbook.addWorksheet("Filtreler");
  buildSheet(
    filtreSheet,
    [
      "Müşteri",
      "Cihaz",
      "Filtre Adı",
      "Değişim Periyodu (Ay)",
      "Son Değişim Tarihi",
      "Not",
    ],
    [25, 20, 20, 20, 16, 30],
    customers.flatMap((c) =>
      c.devices.flatMap((d) =>
        d.filters.map((f) => [
          customerName(c.id),
          `${d.marka} ${d.model}`.trim(),
          f.ad,
          f.degisimPeriyoduAy,
          fmtDate(f.sonDegisimTarihi),
          f.not ?? "",
        ])
      )
    )
  );

  const servisSheet = workbook.addWorksheet("Servisler");
  buildSheet(
    servisSheet,
    [
      "Müşteri",
      "Cihaz",
      "Tarih",
      "Teknisyen",
      "Yapılan İşlem",
      "Filtreler",
      "Ücret",
      "Not",
    ],
    [25, 20, 14, 20, 30, 25, 14, 30],
    customers.flatMap((c) =>
      c.services.map((s) => [
        customerName(c.id),
        deviceLabel(s.deviceId),
        fmtDate(s.tarih),
        s.teknisyen ?? "",
        s.yapilanIslem ?? "",
        s.filters.map((f) => f.ad).join(", "),
        money(s.ucret),
        s.not ?? "",
      ])
    )
  );

  const odemeSheet = workbook.addWorksheet("Ödemeler");
  buildSheet(
    odemeSheet,
    ["Müşteri", "Telefon", "Tarih", "Yöntem", "Tutar", "Not"],
    [25, 16, 14, 15, 14, 30],
    customers.flatMap((c) =>
      c.payments.map((p) => [
        customerName(c.id),
        c.telefon,
        fmtDate(p.tarih),
        ODEME_YONTEMI_LABELS[p.odemeYontemi],
        money(p.tutar),
        p.not ?? "",
      ])
    )
  );

  const randevuSheet = workbook.addWorksheet("Randevular");
  buildSheet(
    randevuSheet,
    ["Müşteri", "Telefon", "Tarih", "Durum", "Not"],
    [25, 16, 18, 15, 30],
    customers.flatMap((c) =>
      c.appointments.map((a) => [
        customerName(c.id),
        c.telefon,
        fmtDateTime(a.tarih),
        RANDEVU_DURUM_LABELS[a.durum],
        a.not ?? "",
      ])
    )
  );

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `musteriler-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
