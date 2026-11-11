import type { CihazTipi, OdemeYontemi, RandevuDurum } from "@/lib/generated/prisma/enums";

export const CIHAZ_TIPI_LABELS: Record<CihazTipi, string> = {
  TEZGAH_ALTI: "Tezgah Altı",
  TEZGAH_USTU: "Tezgah Üstü",
  POMPALI: "Pompalı",
  POMPASIZ: "Pompasız",
  DIGER: "Diğer",
};

export const ODEME_YONTEMI_LABELS: Record<OdemeYontemi, string> = {
  NAKIT: "Nakit",
  KREDI_KARTI: "Kredi Kartı",
  HAVALE: "Havale / EFT",
  DIGER: "Diğer",
};

export const RANDEVU_DURUM_LABELS: Record<RandevuDurum, string> = {
  BEKLIYOR: "Bekliyor",
  TAMAMLANDI: "Tamamlandı",
  IPTAL: "İptal",
};

export const CIHAZ_TIPI_OPTIONS = Object.entries(CIHAZ_TIPI_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const ODEME_YONTEMI_OPTIONS = Object.entries(ODEME_YONTEMI_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const RANDEVU_DURUM_OPTIONS = Object.entries(RANDEVU_DURUM_LABELS).map(
  ([value, label]) => ({ value, label })
);
