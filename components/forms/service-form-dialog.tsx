"use client";

import { useState } from "react";
import { FormDialog } from "@/components/forms/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { createService, updateService } from "@/lib/actions/services";
import { toDateTimeInputValue } from "@/lib/format";

export type ServiceDeviceOption = {
  id: string;
  marka: string;
  model: string;
  filters: { id: string; ad: string }[];
};

export type ServiceCustomerOption = {
  id: string;
  ad: string;
  soyad: string | null;
  devices: ServiceDeviceOption[];
};

type ServiceData = {
  id: string;
  customerId: string;
  deviceId: string | null;
  tarih: Date | string;
  teknisyen: string | null;
  yapilanIslem: string | null;
  ucret: number | string | null;
  not: string | null;
  filters: { id: string }[];
};

export function ServiceFormDialog({
  customers,
  service,
  triggerLabel = "Yeni Servis",
  triggerVariant = "default",
  triggerSize = "default",
  triggerIcon,
}: {
  customers: ServiceCustomerOption[];
  service?: ServiceData;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  triggerSize?: "default" | "xs" | "sm" | "lg" | "icon";
  triggerIcon?: React.ReactNode;
}) {
  const isEdit = Boolean(service);
  const [customerId, setCustomerId] = useState(
    service?.customerId ?? customers[0]?.id ?? ""
  );
  const [deviceId, setDeviceId] = useState(service?.deviceId ?? "");

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const devices = selectedCustomer?.devices ?? [];
  const selectedDevice = devices.find((d) => d.id === deviceId);
  const filterIds = service?.filters.map((f) => f.id) ?? [];

  return (
    <FormDialog
      action={isEdit ? updateService : createService}
      title={isEdit ? "Servisi Düzenle" : "Yeni Servis Kaydı"}
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      triggerIcon={triggerIcon}
      className="sm:max-w-lg"
    >
      {isEdit && <input type="hidden" name="id" value={service!.id} />}
      <div className="space-y-1.5">
        <Label htmlFor="customerId">Müşteri *</Label>
        <NativeSelect
          id="customerId"
          name="customerId"
          value={customerId}
          onChange={(e) => {
            setCustomerId(e.target.value);
            setDeviceId("");
          }}
          required
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.ad} {c.soyad ?? ""}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deviceId">Cihaz</Label>
        <NativeSelect
          id="deviceId"
          name="deviceId"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          <option value="">Cihaz seçilmedi</option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.marka} {d.model}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tarih">Servis Tarihi *</Label>
          <Input
            id="tarih"
            name="tarih"
            type="datetime-local"
            required
            defaultValue={toDateTimeInputValue(service?.tarih)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="teknisyen">Teknisyen</Label>
          <Input
            id="teknisyen"
            name="teknisyen"
            defaultValue={service?.teknisyen ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="yapilanIslem">Yapılan İşlem</Label>
        <Textarea
          id="yapilanIslem"
          name="yapilanIslem"
          defaultValue={service?.yapilanIslem ?? ""}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ucret">Ücret (₺)</Label>
        <Input
          id="ucret"
          name="ucret"
          inputMode="decimal"
          defaultValue={
            service?.ucret != null ? String(Number(service.ucret)) : ""
          }
          placeholder="0.00"
        />
      </div>

      {selectedDevice && selectedDevice.filters.length > 0 && (
        <div className="space-y-1.5">
          <Label>Değişen Filtreler</Label>
          <div className="space-y-1 rounded-lg border p-3">
            {selectedDevice.filters.map((f) => (
              <label
                key={f.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="filterIds"
                  value={f.id}
                  defaultChecked={filterIds.includes(f.id)}
                  className="size-4 rounded border-input"
                />
                {f.ad}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="not">Not</Label>
        <Textarea id="not" name="not" defaultValue={service?.not ?? ""} />
      </div>
    </FormDialog>
  );
}
