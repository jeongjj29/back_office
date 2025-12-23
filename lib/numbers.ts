import { Prisma } from "../generated/prisma/client";

type DecimalLike = Prisma.Decimal | number | string;

function toDecimal(value: DecimalLike): Prisma.Decimal {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

export function sumDecimals(values: DecimalLike[]): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>(
    (acc, value) => acc.add(toDecimal(value)),
    new Prisma.Decimal(0),
  );
}

export function clampCurrency(value: DecimalLike, minimum = "0"): Prisma.Decimal {
  const decimalValue = toDecimal(value);
  const minValue = toDecimal(minimum);
  return decimalValue.lessThan(minValue) ? minValue : decimalValue;
}

export function formatCurrency(
  value: DecimalLike,
  options: { currency?: string; locale?: string } = {},
): string {
  const decimalValue = toDecimal(value);
  const locale = options.locale ?? "en-US";
  const currency = options.currency ?? "USD";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(decimalValue.toNumber());
}

export function toFixed(value: DecimalLike, fractionDigits = 2): string {
  return toDecimal(value).toFixed(fractionDigits);
}
