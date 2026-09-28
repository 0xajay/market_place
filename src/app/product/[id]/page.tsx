import { getProduct } from '@/lib/actions';
import Link from 'next/link';
import ProductGallery from '@/components/ProductGallery';
import ProductActions from './ProductActions';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Product not found</h2>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', marginTop: '2rem' }}>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', padding: '2rem', alignItems: 'start' }}>
        <div style={{ height: '500px' }}>
          <ProductGallery images={product.image_urls} />
        </div>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{product.title}</h1>
          {product.seller && (
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Sold by <strong>{product.seller.display_name}</strong>
            </p>
          )}
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {product.discount_price ? (
              <>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.price}</span>
                <span>₹{product.discount_price}</span>
              </>
            ) : (
              <span>₹{product.price}</span>
            )}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.8 }}>
            {product.description}
          </p>
          <ProductActions productId={product.id} />
        </div>
      </div>
    </div>
  );
}
