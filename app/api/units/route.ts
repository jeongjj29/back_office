import { NextResponse } from "next/server";
import { toResponseError } from "@lib/errors";
import { requirePermission } from "@server/auth/guards";
import {
  createUnit,
  createUnitGroup,
  deleteUnit,
  deleteUnitGroup,
  listUnitGroupsWithUnits,
  updateUnitGroup,
} from "@server/units/service";

function parsePositiveInt(value: unknown) {
  const num = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isInteger(num) && num > 0 ? num : null;
}

export async function GET() {
  try {
    await requirePermission("UNIT_READ");
    const unitGroups = await listUnitGroupsWithUnits();
    return NextResponse.json({ unitGroups });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("UNIT_WRITE");
    const body = await request.json().catch(() => ({}));

    if (body.kind === "group") {
      const unitGroup = await createUnitGroup({
        name: typeof body.name === "string" ? body.name : "",
      });
      return NextResponse.json({ unitGroup }, { status: 201 });
    }

    const unitGroupId = parsePositiveInt(body.unitGroupId);
    if (!unitGroupId) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "unitGroupId must be a positive integer" } },
        { status: 400 },
      );
    }

    const unit = await createUnit({
      unitGroupId,
      name: typeof body.name === "string" ? body.name : "",
      abbreviation: typeof body.abbreviation === "string" ? body.abbreviation : "",
      factor: typeof body.factor === "string" ? body.factor : 0,
    });

    return NextResponse.json({ unit }, { status: 201 });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await requirePermission("UNIT_WRITE");
    const body = await request.json().catch(() => ({}));
    if (body.kind === "group") {
      const id = parsePositiveInt(body.id);
      if (!id) {
        return NextResponse.json(
          { error: { code: "BAD_REQUEST", message: "id must be a positive integer" } },
          { status: 400 },
        );
      }
      const unitGroup = await updateUnitGroup(id, String(body.name ?? ""));
      return NextResponse.json({ unitGroup });
    }
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Unsupported update" } }, { status: 400 });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await requirePermission("UNIT_WRITE");
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind");
    const id = parsePositiveInt(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: { code: "BAD_REQUEST", message: "id is required" } }, { status: 400 });
    }

    if (kind === "group") {
      await deleteUnitGroup(id);
      return NextResponse.json({ ok: true });
    }

    await deleteUnit(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, body } = toResponseError(error);
    return NextResponse.json(body, { status });
  }
}
