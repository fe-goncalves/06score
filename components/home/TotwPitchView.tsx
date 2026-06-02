import { TotwMobileGrid } from "@/components/home/TotwMobileGrid";
import { TotwPitchDesktop } from "@/components/home/TotwPitchDesktop";
import type { HomeTotw } from "@/lib/types";

interface TotwPitchViewProps {
  totw: HomeTotw;
}

export function TotwPitchView({ totw }: TotwPitchViewProps) {
  return (
    <>
      <div className="md:hidden">
        <TotwMobileGrid totw={totw} />
      </div>
      <div className="hidden md:block">
        <TotwPitchDesktop totw={totw} />
      </div>
    </>
  );
}
