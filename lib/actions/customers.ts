"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/actions/types";

export async function createCustomer(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const ad = String(formData.get("ad") ?? "").trim();
  const soyad = String(formData.get("soyad") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const adres = String(formData.get("adres") ?? "").trim();
  const not = String(formData.get("not") ?? "").trim();

  if (!ad) return { ok: false, message: "Müşteri adı zorunludur." };
  if (!telefon) return { ok: false, message: "Telefon numarası zorunludur." };

  try {
    await prisma.customer.create({
      data: {
        ad,
        soyad: soyad || null,
        telefon,
        email: email || null,
        adres: adres || null,
        not: not || null,
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { ok: false, message: "Bu telefon numarası zaten kayıtlı." };
    }
    return { ok: false, message: "Müşteri kaydedilemedi." };
  }

  revalidatePath("/musteri");
  return { ok: true, message: "Müşteri eklendi." };
}

export async function updateCustomer(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const ad = String(formData.get("ad") ?? "").trim();
  const soyad = String(formData.get("soyad") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const adres = String(formData.get("adres") ?? "").trim();
  const not = String(formData.get("not") ?? "").trim();

  if (!id) return { ok: false, message: "Geçersiz müşteri." };
  if (!ad) return { ok: false, message: "Müşteri adı zorunludur." };
  if (!telefon) return { ok: false, message: "Telefon numarası zorunludur." };

  try {
    await prisma.customer.update({
      where: { id },
      data: {
        ad,
        soyad: soyad || null,
        telefon,
        email: email || null,
        adres: adres || null,
        not: not || null,
      },
    });
  } catch {
    return { ok: false, message: "Müşteri güncellenemedi." };
  }

  revalidatePath("/musteri");
  revalidatePath(`/musteri/${id}`);
  return { ok: true, message: "Müşteri güncellendi." };
}

export async function deleteCustomer(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/musteri");
}
