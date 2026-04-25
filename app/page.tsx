"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = store.getUser();
    const wallet = store.getWallet();
    if (!user) router.replace("/login");
    else if (!user.kycVerified) router.replace("/kyc");
    else if (!wallet) router.replace("/wallet/create");
    else router.replace("/home");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="font-mono text-xs text-fg-dim caret">loading</div>
    </div>
  );
}
