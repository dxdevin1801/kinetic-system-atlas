import { lazy, Suspense, useEffect, useState } from "react";
import { SystemXMark } from "@/components/brand/SystemXLogo";

const FanScene = lazy(() => import("./FanScene"));

export function SceneLoader({ label = "Initialising scene" }: { label?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <SystemXMark className="size-10" animated />
        <span className="eyebrow">{label}</span>
      </div>
    </div>
  );
}

/** Client-only 3D viewport: never imports three.js during SSR. */
export function FanViewport({ variant }: { variant: "lab" | "preview" }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="absolute inset-0">
      {mounted ? (
        <Suspense fallback={<SceneLoader />}>
          <FanScene variant={variant} />
        </Suspense>
      ) : (
        <SceneLoader />
      )}
    </div>
  );
}
