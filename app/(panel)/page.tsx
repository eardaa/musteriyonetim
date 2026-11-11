import Link from "next/link";
import {
  Users,
  CalendarDays,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, formatTL } from "@/lib/format";
import { nextChangeDate, reminderStatus, daysUntil } from "@/lib/reminders";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [customerCount, pendingAppointments, servicesAgg, paymentsAgg, filters, upcomingAppointments, recentServices] =
    await Promise.all([
      prisma.customer.count(),
      prisma.appointment.count({
        where: { durum: "BEKLIYOR", tarih: { gte: new Date() } },
      }),
      prisma.service.aggregate({ _sum: { ucret: true } }),
      prisma.payment.aggregate({ _sum: { tutar: true } }),
      prisma.filter.findMany({
        include: { device: { include: { customer: true } } },
      }),
      prisma.appointment.findMany({
        where: { durum: "BEKLIYOR", tarih: { gte: new Date() } },
        orderBy: { tarih: "asc" },
        take: 5,
        include: { customer: true },
      }),
      prisma.service.findMany({
        orderBy: { tarih: "desc" },
        take: 5,
        include: { customer: true },
      }),
    ]);

  const now = new Date();
  const reminders = filters
    .map((filter) => {
      const next = nextChangeDate(
        filter.sonDegisimTarihi,
        filter.degisimPeriyoduAy,
        filter.device.kurulumTarihi
      );
      const status = reminderStatus(next, now);
      return { filter, next, status };
    })
    .filter((r) => r.status !== "ok");

  const overdue = reminders
    .filter((r) => r.status === "overdue")
    .sort((a, b) => a.next.getTime() - b.next.getTime());

  const upcoming = reminders
    .filter((r) => r.status === "upcoming")
    .sort((a, b) => a.next.getTime() - b.next.getTime());

  const totalBilled = Number(servicesAgg._sum.ucret ?? 0);
  const totalPaid = Number(paymentsAgg._sum.tutar ?? 0);
  const balance = totalBilled - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Genel Bakış</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(now)} · Kale Su Arıtma müşteri paneli
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="size-4" />}
          label="Toplam Müşteri"
          value={String(customerCount)}
          href="/musteri"
        />
        <StatCard
          icon={<CalendarDays className="size-4" />}
          label="Bekleyen Randevu"
          value={String(pendingAppointments)}
          href="/randevu"
        />
        <StatCard
          icon={<TriangleAlert className="size-4" />}
          label="Geciken Filtre"
          value={String(overdue.length)}
          href="/musteri"
          tone={overdue.length > 0 ? "warning" : "default"}
        />
        <StatCard
          icon={<Wallet className="size-4" />}
          label="Alacak Bakiyesi"
          value={formatTL(balance)}
          href="/odeme"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Filtre Hatırlatmaları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Hatırlatma bulunmuyor. Her şey yolunda.
              </p>
            ) : (
              <>
                {overdue.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-destructive">
                      Geciken ({overdue.length})
                    </h3>
                    {overdue.map(({ filter, next }) => (
                      <ReminderRow
                        key={filter.id}
                        name={filter.device.customer.ad}
                        filterName={filter.ad}
                        next={next}
                        overdue
                      />
                    ))}
                  </div>
                )}
                {upcoming.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      Yaklaşan ({upcoming.length})
                    </h3>
                    {upcoming.map(({ filter, next }) => (
                      <ReminderRow
                        key={filter.id}
                        name={filter.device.customer.ad}
                        filterName={filter.ad}
                        next={next}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan Randevular</CardTitle>
              <CardAction>
                <Link
                  href="/randevu"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Tümü
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Yaklaşan randevu yok.
                </p>
              ) : (
                upcomingAppointments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{a.customer.ad}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(a.tarih)}
                      </p>
                    </div>
                    <Badge variant="secondary">Bekliyor</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son Servisler</CardTitle>
              <CardAction>
                <Link
                  href="/servis"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Tümü
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentServices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Henüz servis kaydı yok.
                </p>
              ) : (
                recentServices.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{s.customer.ad}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(s.tarih)}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {formatTL(s.ucret)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  tone?: "default" | "warning";
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-start justify-between p-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p
              className={
                tone === "warning"
                  ? "text-2xl font-semibold text-destructive"
                  : "text-2xl font-semibold"
              }
            >
              {value}
            </p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ReminderRow({
  name,
  filterName,
  next,
  overdue,
}: {
  name: string;
  filterName: string;
  next: Date;
  overdue?: boolean;
}) {
  const days = daysUntil(next);
  return (
    <Link
      href="/musteri"
      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {filterName} · {formatDate(next)}
        </p>
      </div>
      <Badge variant={overdue ? "destructive" : "secondary"}>
        {overdue ? `${Math.abs(days)} gün gecikti` : `${days} gün kaldı`}
      </Badge>
    </Link>
  );
}
