import { ScanSearch } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <ScanSearch className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-foreground leading-tight">
            DentAI
          </h1>
          <p className="text-xs text-muted-foreground leading-none">
            Teeth Condition Analyzer
          </p>
        </div>
      </div>
    </header>
  );
}
