"use client";

import { FormDialog } from "@/components/forms/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { createPayment, updatePayment } from "@/lib/actions/payments";
import { ODEME_YONTEMI_OPTIONS } from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";

type CustomerOption = { id: string; ad: string; soyad: string | null };

type PaymentData = {
  id: string;
  customerId: string;
  tutar: number | string;
  tarih: Date | string;
  odemeYontemi: string;
  not: string | null;
};

export function PaymentFormDialog({
  customerId,
  customers,
  payment,
  triggerLabel = "Ödeme Ekle",
  triggerVariant = "default",
  triggerSize = "default",
  triggerIcon,
}: {
  customerId?: string;
  customers?: CustomerOption[];
  payment?: PaymentData;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  triggerSize?: "default" | "xs" | "sm" | "lg" | "icon";
  triggerIcon?: React.ReactNode;
}) {
  const isEdit = Boolean(payment);

  return (
    <FormDialog
      action={isEdit ? updatePayment : createPayment}
      title={isEdit ? "Ödemeyi Düzenle" : "Yeni Ödeme"}
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      triggerIcon={triggerIcon}
    >
      {isEdit && <input type="hidden" name="id" value={payment!.id} />}
      {customerId ? (
        <input type="hidden" name="customerId" value={customerId} />
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="customerId">Müşteri *</Label>
          <NativeSelect
            id="customerId"
            name="customerId"
            required
            defaultValue={payment?.customerId}
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
          <Label htmlFor="tutar">Tutar (₺) *</Label>
          <Input
            id="tutar"
            name="tutar"
            inputMode="decimal"
            required
            defaultValue={payment ? String(Number(payment.tutar)) : ""}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tarih">Ödeme Tarihi *</Label>
          <Input
            id="tarih"
            name="tarih"
            type="date"
            required
            defaultValue={toDateInputValue(payment?.tarih)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="odemeYontemi">Ödeme Yöntemi</Label>
        <NativeSelect
          id="odemeYontemi"
          name="odemeYontemi"
          defaultValue={payment?.odemeYontemi ?? "NAKIT"}
        >
          {ODEME_YONTEMI_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="not">Not</Label>
        <Textarea id="not" name="not" defaultValue={payment?.not ?? ""} />
      </div>
    </FormDialog>
  );
}
