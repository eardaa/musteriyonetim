"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseDateInput } from "@/lib/format";
import type { FormState } from "@/lib/actions/types";
import type { RandevuDurum } from "@/lib/generated/prisma/enums";

export async function createAppointment(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const customerId = String(formData.get("customerId") ?? "");
  const tarih = parseDateInput(String(formData.get("tarih") ?? ""));
  const durum = (formData.get("durum") ?? "BEKLIYOR") as RandevuDurum;
  const not = String(formData.get("not") ?? "").trim();

  if (!customerId) return { ok: false, message: "Müşteri seçilmelidir." };
  if (!tarih) return { ok: false, message: "Randevu tarihi zorunludur." };

  try {
    await prisma.appointment.create({
      data: { customerId, tarih, durum, not: not || null },
    });
  } catch {
    return { ok: false, message: "Randevu oluşturulamadı." };
  }

  revalidatePath("/randevu");
  revalidatePath(`/musteri/${customerId}`);
  revalidatePath("/");
  return { ok: true, message: "Randevu oluşturuldu." };
}

export async function updateAppointment(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  const tarih = parseDateInput(String(formData.get("tarih") ?? ""));
  const durum = (formData.get("durum") ?? "BEKLIYOR") as RandevuDurum;
  const not = String(formData.get("not") ?? "").trim();

  if (!id) return { ok: false, message: "Geçersiz randevu." };
  if (!tarih) return { ok: false, message: "Randevu tarihi zorunludur." };

  try {
    await prisma.appointment.update({
      where: { id },
      data: { tarih, durum, not: not || null },
    });
  } catch {
    return { ok: false, message: "Randevu güncellenemedi." };
  }

  revalidatePath("/randevu");
  revalidatePath(`/musteri/${customerId}`);
  revalidatePath("/");
  return { ok: true, message: "Randevu güncellendi." };
}

export async function updateAppointmentStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const durum = String(formData.get("durum") ?? "") as RandevuDurum;
  if (!id || !durum) return;
  await prisma.appointment.update({ where: { id }, data: { durum } });
  revalidatePath("/randevu");
}

export async function deleteAppointment(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/randevu");
  revalidatePath("/");
}
