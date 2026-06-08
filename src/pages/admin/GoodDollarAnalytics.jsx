import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Users, Zap, Globe, DollarSign, Activity, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/shared/AppHeader';

export default function GoodDollarAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        navigate('/login');
        return;
      }

      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Only admins can view this
      if (currentUser.role !== 'admin') {
        navigate('/profile');
        return;
      }

      // Fetch all GoodDollar profiles
      const profiles = await base44.asServiceRole.entities.GoodDollarProfile.filter({});
      console.log('Loaded profiles:', profiles.length);
      
      // Fetch all G$ events
      const events = await base44.asServiceRole.entities.EstimatedValueEvent.filter({ 
        g_reward_amount: { $gt: 0 }
      }, '-created_date', 1000);
      console.log('Loaded events:', events.length);

      // Fetch campaign participations
      const participations = await base44.asServiceRole.entities.CampaignParticipation.filter({});
      console.log('Loaded participations:', participations.length);

      // Calculate metrics
      const totalUsers = profiles.length;
      const verifiedUsers = profiles.filter(p => p.identity_status === 'verified').length;
      const activeUsers = profiles.filter(p => p.activation_status === 'active').length;
      
      const totalGEarned = events.reduce((sum, e) => sum + (e.g_reward_amount || 0), 0);
      const totalSpendActions = events.length;
      const avgGEarnedPerUser = totalUsers > 0 ? totalGEarned / totalUsers : 0;
      
      // Campaign metrics
      const activeCampaigns = participations.filter(p => p.status === 'in_progress').length;
      const completedCampaigns = participations.filter(p => p.status === 'completed' || p.status === 'reward_claimed').length;
      
      // Category breakdown (top spending categories)
      const categoryBreakdown = {};
      events.forEach(e => {
        categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + 1;
      });

      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentEvents = events.filter(e => new Date(e.created_date) > sevenDaysAgo);
      const recentGEarned = recentEvents.reduce((sum, e) => sum + (e.g_reward_amount || 0), 0);

      setStats({
        totalUsers,
        verifiedUsers,
        activeUsers,
        verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0,
        totalGEarned,
        totalSpendActions,
        avgGEarnedPerUser,
        activeCampaigns,
        completedCampaigns,
        recentGEarned,
        recentActions: recentEvents.length,
        categoryBreakdown,
        totalCampaignParticipants: participations.length,
      });
    } catch (e) {
      console.error('Failed to load analytics:', e);
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="GoodDollar Analytics" showBack />
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="GoodDollar Analytics" showBack />
        <div className="max-w-lg mx-auto px-6 pt-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold text-destructive mb-2">Failed to Load Analytics</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadAnalytics} className="h-10 rounded-xl text-sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalUsers === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="GoodDollar Analytics" showBack />
        <div className="max-w-lg mx-auto px-6 pt-6">
          <div className="bg-white border border-border rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold text-foreground mb-2">No Data Available</p>
            <p className="text-xs text-muted-foreground">No GoodDollar profiles have been connected yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <AppHeader title="GoodDollar Impact Analytics" showBack />
      <div className="max-w-4xl mx-auto px-6 pt-6">
        
        {/* Hero Stats */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-6 border border-primary/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-primary mb-1">Total G$ Earned</p>
              <p className="text-5xl font-extrabold text-foreground">G$ {stats.totalGEarned.toFixed(2)}</p>
            </div>
            <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground">Spend Actions</p>
              <p className="text-xl font-bold text-foreground">{stats.totalSpendActions}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Avg per User</p>
              <p className="text-xl font-bold text-foreground">G$ {stats.avgGEarnedPerUser.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Last 7 Days</p>
              <p className="text-xl font-bold text-primary">G$ {stats.recentGEarned.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* User Metrics */}
        <h3 className="text-base font-bold text-foreground mb-3">User Adoption</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard 
            icon={<Users className="w-4 h-4 text-blue-600" />}
            label="Connected Users"
            value={stats.totalUsers}
            color="bg-blue-50"
          />
          <StatCard 
            icon={<Award className="w-4 h-4 text-primary" />}
            label="Verified Humans"
            value={stats.verifiedUsers}
            subtext={`${stats.verificationRate}% of connected`}
            color="bg-primary/10"
          />
          <StatCard 
            icon={<Activity className="w-4 h-4 text-green-600" />}
            label="Active Accounts"
            value={stats.activeUsers}
            color="bg-green-50"
          />
          <StatCard 
            icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
            label="Campaign Participants"
            value={stats.totalCampaignParticipants}
            subtext={`${stats.completedCampaigns} completed`}
            color="bg-purple-50"
          />
        </div>

        {/* Campaign Performance */}
        <h3 className="text-base font-bold text-foreground mb-3">Campaign Performance</h3>
        <div className="bg-white rounded-2xl border border-border p-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active Participants</p>
              <p className="text-2xl font-bold text-foreground">{stats.activeCampaigns}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Completed Campaigns</p>
              <p className="text-2xl font-bold text-primary">{stats.completedCampaigns}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <h3 className="text-base font-bold text-foreground mb-3">Recent Activity (7 Days)</h3>
        <div className="bg-white rounded-2xl border border-border p-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">G$ Earned</p>
                <p className="text-lg font-bold text-green-600">G$ {stats.recentGEarned.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actions</p>
                <p className="text-lg font-bold text-blue-600">{stats.recentActions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h3 className="text-base font-bold text-foreground mb-4">Export Data</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-12 rounded-2xl text-sm"
              onClick={() => alert('CSV export would be implemented here')}
            >
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              className="h-12 rounded-2xl text-sm"
              onClick={() => alert('PDF report would be generated here')}
            >
              Generate Report
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 text-center">
            For GoodDollar team: Contact support@smartspend.app for custom analytics requests
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center mt-6">
          Analytics updated in real-time. Data reflects all SmartSpend users who have connected GoodDollar accounts.
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext, color }) {
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      {subtext && <p className="text-[9px] text-muted-foreground mt-0.5">{subtext}</p>}
    </div>
  );
}