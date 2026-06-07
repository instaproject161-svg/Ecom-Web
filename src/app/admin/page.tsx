import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingBag, Users, Layers } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  const { data: userData } = await supabase.from('users').select('role').eq('auth_id', user.id).single()

  if (!userData || userData.role !== 'admin') {
    redirect('/')
  }

  const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: totalCategories } = await supabase.from('categories').select('*', { count: 'exact', head: true })

  const { data: ordersData } = await supabase.from('orders').select('total')
  const totalRevenue = ordersData?.reduce((sum: number, o: any) => sum + o.total, 0) || 0

  const stats = [
    { title: 'Total Orders', value: totalOrders || 0, icon: ShoppingBag, href: '/admin/orders' },
    { title: 'Total Products', value: totalProducts || 0, icon: Package, href: '/admin/products' },
    { title: 'Total Users', value: totalUsers || 0, icon: Users, href: '/admin/users' },
    { title: 'Categories', value: totalCategories || 0, icon: Layers, href: '/admin/categories' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage your e-commerce store</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
