import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

type RoleSeed = {
  key: string;
  name: string;
  description?: string | null;
  permissions: string[];
};

const permissionSeeds = [
  { key: "USER_READ", name: "Read users" },
  { key: "USER_WRITE", name: "Manage users" },
  { key: "ROLE_READ", name: "Read roles" },
  { key: "ROLE_WRITE", name: "Manage roles" },
  { key: "VENDOR_READ", name: "Read vendors" },
  { key: "VENDOR_WRITE", name: "Manage vendors" },
  { key: "PRODUCT_READ", name: "Read products" },
  { key: "PRODUCT_WRITE", name: "Manage products" },
  { key: "INVOICE_READ", name: "Read invoices" },
  { key: "INVOICE_WRITE", name: "Manage invoices" },
  { key: "EXPENSE_READ", name: "Read expenses" },
  { key: "EXPENSE_WRITE", name: "Manage expenses" },
  { key: "UNIT_READ", name: "Read units" },
  { key: "UNIT_WRITE", name: "Manage units" },
];

const roleSeeds: RoleSeed[] = [
  {
    key: "ADMIN",
    name: "Administrator",
    description: "Full access to all features",
    permissions: permissionSeeds.map((permission) => permission.key),
  },
  {
    key: "MANAGER",
    name: "Manager",
    description: "Manage catalogs and financial entries",
    permissions: [
      "VENDOR_READ",
      "VENDOR_WRITE",
      "PRODUCT_READ",
      "PRODUCT_WRITE",
      "INVOICE_READ",
      "INVOICE_WRITE",
      "EXPENSE_READ",
      "EXPENSE_WRITE",
      "UNIT_READ",
      "UNIT_WRITE",
    ],
  },
  {
    key: "STAFF",
    name: "Staff",
    description: "Maintain transactions and view catalogs",
    permissions: [
      "VENDOR_READ",
      "PRODUCT_READ",
      "INVOICE_READ",
      "INVOICE_WRITE",
      "EXPENSE_READ",
      "EXPENSE_WRITE",
      "UNIT_READ",
    ],
  },
  {
    key: "READONLY",
    name: "Read Only",
    description: "View-only access",
    permissions: [
      "USER_READ",
      "ROLE_READ",
      "VENDOR_READ",
      "PRODUCT_READ",
      "INVOICE_READ",
      "EXPENSE_READ",
      "UNIT_READ",
    ],
  },
];

const unitGroupSeeds = [
  {
    name: "Weight",
    units: [
      { name: "Kilogram", abbreviation: "kg", factor: new Prisma.Decimal(1) },
      { name: "Gram", abbreviation: "g", factor: new Prisma.Decimal(0.001) },
      {
        name: "Pound",
        abbreviation: "lb",
        factor: new Prisma.Decimal("0.45359237"),
      },
      {
        name: "Ounce",
        abbreviation: "oz",
        factor: new Prisma.Decimal("0.028349523125"),
      },
    ],
  },
  {
    name: "Volume",
    units: [
      { name: "Liter", abbreviation: "L", factor: new Prisma.Decimal(1) },
      {
        name: "Milliliter",
        abbreviation: "mL",
        factor: new Prisma.Decimal(0.001),
      },
      {
        name: "Fluid Ounce",
        abbreviation: "fl oz",
        factor: new Prisma.Decimal("0.0295735295625"),
      },
      {
        name: "Gallon",
        abbreviation: "gal",
        factor: new Prisma.Decimal("3.785411784"),
      },
    ],
  },
];

const vendorSeeds = [
  {
    name: "Acme Supplies",
    type: "INVENTORY" as const,
    phone: "555-1200",
    email: "sales@acme.example",
    website: "https://acme.example",
  },
  {
    name: "Utility Power",
    type: "UTILITY" as const,
    phone: "555-4400",
    email: "billing@utilitypower.example",
    website: "https://utilitypower.example",
  },
];

const productCategorySeeds = [{ name: "Beverages" }, { name: "Consumables" }];

const productSeeds = [
  {
    name: "Coffee Beans",
    categoryName: "Beverages",
    unitGroupName: "Weight",
    name_kr: "커피 원두",
  },
  {
    name: "Sparkling Water",
    categoryName: "Beverages",
    unitGroupName: "Volume",
  },
  {
    name: "Paper Towels",
    categoryName: "Consumables",
    unitGroupName: "Weight",
  },
];

const productSpecSeeds = [
  {
    productName: "Coffee Beans",
    vendorName: "Acme Supplies",
    unitName: "Kilogram",
    description: "Colombian medium roast",
    caseSize: 1,
    unitSize: new Prisma.Decimal(1),
    brand: "Acme Roasters",
    sku: "COF-001",
  },
  {
    productName: "Sparkling Water",
    vendorName: "Acme Supplies",
    unitName: "Liter",
    description: "12 pack sparkling water",
    caseSize: 12,
    unitSize: new Prisma.Decimal(1),
    brand: "Bubbly",
    sku: "SPW-012",
  },
  {
    productName: "Paper Towels",
    vendorName: "Acme Supplies",
    unitName: "Gram",
    description: "Bulk paper towels case",
    caseSize: 6,
    unitSize: new Prisma.Decimal(500),
    brand: "CleanCo",
  },
];

async function seedPermissionsAndRoles() {
  await prisma.permission.createMany({
    data: permissionSeeds,
    skipDuplicates: true,
  });

  await Promise.all(
    roleSeeds.map(({ key, name, description }) =>
      prisma.role.upsert({
        where: { key },
        create: { key, name, description },
        update: { name, description },
      })
    )
  );

  const permissions = await prisma.permission.findMany({
    where: { key: { in: permissionSeeds.map((permission) => permission.key) } },
  });
  const roles = await prisma.role.findMany({
    where: { key: { in: roleSeeds.map((role) => role.key) } },
  });

  const permissionsByKey = new Map(
    permissions.map((permission) => [permission.key, permission])
  );
  const rolesByKey = new Map(roles.map((role) => [role.key, role]));

  const rolePermissionRows = roleSeeds.flatMap((role) => {
    const roleId = rolesByKey.get(role.key)?.id;
    if (!roleId) return [];

    return role.permissions
      .map((permissionKey) => permissionsByKey.get(permissionKey)?.id)
      .filter((permissionId): permissionId is number => Boolean(permissionId))
      .map((permissionId) => ({
        roleId,
        permissionId,
      }));
  });

  if (rolePermissionRows.length > 0) {
    await prisma.rolePermission.createMany({
      data: rolePermissionRows,
      skipDuplicates: true,
    });
  }
}

async function seedUnits() {
  for (const unitGroup of unitGroupSeeds) {
    const group = await prisma.unitGroup.upsert({
      where: { name: unitGroup.name },
      create: { name: unitGroup.name },
      update: {},
    });

    await prisma.unit.createMany({
      data: unitGroup.units.map((unit) => ({
        ...unit,
        unitGroupId: group.id,
      })),
      skipDuplicates: true,
    });
  }
}

async function seedVendorsProductsAndSpecs() {
  await prisma.vendor.createMany({
    data: vendorSeeds,
    skipDuplicates: true,
  });

  await prisma.productCategory.createMany({
    data: productCategorySeeds,
    skipDuplicates: true,
  });

  const [vendors, categories, unitGroups] = await Promise.all([
    prisma.vendor.findMany(),
    prisma.productCategory.findMany(),
    prisma.unitGroup.findMany(),
  ]);

  const unitGroupByName = new Map(
    unitGroups.map((group) => [group.name, group])
  );
  const categoryByName = new Map(
    categories.map((category) => [category.name, category])
  );
  const vendorByName = new Map(vendors.map((vendor) => [vendor.name, vendor]));

  for (const product of productSeeds) {
    const categoryId = categoryByName.get(product.categoryName)?.id;
    const unitGroupId = unitGroupByName.get(product.unitGroupName)?.id;
    if (!categoryId || !unitGroupId) continue;

    await prisma.product.upsert({
      where: { name_unitGroupId: { name: product.name, unitGroupId } },
      create: {
        name: product.name,
        name_kr: product.name_kr,
        categoryId,
        unitGroupId,
      },
      update: {
        categoryId,
        unitGroupId,
        name_kr: product.name_kr,
      },
    });
  }

  const [products, units] = await Promise.all([
    prisma.product.findMany(),
    prisma.unit.findMany(),
  ]);

  const productByName = new Map(
    products.map((product) => [product.name, product])
  );
  const unitByName = new Map(units.map((unit) => [unit.name, unit]));

  for (const spec of productSpecSeeds) {
    const productId = productByName.get(spec.productName)?.id;
    const vendorId = vendorByName.get(spec.vendorName)?.id;
    const unitId = unitByName.get(spec.unitName)?.id;
    if (!productId || !vendorId || !unitId) continue;

    await prisma.productSpec.upsert({
      where: {
        productId_vendorId_brand_caseSize_unitSize: {
          productId,
          vendorId,
          brand: spec.brand,
          caseSize: spec.caseSize,
          unitSize: spec.unitSize,
        },
      },
      create: {
        productId,
        vendorId,
        unitId,
        description: spec.description,
        caseSize: spec.caseSize,
        unitSize: spec.unitSize,
        brand: spec.brand,
        sku: spec.sku,
      },
      update: {
        description: spec.description,
        active: true,
      },
    });
  }
}

async function main() {
  await seedPermissionsAndRoles();
  await seedUnits();
  await seedVendorsProductsAndSpecs();
}

main()
  .then(async () => {
    console.log("Seed complete");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
