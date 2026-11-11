"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseDateInput } from "@/lib/format";
import type { FormState } from "@/lib/actions/types";
import type { OdemeYontemi } from "@/lib/generated/prisma/enums";

function parseTutar(value: string): number | null {
  const cleaned = value.replace(",", ".").trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isNaN(num) ? null : num;
}

export async function createPayment(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const customerId = String(formData.get("customerId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "") || null;
  const tutar = parseTutar(String(formData.get("tutar") ?? ""));
  const tarih = parseDateInput(String(formData.get("tarih") ?? ""));
  const odemeYontemi = (formData.get("odemeYontemi") ?? "NAKIT") as OdemeYontemi;
  const not = String(formData.get("not") ?? "").trim();

  if (!customerId) return { ok: false, message: "Müşteri seçilmelidir." };
  if (tutar === null) return { ok: false, message: "Geçerli bir tutar girin." };
  if (!tarih) return { ok: false, message: "Ödeme tarihi zorunludur." };

  try {
    await prisma.payment.create({
      data: {
        customerId,
        serviceId,
        tutar,
        tarih,
        odemeYontemi,
        not: not || null,
      },
    });
  } catch {
    return { ok: false, message: "Ödeme kaydedilemedi." };
  }

  revalidatePath("/odeme");
  revalidatePath(`/musteri/${customerId}`);
  revalidatePath("/");
  return { ok: true, message: "Ödeme kaydedildi." };
}

export async function updatePayment(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "") || null;
  const tutar = parseTutar(String(formData.get("tutar") ?? ""));
  const tarih = parseDateInput(String(formData.get("tarih") ?? ""));
  const odemeYontemi = (formData.get("odemeYontemi") ?? "NAKIT") as OdemeYontemi;
  const not = String(formData.get("not") ?? "").trim();

  if (!id) return { ok: false, message: "Geçersiz ödeme." };
  if (tutar === null) return { ok: false, message: "Geçerli bir tutar girin." };
  if (!tarih) return { ok: false, message: "Ödeme tarihi zorunludur." };

  try {
    await prisma.payment.update({
      where: { id },
      data: {
        serviceId,
        tutar,
        tarih,
        odemeYontemi,
        not: not || null,
      },
    });
  } catch {
    return { ok: false, message: "Ödeme güncellenemedi." };
  }

  revalidatePath("/odeme");
  revalidatePath(`/musteri/${customerId}`);
  revalidatePath("/");
  return { ok: true, message: "Ödeme güncellendi." };
}

export async function deletePayment(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.payment.delete({ where: { id } });
  revalidatePath("/odeme");
  revalidatePath("/");
}
