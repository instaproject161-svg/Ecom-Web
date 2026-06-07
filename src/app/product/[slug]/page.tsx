import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import AddToCartButton from './add-to-cart-button'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <nav className="text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-foreground">Shop</Link>
          {product.category && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link>
            </>
          )}
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            {product.main_image && (
              <Image src={product.main_image} alt={product.name} fill className="object-cover" priority />
            )}
          </div>

          <div className="space-y-6">
            <div>
              {product.category && (
                <p className="text-sm text-muted-foreground uppercase mb-2">{product.category.name}</p>
              )}
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(product.rating) ? 'text-yellow-400' : 'text-muted'}>
                      {'\u2605'}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.review_count} reviews)</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                {product.compare_at_price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span>
                    <Badge variant="destructive">Sale</Badge>
                  </>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            <div className="flex items-center gap-4">
              <span className={product.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.quantity > 0 ? `In Stock (${product.quantity} available)` : 'Out of Stock'}
              </span>
            </div>

            <AddToCartButton product={product} />

            <div className="border-t pt-6 space-y-3 text-sm">
              <p className="flex items-center gap-2"><span className="font-medium">SKU:</span> {product.sku || 'N/A'}</p>
              {product.is_new && <Badge>New Arrival</Badge>}
              {product.is_bestseller && <Badge variant="secondary">Bestseller</Badge>}
              {product.is_featured && <Badge variant="outline">Featured</Badge>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
