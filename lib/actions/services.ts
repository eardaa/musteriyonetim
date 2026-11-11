"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseDateInput } from "@/lib/format";
import type { FormState } from "@/lib/actions/types";

function parseUcret(value: string): number | null {
  const cleaned = value.replace(",", ".").trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

export async function createService(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const customerId = String(formData.get("customerId") ?? "");
  const deviceId = String(formData.get("deviceId") ?? "") || null;
  const tarih = parseDateInput(String(formData.get("tarih") ?? ""));
  const teknisyen = String(formData.get("teknisyen") ?? "").trim();
  const yapilanIslem = String(formData.get("yapilanIslem") ?? "").trim();
  const ucret = parseUcret(String(formData.get("ucret") ?? ""));
  const not = String(formData.get("not") ?? "").trim();
  const filterIds = formData.getAll("filterIds").map(String).filter(Boolean);

  if (!customerId) return { ok: false, message: "Müşteri seçilmelidir." };
  if (!tarih) return { ok: false, message: "Servis tarihi zorunludur." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.service.create({
        data: {
          customerId,
          deviceId,
          tarih,
          teknisyen: teknisyen || null,
          yapilanIslem: yapilanIslem || null,
          ucret,
          not: not || null,
          filters: filterIds.length ? { connect: filterIds.map((id) => ({ id })) } : undefined,
        },
      });

      if (filterIds.length) {
        await tx.filter.updateMany({
          where: { id: { in: filterIds } },
          data: { sonDegisimTarihi: tarih },
        });
      }
    });
  } catch {
    return { ok: false, message: "Servis kaydedilemedi." };
  }

  revalidatePath("/servis");
  revalidatePath(`/musteri/${customerId}`);
  revalidatePath("/");
  return { ok: true, message: "Servis kaydı eklendi." };
}

export async function updateService(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  const deviceId = String(formData.get("deviceId") ?? "") || null;
  const tarih = parseDateInput(String(formData.get("tarih") ?? ""));
  const teknisyen = String(formData.get("teknisyen") ?? "").trim();
  const yapilanIslem = String(formData.get("yapilanIslem") ?? "").trim();
  const ucret = parseUcret(String(formData.get("ucret") ?? ""));
  const not = String(formData.get("not") ?? "").trim();
  const filterIds = formData.getAll("filterIds").map(String).filter(Boolean);

  if (!id) return { ok: false, message: "Geçersiz servis kaydı." };
  if (!tarih) return { ok: false, message: "Servis tarihi zorunludur." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.service.update({
        where: { id },
        data: {
          deviceId,
          tarih,
          teknisyen: teknisyen || null,
          yapilanIslem: yapilanIslem || null,
          ucret,
          not: not || null,
          filters: { set: filterIds.map((fid) => ({ id: fid })) },
        },
      });

      if (filterIds.length) {
        await tx.filter.updateMany({
          where: { id: { in: filterIds } },
          data: { sonDegisimTarihi: tarih },
        });
      }
    });
  } catch {
    return { ok: false, message: "Servis kaydı güncellenemedi." };
  }

  revalidatePath("/servis");
  revalidatePath(`/musteri/${customerId}`);
  revalidatePath("/");
  return { ok: true, message: "Servis kaydı güncellendi." };
}

export async function deleteService(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.service.delete({ where: { id } });
  revalidatePath("/servis");
  revalidatePath("/");
}
