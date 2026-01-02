"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type FieldProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal" | "responsive";
};

const orientationClassNames: Record<NonNullable<FieldProps["orientation"]>, string> = {
  vertical: "space-y-2",
  horizontal: "flex items-start gap-3",
  responsive: "grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center",
};

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="field"
        className={cn(
          "group/field rounded-lg border border-transparent p-1 data-[invalid]:border-destructive/30 data-[invalid]:bg-destructive/5",
          orientationClassNames[orientation],
          className,
        )}
        {...props}
      />
    );
  },
);
Field.displayName = "Field";

const FieldGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="field-group"
        className={cn("grid gap-6", className)}
        {...props}
      />
    );
  },
);
FieldGroup.displayName = "FieldGroup";

const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => {
  return (
    <fieldset
      ref={ref}
      className={cn("space-y-4 rounded-lg border p-4", className)}
      {...props}
    />
  );
});
FieldSet.displayName = "FieldSet";

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement>
>(({ className, ...props }, ref) => {
  return (
    <legend ref={ref} className={cn("px-1 text-sm font-semibold", className)} {...props} />
  );
});
FieldLegend.displayName = "FieldLegend";

const FieldLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className,
        )}
        {...props}
      />
    );
  },
);
FieldLabel.displayName = "FieldLabel";

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
});
FieldDescription.displayName = "FieldDescription";

type FieldErrorProps = React.HTMLAttributes<HTMLParagraphElement> & {
  errors?: string[];
};

function FieldError({ errors, className, ...props }: FieldErrorProps) {
  if (!errors?.length) return null;

  return (
    <p className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {errors.join(" ")}
    </p>
  );
}

const FieldContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("space-y-1", className)} {...props} />;
  },
);
FieldContent.displayName = "FieldContent";

const FieldTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p ref={ref} className={cn("text-sm font-semibold leading-none", className)} {...props} />
  );
});
FieldTitle.displayName = "FieldTitle";

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
};
