import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { AppointmentFormDialog } from "@/components/forms/appointment-form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { deleteAppointment } from "@/lib/actions/appointments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const DURUM_LABEL = {
  BEKLIYOR: "Bekliyor",
  TAMAMLANDI: "Tamamlandı",
  IPTAL: "İptal",
} as const;

export default async function RandevuPage() {
  const [appointments, customers] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: { tarih: "asc" },
      include: { customer: true },
    }),
    prisma.customer.findMany({
      orderBy: { ad: "asc" },
      select: { id: true, ad: true, soyad: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Randevular</h1>
          <p className="text-sm text-muted-foreground">
            {appointments.length} randevu
          </p>
        </div>
        <AppointmentFormDialog
          customers={customers}
          triggerLabel="Yeni Randevu"
          triggerIcon={<Plus />}
        />
      </div>

      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Not</TableHead>
              <TableHead className="w-24 text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Randevu yok.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{formatDateTime(a.tarih)}</TableCell>
                  <TableCell className="font-medium">
                    {a.customer.ad} {a.customer.soyad ?? ""}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        a.durum === "TAMAMLANDI"
                          ? "secondary"
                          : a.durum === "IPTAL"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {DURUM_LABEL[a.durum]}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.not || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <AppointmentFormDialog
                        customers={customers}
                        appointment={{
                          id: a.id,
                          customerId: a.customerId,
                          tarih: a.tarih,
                          durum: a.durum,
                          not: a.not,
                        }}
                        triggerLabel="Düzenle"
                        triggerVariant="ghost"
                        triggerSize="sm"
                      />
                      <DeleteButton action={deleteAppointment} id={a.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {appointments.length === 0 ? (
          <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            Randevu yok.
          </p>
        ) : (
          appointments.map((a) => (
            <div key={a.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {a.customer.ad} {a.customer.soyad ?? ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(a.tarih)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <AppointmentFormDialog
                    customers={customers}
                    appointment={{
                      id: a.id,
                      customerId: a.customerId,
                      tarih: a.tarih,
                      durum: a.durum,
                      not: a.not,
                    }}
                    triggerLabel="Düzenle"
                    triggerVariant="ghost"
                    triggerSize="sm"
                  />
                  <DeleteButton action={deleteAppointment} id={a.id} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Badge
                  variant={
                    a.durum === "TAMAMLANDI"
                      ? "secondary"
                      : a.durum === "IPTAL"
                      ? "destructive"
                      : "default"
                  }
                >
                  {DURUM_LABEL[a.durum]}
                </Badge>
                {a.not && (
                  <span className="truncate text-xs text-muted-foreground">
                    {a.not}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
