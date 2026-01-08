import { cn } from "@lib/utils";

type Variant = "info" | "success" | "warning" | "error";

const styles: Record<Variant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-900",
  success: "border-green-200 bg-green-50 text-green-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

type InlineAlertProps = {
  title?: string;
  children?: React.ReactNode;
  variant?: Variant;
  className?: string;
};

export function InlineAlert({ title, children, variant = "info", className }: InlineAlertProps) {
  return (
    <div className={cn("rounded-md border px-3 py-2 text-sm", styles[variant], className)}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <p className={cn(title ? "mt-1" : undefined)}>{children}</p> : null}
    </div>
  );
}
