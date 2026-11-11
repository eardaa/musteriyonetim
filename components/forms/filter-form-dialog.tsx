"use client";

import { FormDialog } from "@/components/forms/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFilter, updateFilter } from "@/lib/actions/devices";
import { toDateInputValue } from "@/lib/format";

type FilterData = {
  id: string;
  ad: string;
  degisimPeriyoduAy: number;
  sonDegisimTarihi: Date | string | null;
  not: string | null;
};

export function FilterFormDialog({
  deviceId,
  customerId,
  filter,
  triggerLabel = "Filtre Ekle",
}: {
  deviceId: string;
  customerId: string;
  filter?: FilterData;
  triggerLabel?: string;
}) {
  const isEdit = Boolean(filter);

  return (
    <FormDialog
      action={isEdit ? updateFilter : createFilter}
      title={isEdit ? "Filtreyi Düzenle" : "Yeni Filtre"}
      triggerLabel={triggerLabel}
      triggerVariant="outline"
      triggerSize="sm"
    >
      <input type="hidden" name="deviceId" value={deviceId} />
      <input type="hidden" name="customerId" value={customerId} />
      {isEdit && <input type="hidden" name="id" value={filter!.id} />}
      <div className="space-y-1.5">
        <Label htmlFor="ad">Filtre Adı *</Label>
        <Input
          id="ad"
          name="ad"
          required
          defaultValue={filter?.ad}
          placeholder="Örn. Karbon Filtre"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="degisimPeriyoduAy">Değişim Periyodu (ay)</Label>
          <Input
            id="degisimPeriyoduAy"
            name="degisimPeriyoduAy"
            type="number"
            min={1}
            defaultValue={filter?.degisimPeriyoduAy ?? 6}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sonDegisimTarihi">Son Değişim Tarihi</Label>
          <Input
            id="sonDegisimTarihi"
            name="sonDegisimTarihi"
            type="date"
            defaultValue={toDateInputValue(filter?.sonDegisimTarihi)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="not">Not</Label>
        <Textarea id="not" name="not" defaultValue={filter?.not ?? ""} />
      </div>
    </FormDialog>
  );
}
