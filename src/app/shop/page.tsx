'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Product, Category } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Loader as Loader2, Search } from 'lucide-react'

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get('category') || ''

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [categoryFilter])

  const fetchProducts = async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('products').select('*, category:categories(*)').eq('is_active', true).order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%`)
    }
    if (categoryFilter) {
      const { data: catData } = await supabase.from('categories').select('id').eq('slug', categoryFilter).single()
      if (catData) {
        query = query.eq('category_id', catData.id)
      }
    }

    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('*').eq('is_active', true)
    setCategories(data || [])
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          {categoryFilter ? categories.find(c => c.slug === categoryFilter)?.name || 'Products' : 'All Products'}
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="flex gap-2 flex-wrap">
            <Button variant={!categoryFilter ? 'default' : 'outline'} onClick={() => router.push('/shop')}>All</Button>
            {categories.map((cat) => (
              <Button key={cat.id} variant={categoryFilter === cat.slug ? 'default' : 'outline'} onClick={() => router.push(`/shop?category=${cat.slug}`)}>
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="group">
                <div className="bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square">
                    {product.main_image && (
                      <Image src={product.main_image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                    {product.is_new && <Badge className="absolute top-2 left-2">New</Badge>}
                    {product.compare_at_price && <Badge variant="destructive" className="absolute top-2 right-2">Sale</Badge>}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground uppercase mb-1">{product.category?.name}</p>
                    <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{formatPrice(product.price)}</span>
                      {product.compare_at_price && (
                        <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  )
}
