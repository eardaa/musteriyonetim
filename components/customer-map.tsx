export function CustomerMap({
  address,
  name,
}: {
  address: string;
  name?: string;
}) {
  const query = `${address}, Türkiye`;
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(
    query
  )}&z=15&hl=tr&output=embed`;

  return (
    <div className="overflow-hidden rounded-xl border">
      <iframe
        title={name ? `${name} konumu` : "Konum"}
        src={src}
        className="h-64 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
