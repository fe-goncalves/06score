const STATUS_MAP: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Agendado", className: "bg-white/10 text-white/80" },
  agendado: { label: "Agendado", className: "bg-white/10 text-white/80" },
  live: { label: "Ao vivo", className: "bg-red-600/90 text-white" },
  ao_vivo: { label: "Ao vivo", className: "bg-red-600/90 text-white" },
  in_progress: { label: "Ao vivo", className: "bg-red-600/90 text-white" },
  ongoing: { label: "Ao vivo", className: "bg-red-600/90 text-white" },
  finished: { label: "Finalizado", className: "bg-[var(--color-brand)]/20 text-[var(--color-brand)]" },
  finalizado: { label: "Finalizado", className: "bg-[var(--color-brand)]/20 text-[var(--color-brand)]" },
  postponed: { label: "Adiado", className: "bg-yellow-600/20 text-yellow-400" },
  cancelled: { label: "Cancelado", className: "bg-white/5 text-white/40" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const config = STATUS_MAP[key] ?? {
    label: status,
    className: "bg-white/10 text-white/80",
  };

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.className}`}
    >
      {config.label}
    </span>
  );
}
