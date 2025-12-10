"use client";

import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function LogoutButton() {
  return (
    <DropdownMenuItem
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="cursor-pointer text-red-600"
    >
      Esci
    </DropdownMenuItem>
  );
}
