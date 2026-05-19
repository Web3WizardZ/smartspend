import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { UserCircle, Shield, Bell, LogOut, Crown, ChevronRight } from 'lucide-react';
import AppHeader from '../components/shared/AppHeader';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = "https://media.base44.com/images/public/user_69ea57333f824d48a1afdd12/e7314e200_image.png";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (a) => {
      setIsAuth(a);
      if (a) {
        const me = await base44.auth.me();
        setUser(me);
      }
      setChecking(false);
    });
  }, []);

  if (checking) return <div className="min-h-screen bg-background"><AppHeader title="Profile" /></div>;

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Profile" />
        <div className="max-w-lg mx-auto px-6 pt-16 text-center">
          <img src={LOGO_URL} alt="SmartSpend" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Join SmartSpend</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to save your wallet, track value, and get personalised estimates.</p>
          <Button className="rounded-2xl h-12 px-8" onClick={() => base44.auth.redirectToLogin()}>
            Sign in / Create account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Profile" />
      <div className="max-w-lg mx-auto px-6 pt-4 pb-8">
        {/* User card */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{user?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* SmartSpend+ */}
        <button
          onClick={() => navigate('/smartspend-plus')}
          className="w-full bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 mb-6 flex items-center justify-between text-primary-foreground"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5" />
            <div className="text-left">
              <p className="text-sm font-bold">SmartSpend+</p>
              <p className="text-xs opacity-80">Unlock deeper insights</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-80" />
        </button>

        {/* Settings sections */}
        <div className="space-y-3">
          <SettingSection title="Notifications">
            <SettingToggle label="Reward tips and reminders" />
            <SettingToggle label="New feature announcements" />
          </SettingSection>

          <SettingSection title="Privacy & data">
            <SettingToggle label="Use saved profiles for estimates" defaultOn />
            <SettingToggle label="Use anonymised activity to improve insights" />
            <SettingToggle label="Share aggregated trends with partners" />
          </SettingSection>

          <SettingSection title="About">
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                SmartSpend helps users compare payment profiles and loyalty programmes to find the highest estimated reward value before a purchase.
                We do not provide financial advice.
              </p>
              <p className="text-xs text-muted-foreground mt-2">Version 1.0.0</p>
            </div>
          </SettingSection>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl mt-6 text-destructive border-destructive/20 hover:bg-destructive/5"
          onClick={() => base44.auth.logout()}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </div>
    </div>
  );
}

function SettingSection({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-bold text-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

function SettingToggle({ label, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}