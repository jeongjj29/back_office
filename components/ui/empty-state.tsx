import { cn } from "@lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center", className)}>
      {icon ? <div className="text-gray-500">{icon}</div> : null}
      <div className="space-y-1">
        <p className="text-base font-semibold text-gray-900">{title}</p>
        {description ? <p className="text-sm text-gray-600">{description}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
