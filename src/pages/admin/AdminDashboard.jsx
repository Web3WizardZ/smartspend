import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Award, BookOpen, Settings, ChevronRight, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (a) => {
      if (a) {
        const me = await base44.auth.me();
        if (me?.role !== 'admin') {
          navigate('/');
          return;
        }
        setUser(me);
      } else {
        navigate('/');
      }
      setChecking(false);
    });
  }, []);

  const { data: retailers = [] } = useQuery({
    queryKey: ['admin-retailers'], queryFn: () => base44.entities.Retailer.list(), enabled: !!user,
  });
  const { data: programmes = [] } = useQuery({
    queryKey: ['admin-programmes'], queryFn: () => base44.entities.RewardProgramme.list(), enabled: !!user,
  });
  const { data: rules = [] } = useQuery({
    queryKey: ['admin-rules'], queryFn: () => base44.entities.RewardRule.list(), enabled: !!user,
  });

  if (checking || !user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  const cards = [
    { label: 'Retailers', count: retailers.length, icon: Store, path: '/admin/retailers' },
    { label: 'Programmes', count: programmes.length, icon: Award, path: '/admin/programmes' },
    { label: 'Reward Rules', count: rules.length, icon: BookOpen, path: '/admin/rules' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-foreground">SmartSpend Admin</h1>
            <p className="text-xs text-muted-foreground">Manage stores, programmes, and rules</p>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 pt-6 pb-8">
        <div className="grid gap-3">
          {cards.map(({ label, count, icon: Icon, path }) => (
            <Link
              key={path}
              to={path}
              className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{count} records</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <Link to="/" className="block text-center text-sm text-primary font-medium mt-8 hover:underline">
          ← Back to app
        </Link>
      </div>
    </div>
  );
}