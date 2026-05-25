import { isMatchLive } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Agendado", className: "text-white/50" },
  agendado: { label: "Agendado", className: "text-white/50" },
  live: { label: "Ao vivo", className: "text-[#ff6b00]" },
  ao_vivo: { label: "Ao vivo", className: "text-[#ff6b00]" },
  in_progress: { label: "Ao vivo", className: "text-[#ff6b00]" },
  ongoing: { label: "Ao vivo", className: "text-[#ff6b00]" },
  finished: { label: "Finalizado", className: "text-[var(--color-brand)]" },
  finalizado: { label: "Finalizado", className: "text-[var(--color-brand)]" },
  postponed: { label: "Adiado", className: "text-yellow-400" },
  cancelled: { label: "Cancelado", className: "text-white/35" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const config = STATUS_MAP[key] ?? {
    label: status,
    className: "text-white/50",
  };
  const live = isMatchLive(status);

  return (
    <span
      className={`font-mono-label inline-block text-[7px] font-bold uppercase tracking-wide ${
        live ? "text-[#ff6b00]" : config.className
      }`}
    >
      {config.label}
    </span>
  );
}
