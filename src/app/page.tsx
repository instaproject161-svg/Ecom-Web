import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(8)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .limit(4)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/20 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Your <span className="text-primary">Perfect Style</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Shop premium products from top brands worldwide. Free shipping on orders over $100.
            </p>
            <Link href="/shop" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/shop?category=${category.slug}`} className="group">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                    {category.image_url && (
                      <Image src={category.image_url} alt={category.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                      <h3 className="text-white text-lg font-semibold">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products && products.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.slug}`} className="group">
                  <div className="bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square">
                      {product.main_image && (
                        <Image src={product.main_image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">${product.price.toFixed(2)}</span>
                        {product.compare_at_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.compare_at_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/shop" className="text-primary hover:underline font-medium">
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
