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

const CATEGORIES = ['Groceries', 'Fuel', 'Pharmacy', 'Online Shopping', 'Restaurants', 'Clothing', 'General Retail'];
const REWARD_TYPES = ['cashback', 'points', 'discount', 'miles', 'estimate'];
const CONFIDENCE_LEVELS = ['High', 'Medium', 'Low'];

export default function AdminRules() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    programme_id: '', programme_name: '', category: 'Groceries', reward_type: 'cashback',
    estimated_rate_percent: 0, confidence_default: 'Medium', conditions_note: '', active: true
  });

  const { data: rules = [] } = useQuery({
    queryKey: ['admin-rules'], queryFn: () => base44.entities.RewardRule.list('-created_date', 100),
  });

  const { data: programmes = [] } = useQuery({
    queryKey: ['admin-programmes'], queryFn: () => base44.entities.RewardProgramme.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editing) await base44.entities.RewardRule.update(editing.id, data);
      else await base44.entities.RewardRule.create(data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-rules'] }); setOpen(false); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RewardRule.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-rules'] }),
  });

  const resetForm = () => { setEditing(null); setForm({ programme_id: '', programme_name: '', category: 'Groceries', reward_type: 'cashback', estimated_rate_percent: 0, confidence_default: 'Medium', conditions_note: '', active: true }); };
  const openEdit = (r) => { setEditing(r); setForm({ programme_id: r.programme_id || '', programme_name: r.programme_name || '', category: r.category || 'Groceries', reward_type: r.reward_type || 'cashback', estimated_rate_percent: r.estimated_rate_percent || 0, confidence_default: r.confidence_default || 'Medium', conditions_note: r.conditions_note || '', active: r.active !== false }); setOpen(true); };

  const handleProgrammeChange = (id) => {
    const prog = programmes.find(p => p.id === id);
    setForm(p => ({ ...p, programme_id: id, programme_name: prog?.name || '' }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/admin" className="p-1"><ChevronLeft className="w-5 h-5" /></Link>
            <h1 className="text-lg font-bold text-foreground">Reward Rules</h1>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild><Button size="sm" className="rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add</Button></DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? 'Edit Rule' : 'Add Rule'}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Programme</Label>
                  <Select value={form.programme_id} onValueChange={handleProgrammeChange}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select programme" /></SelectTrigger>
                    <SelectContent>{programmes.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.provider})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Reward type</Label>
                  <Select value={form.reward_type} onValueChange={v => setForm(p => ({ ...p, reward_type: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{REWARD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Estimated rate (%)</Label><Input type="number" step="0.1" value={form.estimated_rate_percent} onChange={e => setForm(p => ({ ...p, estimated_rate_percent: parseFloat(e.target.value) || 0 }))} className="mt-1" /></div>
                <div><Label>Confidence</Label>
                  <Select value={form.confidence_default} onValueChange={v => setForm(p => ({ ...p, confidence_default: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{CONFIDENCE_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Conditions note</Label><Input value={form.conditions_note} onChange={e => setForm(p => ({ ...p, conditions_note: e.target.value }))} className="mt-1" /></div>
                <div className="flex items-center justify-between"><span className="text-sm">Active</span><Switch checked={form.active} onCheckedChange={v => setForm(p => ({ ...p, active: v }))} /></div>
                <Button onClick={() => saveMutation.mutate(form)} disabled={!form.programme_id || saveMutation.isPending} className="w-full rounded-xl">
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 pt-4 pb-8 space-y-2">
        {rules.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{r.programme_name} · {r.category}</p>
              <p className="text-xs text-muted-foreground">{r.reward_type} · {r.estimated_rate_percent}% · {r.confidence_default}</p>
            </div>
            <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(r.id); }} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}