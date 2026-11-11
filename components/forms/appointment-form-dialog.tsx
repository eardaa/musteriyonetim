"use client";

import { FormDialog } from "@/components/forms/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointments";
import { RANDEVU_DURUM_OPTIONS } from "@/lib/constants";
import { toDateTimeInputValue } from "@/lib/format";

type CustomerOption = { id: string; ad: string; soyad: string | null };

type AppointmentData = {
  id: string;
  customerId: string;
  tarih: Date | string;
  durum: string;
  not: string | null;
};

export function AppointmentFormDialog({
  customerId,
  customers,
  appointment,
  triggerLabel = "Randevu Ekle",
  triggerVariant = "default",
  triggerSize = "default",
  triggerIcon,
}: {
  customerId?: string;
  customers?: CustomerOption[];
  appointment?: AppointmentData;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  triggerSize?: "default" | "xs" | "sm" | "lg" | "icon";
  triggerIcon?: React.ReactNode;
}) {
  const isEdit = Boolean(appointment);

  return (
    <FormDialog
      action={isEdit ? updateAppointment : createAppointment}
      title={isEdit ? "Randevuyu Düzenle" : "Yeni Randevu"}
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      triggerIcon={triggerIcon}
    >
      {isEdit && <input type="hidden" name="id" value={appointment!.id} />}
      {customerId ? (
        <input type="hidden" name="customerId" value={customerId} />
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="customerId">Müşteri *</Label>
          <NativeSelect
            id="customerId"
            name="customerId"
            required
            defaultValue={appointment?.customerId}
          >
            {customers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ad} {c.soyad ?? ""}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tarih">Tarih ve Saat *</Label>
          <Input
            id="tarih"
            name="tarih"
            type="datetime-local"
            required
            defaultValue={toDateTimeInputValue(appointment?.tarih)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="durum">Durum</Label>
          <NativeSelect
            id="durum"
            name="durum"
            defaultValue={appointment?.durum ?? "BEKLIYOR"}
          >
            {RANDEVU_DURUM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="not">Not</Label>
        <Textarea id="not" name="not" defaultValue={appointment?.not ?? ""} />
      </div>
    </FormDialog>
  );
}
