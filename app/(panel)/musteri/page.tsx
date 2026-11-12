import Link from "next/link";
import { Plus, Search, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate, formatTL } from "@/lib/format";
import { CustomerFormDialog } from "@/components/forms/customer-form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { deleteCustomer } from "@/lib/actions/customers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function MusteriPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { devices: true } },
      services: { select: { ucret: true } },
      payments: { select: { tutar: true } },
    },
  });

  const rows = customers
    .map((c) => {
      const billed = c.services.reduce((sum, s) => sum + Number(s.ucret ?? 0), 0);
      const paid = c.payments.reduce((sum, p) => sum + Number(p.tutar ?? 0), 0);
      return {
        id: c.id,
        ad: c.ad,
        soyad: c.soyad,
        telefon: c.telefon,
        email: c.email,
        adres: c.adres,
        not: c.not,
        deviceCount: c._count.devices,
        balance: billed - paid,
        createdAt: c.createdAt,
      };
    })
    .filter((c) => {
      if (!query) return true;
      const haystack =
        `${c.ad} ${c.soyad ?? ""} ${c.telefon} ${c.email ?? ""} ${c.adres ?? ""}`
          .toLocaleLowerCase("tr-TR");
      return haystack.includes(query.toLocaleLowerCase("tr-TR"));
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Müşteriler</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} müşteri listeleniyor
          </p>
        </div>
        <CustomerFormDialog
          triggerLabel="Yeni Müşteri"
          triggerIcon={<Plus />}
        />
      </div>

      <form action="/musteri" method="GET" className="flex gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Ad, telefon veya adres ara..."
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="outline">
          Ara
        </Button>
      </form>

      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Müşteri</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Cihaz</TableHead>
              <TableHead>Bakiye</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead className="w-24 text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Müşteri bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={`/musteri/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.ad} {c.soyad ?? ""}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`tel:${c.telefon}`}
                      className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="size-3.5" />
                      {c.telefon}
                    </a>
                  </TableCell>
                  <TableCell>{c.deviceCount}</TableCell>
                  <TableCell>
                    {c.balance > 0 ? (
                      <Badge variant="destructive">{formatTL(c.balance)}</Badge>
                    ) : (
                      <Badge variant="secondary">{formatTL(0)}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <CustomerFormDialog
                        customer={{
                          id: c.id,
                          ad: c.ad,
                          soyad: c.soyad,
                          telefon: c.telefon,
                          email: c.email,
                          adres: c.adres,
                          not: c.not,
                        }}
                        triggerLabel="Düzenle"
                        triggerVariant="ghost"
                        triggerSize="sm"
                      />
                      <DeleteButton action={deleteCustomer} id={c.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            Müşteri bulunamadı.
          </p>
        ) : (
          rows.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/musteri/${c.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {c.ad} {c.soyad ?? ""}
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  <CustomerFormDialog
                    customer={{
                      id: c.id,
                      ad: c.ad,
                      soyad: c.soyad,
                      telefon: c.telefon,
                      email: c.email,
                      adres: c.adres,
                      not: c.not,
                    }}
                    triggerLabel="Düzenle"
                    triggerVariant="ghost"
                    triggerSize="sm"
                  />
                  <DeleteButton action={deleteCustomer} id={c.id} />
                </div>
              </div>
              <a
                href={`tel:${c.telefon}`}
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <Phone className="size-3.5" />
                {c.telefon}
              </a>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  Cihaz: {c.deviceCount}
                </span>
                {c.balance > 0 ? (
                  <Badge variant="destructive">{formatTL(c.balance)}</Badge>
                ) : (
                  <Badge variant="secondary">{formatTL(0)}</Badge>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(c.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
