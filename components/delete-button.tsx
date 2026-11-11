"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  id,
  confirmMessage = "Silmek istediğinize emin misiniz?",
  extraFields,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmMessage?: string;
  extraFields?: Record<string, string>;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
      className="inline-flex"
    >
      <input type="hidden" name="id" value={id} />
      {extraFields &&
        Object.entries(extraFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 />
        {label}
      </Button>
    </form>
  );
}
