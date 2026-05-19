import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoAvatar from '../../components/shared/LogoAvatar';

const CATEGORIES = ['Groceries', 'Fuel', 'Pharmacy', 'Online Shopping', 'Restaurants', 'Clothing', 'General Retail', 'Travel'];

export default function AdminRetailers() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Groceries', logo_url: '', initials: '', brand_colour: '#009A44', popular: false, active: true, sort_order: 0 });

  const { data: retailers = [] } = useQuery({
    queryKey: ['admin-retailers'],
    queryFn: () => base44.entities.Retailer.list('sort_order', 100),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editing) {
        await base44.entities.Retailer.update(editing.id, data);
      } else {
        await base44.entities.Retailer.create(data);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-retailers'] }); setOpen(false); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Retailer.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-retailers'] }),
  });

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', category: 'Groceries', logo_url: '', initials: '', brand_colour: '#009A44', popular: false, active: true, sort_order: 0 });
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({ name: r.name, category: r.category, logo_url: r.logo_url || '', initials: r.initials || '', brand_colour: r.brand_colour || '', popular: r.popular || false, active: r.active !== false, sort_order: r.sort_order || 0 });
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/admin" className="p-1"><ChevronLeft className="w-5 h-5" /></Link>
            <h1 className="text-lg font-bold text-foreground">Retailers</h1>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{editing ? 'Edit Retailer' : 'Add Retailer'}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" /></div>
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Logo URL</Label><Input value={form.logo_url} onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))} className="mt-1" placeholder="https://..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Initials</Label><Input value={form.initials} onChange={e => setForm(p => ({ ...p, initials: e.target.value }))} className="mt-1" /></div>
                  <div><Label>Brand colour</Label><Input type="color" value={form.brand_colour} onChange={e => setForm(p => ({ ...p, brand_colour: e.target.value }))} className="mt-1 h-10" /></div>
                </div>
                <div><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="mt-1" /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Popular</span><Switch checked={form.popular} onCheckedChange={v => setForm(p => ({ ...p, popular: v }))} /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Active</span><Switch checked={form.active} onCheckedChange={v => setForm(p => ({ ...p, active: v }))} /></div>
                <Button onClick={() => saveMutation.mutate(form)} disabled={!form.name || saveMutation.isPending} className="w-full rounded-xl">
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 pt-4 pb-8 space-y-2">
        {retailers.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
            <LogoAvatar logoUrl={r.logo_url} initials={r.initials} brandColour={r.brand_colour} name={r.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.category} · {r.active ? 'Active' : 'Inactive'}</p>
            </div>
            <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(r.id); }} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}