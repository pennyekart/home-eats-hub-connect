import { useState } from 'react';
import MobileVerification from '@/components/MobileVerification';
import NotRegistered from '@/components/NotRegistered';
import LandingPage from '@/components/LandingPage';

const Index = () => {
  const [currentView, setCurrentView] = useState<'verification' | 'not-registered' | 'landing'>('verification');
  const [userData, setUserData] = useState<any>(null);

  const handleVerified = (data: any) => {
    setUserData(data);
    setCurrentView('landing');
  };

  const handleNotRegistered = () => {
    setCurrentView('not-registered');
  };

  const handleBack = () => {
    setCurrentView('verification');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentView('verification');
  };

  if (currentView === 'verification') {
    return <MobileVerification onVerified={handleVerified} onNotRegistered={handleNotRegistered} />;
  }

  if (currentView === 'not-registered') {
    return <NotRegistered onBack={handleBack} />;
  }

  return <LandingPage userData={userData} onLogout={handleLogout} />;
};

export default Index;
