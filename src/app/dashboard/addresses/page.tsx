'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface Address {
  id: string
  name: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  is_default: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setAddresses(data || [])
    setLoading(false)
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('addresses').insert({
      user_id: user.id,
      ...formData,
      is_default: addresses.length === 0,
    })

    if (error) {
      toast.error('Failed to add address')
      setSaving(false)
      return
    }

    toast.success('Address added')
    setShowForm(false)
    setFormData({ name: '', street: '', city: '', state: '', zip: '', country: '' })
    fetchAddresses()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('addresses').delete().eq('id', id)

    if (error) {
      toast.error('Failed to delete address')
      return
    }

    toast.success('Address deleted')
    fetchAddresses()
  }

  const handleSetDefault = async (id: string) => {
    const supabase = createClient()
    await supabase.from('addresses').update({ is_default: false }).eq('is_default', true)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    fetchAddresses()
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Addresses</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle>New Address</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label (e.g., Home, Office)</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Street</Label>
                  <Input value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code</Label>
                  <Input value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} required />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No addresses saved</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className={address.is_default ? 'border-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{address.name}</p>
                    <p className="text-sm text-muted-foreground">{address.street}</p>
                    <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.zip}</p>
                    <p className="text-sm text-muted-foreground">{address.country}</p>
                    {address.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-2 inline-block">Default</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!address.is_default && (
                      <Button size="sm" variant="outline" onClick={() => handleSetDefault(address.id)}>Set Default</Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(address.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
