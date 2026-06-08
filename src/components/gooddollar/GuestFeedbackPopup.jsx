import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'smartspend_guest_feedback_seen';

export function useGuestFeedbackTrigger() {
  const [show, setShow] = React.useState(false);

  const trigger = React.useCallback(async () => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const authed = await base44.auth.isAuthenticated();
    if (authed) return; // Only show to guests
    setShow(true);
  }, []);

  const dismiss = React.useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  }, []);

  return { show, trigger, dismiss };
}

export default function GuestFeedbackPopup({ onDismiss }) {
  const navigate = useNavigate();

  const handleSignUp = () => {
    base44.analytics.track({ eventName: 'guest_feedback_signup_clicked' });
    localStorage.setItem(STORAGE_KEY, 'true');
    navigate('/register');
  };

  const handleStillExploring = () => {
    base44.analytics.track({ eventName: 'guest_feedback_still_exploring' });
    localStorage.setItem(STORAGE_KEY, 'true');
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
        {/* Close */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <button
            onClick={handleStillExploring}
            className="p-1.5 rounded-xl hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2">Was this useful?</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          For more <span className="font-semibold text-foreground">specific recommendations</span> and to earn <span className="font-semibold text-foreground">daily G$ rewards</span>, sign up and connect your GoodDollar account.
        </p>

        <div className="space-y-2">
          <Button
            className="w-full h-12 rounded-2xl text-sm font-bold"
            onClick={handleSignUp}
          >
            Sign up and connect G$ account
          </Button>
          <Button
            variant="ghost"
            className="w-full h-11 rounded-2xl text-sm text-muted-foreground"
            onClick={handleStillExploring}
          >
            Still exploring
          </Button>
        </div>
      </div>
    </div>
  );
}