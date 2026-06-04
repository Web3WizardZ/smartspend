import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Award, BookOpen, Settings, ChevronRight, Shield, Zap, Trophy, Users } from 'lucide-react';

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
  const { data: campaigns = [] } = useQuery({
    queryKey: ['admin-campaigns'], queryFn: () => base44.entities.Campaign.list(), enabled: !!user,
  });
  const { data: gdProfiles = [] } = useQuery({
    queryKey: ['admin-gd-profiles'], queryFn: () => base44.entities.GoodDollarProfile.list(), enabled: !!user,
  });
  const { data: participations = [] } = useQuery({
    queryKey: ['admin-participations'], queryFn: () => base44.entities.CampaignParticipation.list(), enabled: !!user,
  });

  if (checking || !user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  const activatedCount = gdProfiles.filter(p => p.activation_status === 'active').length;
  const verifiedCount = gdProfiles.filter(p => p.identity_status === 'verified').length;

  const cards = [
    { label: 'Retailers', count: retailers.length, icon: Store, path: '/admin/retailers' },
    { label: 'Programmes', count: programmes.length, icon: Award, path: '/admin/programmes' },
    { label: 'Reward Rules', count: rules.length, icon: BookOpen, path: '/admin/rules' },
  ];

  const gdCards = [
    { label: 'GoodDollar Rewards Activated', count: activatedCount, icon: Zap, color: 'text-primary' },
    { label: 'Identity Verified', count: verifiedCount, icon: Shield, color: 'text-primary' },
    { label: 'Active Campaigns', count: campaigns.filter(c => c.active).length, icon: Trophy, color: 'text-primary' },
    { label: 'Campaign Participations', count: participations.length, icon: Users, color: 'text-primary' },
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
        {/* GoodDollar ecosystem metrics */}
        <div className="mb-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">GoodDollar Ecosystem</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {gdCards.map(({ label, count, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className="text-2xl font-extrabold text-foreground">{count}</p>
              </div>
            ))}
          </div>
          <Link to="/campaigns" className="block bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 hover:bg-primary/8 transition-all mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Manage Campaigns</p>
              <p className="text-xs text-muted-foreground">{campaigns.length} total campaigns</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>

        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Data Management</p>
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