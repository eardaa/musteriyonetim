import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate, formatTL } from "@/lib/format";
import { ODEME_YONTEMI_LABELS } from "@/lib/constants";
import { PaymentFormDialog } from "@/components/forms/payment-form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { deletePayment } from "@/lib/actions/payments";
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

export const dynamic = "force-dynamic";

export default async function OdemePage() {
  const [payments, customers] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { tarih: "desc" },
      include: { customer: true },
    }),
    prisma.customer.findMany({
      orderBy: { ad: "asc" },
      select: { id: true, ad: true, soyad: true },
    }),
  ]);

  const total = payments.reduce((sum, p) => sum + Number(p.tutar ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ödemeler</h1>
          <p className="text-sm text-muted-foreground">
            {payments.length} ödeme kaydı
          </p>
        </div>
        <PaymentFormDialog
          customers={customers}
          triggerLabel="Yeni Ödeme"
          triggerIcon={<Plus />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Toplam Tahsilat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{formatTL(total)}</p>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Yöntem</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Not</TableHead>
              <TableHead className="w-24 text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Ödeme kaydı yok.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.tarih)}</TableCell>
                  <TableCell className="font-medium">
                    {p.customer.ad} {p.customer.soyad ?? ""}
                  </TableCell>
                  <TableCell>{ODEME_YONTEMI_LABELS[p.odemeYontemi]}</TableCell>
                  <TableCell className="font-medium">
                    {formatTL(p.tutar)}
                  </TableCell>
                  <TableCell>{p.not || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <PaymentFormDialog
                        customers={customers}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
