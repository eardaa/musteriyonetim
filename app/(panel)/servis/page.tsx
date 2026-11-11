import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate, formatTL } from "@/lib/format";
import { ServiceFormDialog } from "@/components/forms/service-form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { deleteService } from "@/lib/actions/services";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ServisPage() {
  const [services, customers] = await Promise.all([
    prisma.service.findMany({
      orderBy: { tarih: "desc" },
      include: {
        customer: true,
        device: true,
        filters: true,
      },
    }),
    prisma.customer.findMany({
      include: {
        devices: {
          include: { filters: { select: { id: true, ad: true } } },
        },
      },
    }),
  ]);

  const serviceCustomers = customers.map((c) => ({
    id: c.id,
    ad: c.ad,
    soyad: c.soyad,
    devices: c.devices.map((d) => ({
      id: d.id,
      marka: d.marka,
      model: d.model,
      filters: d.filters,
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Servisler</h1>
          <p className="text-sm text-muted-foreground">
            {services.length} servis kaydı
          </p>
        </div>
        <ServiceFormDialog
          customers={serviceCustomers}
          triggerLabel="Yeni Servis"
          triggerIcon={<Plus />}
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Cihaz</TableHead>
              <TableHead>İşlem</TableHead>
              <TableHead>Filtreler</TableHead>
              <TableHead>Ücret</TableHead>
              <TableHead className="w-24 text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Servis kaydı yok.
                </TableCell>
              </TableRow>
            ) : (
              services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{formatDate(s.tarih)}</TableCell>
                  <TableCell className="font-medium">
                    {s.customer.ad} {s.customer.soyad ?? ""}
                  </TableCell>
                  <TableCell>
                    {s.device ? `${s.device.marka} ${s.device.model}` : "—"}
                  </TableCell>
                  <TableCell>{s.yapilanIslem || "—"}</TableCell>
                  <TableCell>
                    {s.filters.length
                      ? s.filters.map((f) => f.ad).join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell>{formatTL(s.ucret)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ServiceFormDialog
                        customers={serviceCustomers}
                        service={{
                          id: s.id,
                          customerId: s.customerId,
                          deviceId: s.deviceId,
                          tarih: s.tarih,
                          teknisyen: s.teknisyen,
                          yapilanIslem: s.yapilanIslem,
                          ucret: s.ucret != null ? Number(s.ucret) : null,
                          not: s.not,
                          filters: s.filters.map((f) => ({ id: f.id })),
                        }}
                        triggerLabel="Düzenle"
                        triggerVariant="ghost"
                        triggerSize="sm"
                      />
                      <DeleteButton action={deleteService} id={s.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
