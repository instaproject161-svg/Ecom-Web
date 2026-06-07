'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader as Loader2, ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'

export default function AddToCartButton({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAddToCart = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.info('Please login to add items to cart')
      router.push('/auth/login?redirect=/product/' + product.slug)
      setLoading(false)
      return
    }

    // Add to cart in database
    const { data: userData } = await supabase.from('users').select('id').eq('auth_id', user.id).single()

    if (userData) {
      const { error } = await supabase.from('carts').insert({
        user_id: userData.id,
        product_id: product.id,
        quantity: 1,
      })

      if (error && !error.message.includes('duplicate')) {
        toast.error('Failed to add to cart')
        setLoading(false)
        return
      }

      toast.success('Added to cart!')
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <Button size="lg" onClick={handleAddToCart} disabled={loading || product.quantity === 0} className="w-full md:w-auto">
      {loading ? (
        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Adding...</>
      ) : (
        <><ShoppingCart className="h-4 w-4 mr-2" />{product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}</>
      )}
    </Button>
  )
}
