export type User = {
  id: string
  auth_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  is_active: boolean
  created_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  quantity: number
  category_id: string | null
  images: string[]
  main_image: string | null
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  is_bestseller: boolean
  rating: number
  review_count: number
  category?: Category | null
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  order_number: string
  user_id: string | null
  status: OrderStatus
  payment_status: string
  subtotal: number
  shipping_cost: number
  tax_amount: number
  total: number
  shipping_address: any
  billing_address: any
  items?: OrderItem[]
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  quantity: number
  price: number
  subtotal: number
}
