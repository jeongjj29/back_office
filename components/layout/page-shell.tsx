import { cn } from "@lib/utils";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main className={cn("mx-auto w-full max-w-6xl space-y-6 p-6", className)}>
      {children}
    </main>
  );
}
