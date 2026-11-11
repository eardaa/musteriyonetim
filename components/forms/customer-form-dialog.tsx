"use client";

import { FormDialog } from "@/components/forms/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCustomer, updateCustomer } from "@/lib/actions/customers";

type CustomerData = {
  id: string;
  ad: string;
  soyad: string | null;
  telefon: string;
  email: string | null;
  adres: string | null;
  not: string | null;
};

export function CustomerFormDialog({
  customer,
  triggerLabel,
  triggerVariant = "default",
  triggerSize = "default",
  triggerIcon,
}: {
  customer?: CustomerData;
  triggerLabel: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  triggerSize?: "default" | "xs" | "sm" | "lg" | "icon";
  triggerIcon?: React.ReactNode;
}) {
  const isEdit = Boolean(customer);

  return (
    <FormDialog
      action={isEdit ? updateCustomer : createCustomer}
      title={isEdit ? "Müşteriyi Düzenle" : "Yeni Müşteri"}
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      triggerIcon={triggerIcon}
    >
      {isEdit && <input type="hidden" name="id" value={customer!.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ad">Ad *</Label>
          <Input id="ad" name="ad" required defaultValue={customer?.ad} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="soyad">Soyad</Label>
          <Input id="soyad" name="soyad" defaultValue={customer?.soyad ?? ""} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="telefon">Telefon *</Label>
        <Input
          id="telefon"
          name="telefon"
          required
          defaultValue={customer?.telefon}
          placeholder="05xx xxx xx xx"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={customer?.email ?? ""}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="adres">Adres</Label>
        <Textarea id="adres" name="adres" defaultValue={customer?.adres ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="not">Not</Label>
        <Textarea id="not" name="not" defaultValue={customer?.not ?? ""} />
      </div>
    </FormDialog>
  );
}
