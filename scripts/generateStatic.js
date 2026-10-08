const fs = require('fs');
const path = require('path');

const seedContent = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'seed.ts'), 'utf8');

// Extract from 'interface SubcategoryDef' up to '];\n\nasync function main()'
const startMarker = 'interface SubcategoryDef';
const startIdx = seedContent.indexOf(startMarker);
const endMarker = '];\n\nasync function main()';
const endIdx = seedContent.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find slice markers', { startIdx, endIdx });
  process.exit(1);
}

const definitionsAndData = seedContent.substring(startIdx, endIdx + 2);

const helperCode = `

// Generated static formatted data and helpers
export const FORMATTED_CATEGORIES: any[] = [];
export const FORMATTED_PRODUCTS: any[] = [];

// Populate categories and products
const catMap = new Map<string, { id: string; name: string; slug: string }>();
const subMap = new Map<string, { id: string; name: string; slug: string; parentId: string }>();

CATEGORIES_DATA.forEach((c) => {
  const catId = 'cat-' + c.slug;
  catMap.set(c.slug, { id: catId, name: c.name, slug: c.slug });

  const subs = (c.subcategories || []).map((s) => {
    const subId = 'sub-' + s.slug;
    subMap.set(s.slug, { id: subId, name: s.name, slug: s.slug, parentId: catId });
    return {
      id: subId,
      name: s.name,
      slug: s.slug,
      description: s.description || null,
      parentId: catId,
      isActive: true,
      _count: { products: 0 }
    };
  });

  FORMATTED_CATEGORIES.push({
    id: catId,
    name: c.name,
    slug: c.slug,
    description: c.description || null,
    image: c.image || null,
    isActive: true,
    parentId: null,
    subcategories: subs,
    _count: { products: 0 }
  });
});

PRODUCTS_DATA.forEach((p) => {
  const prodId = 'prod-' + p.slug;
  const parentCat = catMap.get(p.categorySlug) || { id: 'cat-' + p.categorySlug, name: p.categorySlug, slug: p.categorySlug };
  const subCat = p.subcategorySlug ? (subMap.get(p.subcategorySlug) || { id: 'sub-' + p.subcategorySlug, name: p.subcategorySlug, slug: p.subcategorySlug, parentId: parentCat.id }) : null;

  const prodObj = {
    id: prodId,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    discountPercent: p.discountPercent || 0,
    stock: p.stock ?? 50,
    rating: p.rating || 4.5,
    reviewCount: p.reviewCount || 10,
    isFeatured: !!p.isFeatured,
    isNewArrival: !!p.isNewArrival,
    isActive: true,
    categoryId: parentCat.id,
    subcategoryId: subCat ? subCat.id : null,
    images: JSON.stringify(p.images || []),
    category: parentCat,
    subcategory: subCat,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviews: []
  };

  FORMATTED_PRODUCTS.push(prodObj);

  // Update counts
  const catObj = FORMATTED_CATEGORIES.find((c: any) => c.id === parentCat.id);
  if (catObj) {
    catObj._count.products++;
    if (subCat) {
      const subObj = catObj.subcategories.find((s: any) => s.id === subCat.id);
      if (subObj) subObj._count.products++;
    }
  }
});

export function getStaticHomePageData() {
  const categories = FORMATTED_CATEGORIES;
  const featuredProducts = FORMATTED_PRODUCTS.filter((p: any) => p.isFeatured).slice(0, 8);
  const newArrivals = FORMATTED_PRODUCTS.filter((p: any) => p.isNewArrival).slice(0, 8);
  const popularProducts = [...FORMATTED_PRODUCTS].sort((a: any, b: any) => b.reviewCount - a.reviewCount).slice(0, 8);

  return {
    categories,
    featuredProducts: featuredProducts.length > 0 ? featuredProducts : FORMATTED_PRODUCTS.slice(0, 8),
    newArrivals: newArrivals.length > 0 ? newArrivals : FORMATTED_PRODUCTS.slice(8, 16),
    popularProducts: popularProducts.slice(0, 8),
  };
}

export function getStaticCategories(slug?: string | null, includeInactive?: boolean) {
  if (slug) {
    return FORMATTED_CATEGORIES.find((c: any) => c.slug === slug) || null;
  }
  return FORMATTED_CATEGORIES;
}

export function getStaticProducts(options: any = {}) {
  let list = [...FORMATTED_PRODUCTS];

  if (options.q) {
    const q = options.q.toLowerCase();
    list = list.filter((p: any) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (options.category) {
    list = list.filter((p: any) => p.category.slug === options.category || p.category.id === options.category);
  }
  if (options.subcategory) {
    list = list.filter((p: any) => p.subcategory && (p.subcategory.slug === options.subcategory || p.subcategory.id === options.subcategory));
  }
  if (options.minPrice) {
    list = list.filter((p: any) => p.price >= Number(options.minPrice));
  }
  if (options.maxPrice) {
    list = list.filter((p: any) => p.price <= Number(options.maxPrice));
  }
  if (options.minRating) {
    list = list.filter((p: any) => p.rating >= Number(options.minRating));
  }
  if (options.minDiscount) {
    list = list.filter((p: any) => p.discountPercent >= Number(options.minDiscount));
  }
  if (options.inStockOnly) {
    list = list.filter((p: any) => p.stock > 0);
  }

  if (options.sortBy === 'newest') {
    list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (options.sortBy === 'price-asc') {
    list.sort((a: any, b: any) => a.price - b.price);
  } else if (options.sortBy === 'price-desc') {
    list.sort((a: any, b: any) => b.price - a.price);
  } else if (options.sortBy === 'rating') {
    list.sort((a: any, b: any) => b.rating - a.rating);
  } else {
    list.sort((a: any, b: any) => b.reviewCount - a.reviewCount);
  }

  return {
    products: list,
    categories: FORMATTED_CATEGORIES,
    total: list.length
  };
}

export function getStaticProductById(idOrSlug: string) {
  const product = FORMATTED_PRODUCTS.find((p: any) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  if (!product) return null;

  const relatedProducts = FORMATTED_PRODUCTS.filter((p: any) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  return { product, relatedProducts };
}
`;

const targetDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const exportedDef = 'export ' + definitionsAndData
  .replace('const CATEGORIES_DATA', 'export const CATEGORIES_DATA')
  .replace('const PRODUCTS_DATA', 'export const PRODUCTS_DATA');

const finalContent = exportedDef + helperCode;

fs.writeFileSync(path.join(targetDir, 'staticData.ts'), finalContent, 'utf8');
console.log('Successfully generated src/data/staticData.ts');
