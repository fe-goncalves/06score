import Link from "next/link";
import { NavbarNavLinks } from "@/components/layout/NavbarNavLinks";
import { NavbarSocial } from "@/components/layout/NavbarSocial";
import { OrgImage } from "@/components/ui/OrgImage";
import type { Organization } from "@/lib/types";

interface NavbarProps {
  org: Organization;
}

export function Navbar({ org }: NavbarProps) {
  return (
    <header className="navbar-top sticky top-0 z-50">
      <div className="page-container mx-auto flex h-14 max-w-7xl items-center gap-4 md:h-16">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <OrgImage
            src={org.logo_url}
            alt={org.name}
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </Link>

        <NavbarNavLinks />

        <div className="ml-auto flex items-center gap-4">
          <NavbarSocial org={org} />
        </div>
      </div>
    </header>
  );
}
