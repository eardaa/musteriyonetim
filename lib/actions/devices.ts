"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseDateInput } from "@/lib/format";
import type { FormState } from "@/lib/actions/types";
import type { CihazTipi } from "@/lib/generated/prisma/enums";

export async function createDevice(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const customerId = String(formData.get("customerId") ?? "");
  const marka = String(formData.get("marka") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const seriNo = String(formData.get("seriNo") ?? "").trim();
  const cihazTipi = (formData.get("cihazTipi") ?? "DIGER") as CihazTipi;
  const kurulumTarihi = parseDateInput(String(formData.get("kurulumTarihi") ?? ""));
  const not = String(formData.get("not") ?? "").trim();

  if (!customerId) return { ok: false, message: "Müşteri seçilmelidir." };
  if (!marka) return { ok: false, message: "Cihaz markası zorunludur." };
  if (!model) return { ok: false, message: "Cihaz modeli zorunludur." };
  if (!kurulumTarihi) return { ok: false, message: "Kurulum tarihi zorunludur." };

  try {
    await prisma.device.create({
      data: {
        customerId,
        marka,
        model,
        seriNo: seriNo || null,
        cihazTipi,
        kurulumTarihi,
        not: not || null,
      },
    });
  } catch {
    return { ok: false, message: "Cihaz kaydedilemedi." };
  }

  revalidatePath(`/musteri/${customerId}`);
  return { ok: true, message: "Cihaz eklendi." };
}

export async function updateDevice(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  const marka = String(formData.get("marka") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const seriNo = String(formData.get("seriNo") ?? "").trim();
  const cihazTipi = (formData.get("cihazTipi") ?? "DIGER") as CihazTipi;
  const kurulumTarihi = parseDateInput(String(formData.get("kurulumTarihi") ?? ""));
  const not = String(formData.get("not") ?? "").trim();

  if (!id) return { ok: false, message: "Geçersiz cihaz." };
  if (!marka || !model) return { ok: false, message: "Marka ve model zorunludur." };
  if (!kurulumTarihi) return { ok: false, message: "Kurulum tarihi zorunludur." };

  try {
    await prisma.device.update({
      where: { id },
      data: {
        marka,
        model,
        seriNo: seriNo || null,
        cihazTipi,
        kurulumTarihi,
        not: not || null,
      },
    });
  } catch {
    return { ok: false, message: "Cihaz güncellenemedi." };
  }

  revalidatePath(`/musteri/${customerId}`);
  return { ok: true, message: "Cihaz güncellendi." };
}

export async function deleteDevice(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  if (!id) return;
  await prisma.device.delete({ where: { id } });
  revalidatePath(`/musteri/${customerId}`);
}

export async function createFilter(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const deviceId = String(formData.get("deviceId") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  const ad = String(formData.get("ad") ?? "").trim();
  const degisimPeriyoduAy = Number(formData.get("degisimPeriyoduAy") ?? "6");
  const sonDegisimTarihi = parseDateInput(String(formData.get("sonDegisimTarihi") ?? ""));
  const not = String(formData.get("not") ?? "").trim();

  if (!deviceId) return { ok: false, message: "Cihaz seçilmelidir." };
  if (!ad) return { ok: false, message: "Filtre adı zorunludur." };
  if (!degisimPeriyoduAy || degisimPeriyoduAy < 1)
    return { ok: false, message: "Değişim periyodu geçersiz." };

  try {
    await prisma.filter.create({
      data: {
        deviceId,
        ad,
        degisimPeriyoduAy,
        sonDegisimTarihi,
        not: not || null,
      },
    });
  } catch {
    return { ok: false, message: "Filtre kaydedilemedi." };
  }

  revalidatePath(`/musteri/${customerId}`);
  return { ok: true, message: "Filtre eklendi." };
}

export async function updateFilter(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  const ad = String(formData.get("ad") ?? "").trim();
  const degisimPeriyoduAy = Number(formData.get("degisimPeriyoduAy") ?? "6");
  const sonDegisimTarihi = parseDateInput(String(formData.get("sonDegisimTarihi") ?? ""));
  const not = String(formData.get("not") ?? "").trim();

  if (!id) return { ok: false, message: "Geçersiz filtre." };
  if (!ad) return { ok: false, message: "Filtre adı zorunludur." };

  try {
    await prisma.filter.update({
      where: { id },
      data: {
        ad,
        degisimPeriyoduAy,
        sonDegisimTarihi,
        not: not || null,
      },
    });
  } catch {
    return { ok: false, message: "Filtre güncellenemedi." };
  }

  revalidatePath(`/musteri/${customerId}`);
  return { ok: true, message: "Filtre güncellendi." };
}

export async function deleteFilter(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const customerId = String(formData.get("customerId") ?? "");
  if (!id) return;
  await prisma.filter.delete({ where: { id } });
  revalidatePath(`/musteri/${customerId}`);
}
