import { getProducts } from '@/lib/actions';
import Link from 'next/link';
import ImageSlider from '@/components/ImageSlider';
import CategoryNav from '@/components/CategoryNav';

export const dynamic = 'force-dynamic';

function ProductCard({ product, index }: { product: any; index: number }) {
  return (
    <Link href={`/product/${product.id}`} className={`card animate-fade-in delay-${(index % 3 + 1) * 100}`} style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', height: '100%', minWidth: '280px' }}>
      <div style={{ width: '100%', height: '200px', flexShrink: 0 }}>
        <ImageSlider images={product.image_urls} />
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', height: '40px', overflow: 'hidden', flexGrow: 1 }}>
          {product.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div>
            {product.discount_price ? (
              <>
                <div style={{ display: 'inline-block', backgroundColor: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', marginBottom: '0.25rem' }}>Deal of the Day</div>
                <br />
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: '0.5rem' }}>₹{product.price}</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>₹{product.discount_price}</span>
              </>
            ) : (
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>₹{product.price}</span>
            )}
          </div>
          <div className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            View
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams?.category;
  const products = await getProducts(category);
  
  const deals = products.filter((p: any) => p.discount_price && p.discount_price < p.price);
  const regularProducts = products.filter((p: any) => !p.discount_price || p.discount_price >= p.price);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Discover Unique Items
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          The best place to buy and sell premium products directly from creators on IndoNumis.
        </p>
      </div>

      <CategoryNav currentCategory={category} />

      {!category && deals.length > 0 && (
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#ef4444' }}>🔥</span> Deals of the Day
          </h2>
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            overflowX: 'auto', 
            paddingBottom: '2rem',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--primary) var(--border)'
          }}>
            {deals.map((product: any, index: number) => (
              <div key={product.id} style={{ width: '300px', flexShrink: 0 }}>
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textTransform: 'capitalize' }}>
          {category ? `Explore ${category.replace(/-/g, ' ')}` : 'Explore All Products'}
        </h2>
        <div className="grid-cols-auto">
          {regularProducts.map((product: any, index: number) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
          {products.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No products found. Be the first to sell something!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
