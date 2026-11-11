"use client";

import { FormDialog } from "@/components/forms/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { createDevice, updateDevice } from "@/lib/actions/devices";
import { CIHAZ_TIPI_OPTIONS } from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";

type DeviceData = {
  id: string;
  marka: string;
  model: string;
  seriNo: string | null;
  cihazTipi: string;
  kurulumTarihi: Date | string;
  not: string | null;
};

export function DeviceFormDialog({
  customerId,
  device,
  triggerLabel = "Cihaz Ekle",
}: {
  customerId: string;
  device?: DeviceData;
  triggerLabel?: string;
}) {
  const isEdit = Boolean(device);

  return (
    <FormDialog
      action={isEdit ? updateDevice : createDevice}
      title={isEdit ? "Cihazı Düzenle" : "Yeni Cihaz"}
      triggerLabel={triggerLabel}
    >
      <input type="hidden" name="customerId" value={customerId} />
      {isEdit && <input type="hidden" name="id" value={device!.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="marka">Marka *</Label>
          <Input id="marka" name="marka" required defaultValue={device?.marka} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model">Model *</Label>
          <Input id="model" name="model" required defaultValue={device?.model} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="seriNo">Seri No</Label>
          <Input id="seriNo" name="seriNo" defaultValue={device?.seriNo ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cihazTipi">Cihaz Tipi</Label>
          <NativeSelect
            id="cihazTipi"
            name="cihazTipi"
            defaultValue={device?.cihazTipi ?? "DIGER"}
          >
            {CIHAZ_TIPI_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="kurulumTarihi">Kurulum Tarihi *</Label>
        <Input
          id="kurulumTarihi"
          name="kurulumTarihi"
          type="date"
          required
          defaultValue={toDateInputValue(device?.kurulumTarihi)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="not">Not</Label>
        <Textarea id="not" name="not" defaultValue={device?.not ?? ""} />
      </div>
    </FormDialog>
  );
}
