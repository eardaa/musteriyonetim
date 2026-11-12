import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, formatTL } from "@/lib/format";
import { nextChangeDate, reminderStatus, daysUntil } from "@/lib/reminders";
import { CIHAZ_TIPI_LABELS, ODEME_YONTEMI_LABELS } from "@/lib/constants";
import { CustomerFormDialog } from "@/components/forms/customer-form-dialog";
import { CustomerMap } from "@/components/customer-map";
import { DeviceFormDialog } from "@/components/forms/device-form-dialog";
import { FilterFormDialog } from "@/components/forms/filter-form-dialog";
import { ServiceFormDialog } from "@/components/forms/service-form-dialog";
import { PaymentFormDialog } from "@/components/forms/payment-form-dialog";
import { AppointmentFormDialog } from "@/components/forms/appointment-form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { deleteCustomer } from "@/lib/actions/customers";
import { deleteDevice, deleteFilter } from "@/lib/actions/devices";
import { deleteService } from "@/lib/actions/services";
import { deletePayment } from "@/lib/actions/payments";
import { deleteAppointment } from "@/lib/actions/appointments";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      devices: { include: { filters: true }, orderBy: { createdAt: "asc" } },
      services: { include: { filters: true }, orderBy: { tarih: "desc" } },
      payments: { orderBy: { tarih: "desc" } },
      appointments: { orderBy: { tarih: "desc" } },
    },
  });

  if (!customer) notFound();

  const billed = customer.services.reduce(
    (sum, s) => sum + Number(s.ucret ?? 0),
    0
  );
  const paid = customer.payments.reduce(
    (sum, p) => sum + Number(p.tutar ?? 0),
    0
  );
  const balance = billed - paid;

  const now = new Date();

  const serviceCustomers = [
    {
      id: customer.id,
      ad: customer.ad,
      soyad: customer.soyad,
      devices: customer.devices.map((d) => ({
        id: d.id,
        marka: d.marka,
        model: d.model,
        filters: d.filters.map((f) => ({ id: f.id, ad: f.ad })),
      })),
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/musteri"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Müşterilere dön
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {customer.ad} {customer.soyad ?? ""}
              </h1>
              <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                <a
                  href={`tel:${customer.telefon}`}
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <Phone className="size-4" /> {customer.telefon}
                </a>
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="inline-flex items-center gap-2 hover:text-foreground"
                  >
                    <Mail className="size-4" /> {customer.email}
                  </a>
                )}
                {customer.adres && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4" /> {customer.adres}
                  </span>
                )}
              </div>
              {customer.not && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Not: {customer.not}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <CustomerFormDialog
                customer={{
                  id: customer.id,
                  ad: customer.ad,
                  soyad: customer.soyad,
                  telefon: customer.telefon,
                  email: customer.email,
                  adres: customer.adres,
                  not: customer.not,
                }}
                triggerLabel="Düzenle"
                triggerVariant="outline"
                triggerIcon={<Pencil />}
              />
              <DeleteButton
                action={deleteCustomer}
                id={customer.id}
                confirmMessage="Müşteri ve tüm kayıtları silinecek. Emin misiniz?"
                label="Sil"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Bakiye" value={formatTL(balance)} tone={balance > 0 ? "warning" : "default"} />
            <Stat label="Toplam Servis" value={String(customer.services.length)} />
            <Stat label="Toplam Ödeme" value={formatTL(paid)} />
            <Stat label="Cihaz Sayısı" value={String(customer.devices.length)} />
          </div>
        </CardContent>
      </Card>

      {customer.adres && (
        <Card>
          <CardHeader>
            <CardTitle>Konum</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {customer.adres}
            </p>
          </CardHeader>
          <CardContent>
            <CustomerMap
              address={customer.adres}
              name={`${customer.ad} ${customer.soyad ?? ""}`}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cihazlar</CardTitle>
          <div className="mt-1">
            <DeviceFormDialog
              customerId={customer.id}
              triggerLabel="Cihaz Ekle"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {customer.devices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Cihaz kaydı yok.</p>
          ) : (
            customer.devices.map((device) => (
              <div key={device.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {device.marka} {device.model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {CIHAZ_TIPI_LABELS[device.cihazTipi]} · Kurulum:{" "}
                      {formatDate(device.kurulumTarihi)}
                      {device.seriNo ? ` · Seri No: ${device.seriNo}` : ""}
                    </p>
                    {device.not && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {device.not}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <FilterFormDialog
                      deviceId={device.id}
                      customerId={customer.id}
                      triggerLabel="Filtre Ekle"
                    />
                    <DeviceFormDialog
                      customerId={customer.id}
                      device={{
                        id: device.id,
                        marka: device.marka,
                        model: device.model,
                        seriNo: device.seriNo,
                        cihazTipi: device.cihazTipi,
                        kurulumTarihi: device.kurulumTarihi,
                        not: device.not,
                      }}
                      triggerLabel="Düzenle"
                    />
                    <DeleteButton
                      action={deleteDevice}
                      id={device.id}
                      extraFields={{ customerId: customer.id }}
                      confirmMessage="Cihaz ve filtreleri silinecek. Emin misiniz?"
                    />
                  </div>
                </div>

                {device.filters.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {device.filters.map((filter) => {
                      const next = nextChangeDate(
                        filter.sonDegisimTarihi,
                        filter.degisimPeriyoduAy,
                        device.kurulumTarihi
                      );
                      const status = reminderStatus(next, now);
                      const days = daysUntil(next);
                      return (
                        <div
                          key={filter.id}
                          className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm">{filter.ad}</span>
                            <span className="text-xs text-muted-foreground">
                              {filter.degisimPeriyoduAy} ayda bir
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(next)}
                            </span>
                            <Badge
                              variant={
                                status === "overdue"
                                  ? "destructive"
                                  : status === "upcoming"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {status === "overdue"
                                ? `${Math.abs(days)} gün gecikti`
                                : status === "upcoming"
                                ? `${days} gün kaldı`
                                : "Zamanı gelmedi"}
                            </Badge>
                            <FilterFormDialog
                              deviceId={device.id}
                              customerId={customer.id}
                              filter={{
                                id: filter.id,
                                ad: filter.ad,
                                degisimPeriyoduAy: filter.degisimPeriyoduAy,
                                sonDegisimTarihi: filter.sonDegisimTarihi,
                                not: filter.not,
                              }}
                              triggerLabel="Düzenle"
                            />
                            <DeleteButton
                              action={deleteFilter}
                              id={filter.id}
                              extraFields={{ customerId: customer.id }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Servis Geçmişi</CardTitle>
          <div className="mt-1">
            <ServiceFormDialog
              customers={serviceCustomers}
              triggerLabel="Yeni Servis"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {customer.services.length === 0 ? (
            <p className="text-sm text-muted-foreground">Servis kaydı yok.</p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Cihaz</TableHead>
                      <TableHead>İşlem</TableHead>
                      <TableHead>Filtreler</TableHead>
                      <TableHead>Ücret</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.services.map((s) => {
                      const device = customer.devices.find(
                        (d) => d.id === s.deviceId
                      );
                      return (
                        <TableRow key={s.id}>
                          <TableCell>{formatDate(s.tarih)}</TableCell>
                          <TableCell>
                            {device ? `${device.marka} ${device.model}` : "—"}
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2 md:hidden">
                {customer.services.map((s) => {
                  const device = customer.devices.find(
                    (d) => d.id === s.deviceId
                  );
                  return (
                    <div key={s.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {formatDate(s.tarih)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {device ? `${device.marka} ${device.model}` : "—"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
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
                      </div>
                      <dl className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">İşlem</dt>
                          <dd className="text-right">{s.yapilanIslem || "—"}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted-foreground">Filtreler</dt>
                          <dd className="text-right">
                            {s.filters.length
                              ? s.filters.map((f) => f.ad).join(", ")
                              : "—"}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-2 border-t pt-2">
                        <span className="text-sm font-medium">
                          {formatTL(s.ucret)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ödemeler</CardTitle>
            <div className="mt-1">
              <PaymentFormDialog customerId={customer.id} triggerLabel="Ödeme Ekle" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ödeme kaydı yok.</p>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Yöntem</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead className="text-right">İşlem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{formatDate(p.tarih)}</TableCell>
                          <TableCell>{ODEME_YONTEMI_LABELS[p.odemeYontemi]}</TableCell>
                          <TableCell className="font-medium">
                            {formatTL(p.tutar)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <PaymentFormDialog
                                customerId={customer.id}
                                payment={{
                                  id: p.id,
                                  customerId: p.customerId,
                                  tutar: Number(p.tutar),
                                  tarih: p.tarih,
                                  odemeYontemi: p.odemeYontemi,
                                  not: p.not,
                                }}
                                triggerLabel="Düzenle"
                                triggerVariant="ghost"
                                triggerSize="sm"
                              />
                              <DeleteButton action={deletePayment} id={p.id} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2 md:hidden">
                  {customer.payments.map((p) => (
                    <div key={p.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {formatDate(p.tarih)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ODEME_YONTEMI_LABELS[p.odemeYontemi]}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <PaymentFormDialog
                            customerId={customer.id}
                            payment={{
                              id: p.id,
                              customerId: p.customerId,
                              tutar: Number(p.tutar),
                              tarih: p.tarih,
                              odemeYontemi: p.odemeYontemi,
                              not: p.not,
                            }}
                            triggerLabel="Düzenle"
                            triggerVariant="ghost"
                            triggerSize="sm"
                          />
                          <DeleteButton action={deletePayment} id={p.id} />
                        </div>
                      </div>
                      <div className="mt-2 border-t pt-2">
                        <span className="text-sm font-semibold">
                          {formatTL(p.tutar)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Randevular</CardTitle>
            <div className="mt-1">
              <AppointmentFormDialog
                customerId={customer.id}
                triggerLabel="Randevu Ekle"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {customer.appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Randevu yok.</p>
            ) : (
              customer.appointments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatDateTime(a.tarih)}
                    </p>
                    {a.not && (
                      <p className="text-xs text-muted-foreground">{a.not}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        a.durum === "TAMAMLANDI"
                          ? "secondary"
                          : a.durum === "IPTAL"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {a.durum === "BEKLIYOR"
                        ? "Bekliyor"
                        : a.durum === "TAMAMLANDI"
                        ? "Tamamlandı"
                        : "İptal"}
                    </Badge>
                    <AppointmentFormDialog
                      customerId={customer.id}
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
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={
          tone === "warning"
            ? "text-xl font-semibold text-destructive"
            : "text-xl font-semibold"
        }
      >
        {value}
      </p>
    </div>
  );
}
