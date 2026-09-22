import Link from 'next/link';
import Image from 'next/image';

interface CategoryProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

export default function CategoryGrid({ categories }: { categories: CategoryProps[] }) {
  return (
    <div className="my-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
          <p className="text-xs text-slate-500 font-medium">Explore curated Indian e-commerce departments</p>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
        >
          View All Categories →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-500 transition-all duration-300 text-center"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2 bg-slate-100 group-hover:scale-105 transition-transform duration-300">
              <Image
                src={cat.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050'}
                alt={cat.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-1">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
