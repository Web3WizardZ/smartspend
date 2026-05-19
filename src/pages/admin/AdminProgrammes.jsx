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

const TYPES = ['bank', 'loyalty', 'retailer', 'fuel', 'other'];

export default function AdminProgrammes() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'bank', provider: '', description: '', logo_url: '', initials: '', brand_colour: '#009A44', active: true });

  const { data: programmes = [] } = useQuery({
    queryKey: ['admin-programmes'],
    queryFn: () => base44.entities.RewardProgramme.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editing) await base44.entities.RewardProgramme.update(editing.id, data);
      else await base44.entities.RewardProgramme.create(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-programmes'] }); setOpen(false); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RewardProgramme.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-programmes'] }),
  });

  const resetForm = () => { setEditing(null); setForm({ name: '', type: 'bank', provider: '', description: '', logo_url: '', initials: '', brand_colour: '#009A44', active: true }); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, type: p.type, provider: p.provider, description: p.description || '', logo_url: p.logo_url || '', initials: p.initials || '', brand_colour: p.brand_colour || '', active: p.active !== false }); setOpen(true); };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/admin" className="p-1"><ChevronLeft className="w-5 h-5" /></Link>
            <h1 className="text-lg font-bold text-foreground">Reward Programmes</h1>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild><Button size="sm" className="rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{editing ? 'Edit Programme' : 'Add Programme'}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" /></div>
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Provider</Label><Input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} className="mt-1" /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1" /></div>
                <div><Label>Logo URL</Label><Input value={form.logo_url} onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))} className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Initials</Label><Input value={form.initials} onChange={e => setForm(p => ({ ...p, initials: e.target.value }))} className="mt-1" /></div>
                  <div><Label>Brand colour</Label><Input type="color" value={form.brand_colour} onChange={e => setForm(p => ({ ...p, brand_colour: e.target.value }))} className="mt-1 h-10" /></div>
                </div>
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
        {programmes.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
            <LogoAvatar initials={p.initials} brandColour={p.brand_colour} name={p.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.provider} · {p.type}</p>
            </div>
            <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(p.id); }} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}