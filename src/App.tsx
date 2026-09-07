import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Farm,
  CaseRecord,
  WeatherData,
  IotSensorData,
  PestTrapData,
  GisHotspot,
  FieldVisit,
  NotificationItem,
  DiagnosisResult,
  Crop,
  UserAccount,
  SupportedLanguageCode
} from './types';
import { StorageService } from './services/storageService';
import { AuthService } from './services/authService';
import { I18nService } from './services/i18nService';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { OfflineBanner } from './components/common/OfflineBanner';
import { OnboardingFlow, OnboardingStage } from './components/onboarding/OnboardingFlow';
import { DemoControlBar } from './components/common/DemoControlBar';
import { ArchitectureModal } from './components/common/ArchitectureModal';
import { NotificationCenter } from './components/common/NotificationCenter';
import { AuthScreen } from './components/auth/AuthScreen';
import { VaaniAssistantModal } from './components/vaani/VaaniAssistantModal';
import { VaaniFloatingButton } from './components/vaani/VaaniFloatingButton';
import { FarmerGuidedScannerOverlay } from './components/vaani/FarmerGuidedScannerOverlay';

// Farmer Views
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { MyFields } from './components/farmer/MyFields';
import { CropHealthDetail } from './components/farmer/CropHealthDetail';
import { CropScanner } from './components/farmer/CropScanner';
import { AiDiagnosisResult } from './components/farmer/AiDiagnosisResult';
import { RiskForecast } from './components/farmer/RiskForecast';
import { PestMonitoring } from './components/farmer/PestMonitoring';
import { IotSensorMonitor } from './components/farmer/IotSensorMonitor';
import { WeatherIntelligence } from './components/farmer/WeatherIntelligence';
import { AdvisoryView } from './components/farmer/AdvisoryView';
import { FollowUpMonitoring } from './components/farmer/FollowUpMonitoring';
import { FarmerProfile } from './components/farmer/FarmerProfile';
import { ScanHistory } from './components/farmer/ScanHistory';
import { AddFarmModal } from './components/farmer/AddFarmModal';
import { AddCropModal } from './components/farmer/AddCropModal';

// Expert Views
import { ExpertQueue } from './components/expert/ExpertQueue';
import { ExpertCaseReview } from './components/expert/ExpertCaseReview';

// Officer Views
import { DistrictGisMap } from './components/officer/DistrictGisMap';
import { OutbreakDefense } from './components/officer/OutbreakDefense';
import { DistrictAnalytics } from './components/officer/DistrictAnalytics';

// Extension Views
import { ExtensionDashboard } from './components/extension/ExtensionDashboard';

export default function App() {
  // Authentication & Session state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const session = AuthService.getAuthSession();
    return session?.user || null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Master Onboarding Flow state: check if completed or language locked
  const [isOnboardingFlowOpen, setIsOnboardingFlowOpen] = useState<boolean>(() => {
    return localStorage.getItem('krishirakshak_onboarding_completed') !== 'true';
  });
  const [onboardingInitialStage, setOnboardingInitialStage] = useState<OnboardingStage>('language_selection');

  // App state
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const session = AuthService.getAuthSession();
    return session?.user?.role || StorageService.getCurrentRole();
  });
  const [activeTab, setActiveTab] = useState<string>('farmer-dashboard');
  const [farms, setFarms] = useState<Farm[]>(() => StorageService.getFarms());
  const [cases, setCases] = useState<CaseRecord[]>(() => StorageService.getCases());
  const [weather, setWeather] = useState<WeatherData>(() => StorageService.getWeather());
  const [iotData, setIotData] = useState<IotSensorData>(() => StorageService.getIotData());
  const [pestTraps, setPestTraps] = useState<PestTrapData[]>(() => StorageService.getPestTraps());
  const [hotspots, setHotspots] = useState<GisHotspot[]>(() => StorageService.getHotspots());
  const [fieldVisits, setFieldVisits] = useState<FieldVisit[]>(() => StorageService.getFieldVisits());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());

  // Active sub-states
  const [activeDiagnosis, setActiveDiagnosis] = useState<DiagnosisResult | null>(null);
  const [selectedCaseForReview, setSelectedCaseForReview] = useState<CaseRecord | null>(null);
  const [selectedCaseForAdvisory, setSelectedCaseForAdvisory] = useState<CaseRecord | null>(null);
  const [activeScannerScenario, setActiveScannerScenario] = useState<string>('scenario-a');

  // Modals & Assistant states
  const [isVaaniModalOpen, setIsVaaniModalOpen] = useState(false);
  const [isGuidedScanOpen, setIsGuidedScanOpen] = useState(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAddFarmOpen, setIsAddFarmOpen] = useState(false);
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [selectedFarmForCrop, setSelectedFarmForCrop] = useState<string>('farm-01');

  // Sync session on load
  useEffect(() => {
    const session = AuthService.getAuthSession();
    if (session?.user) {
      setCurrentUser(session.user);
      if (session.user.preferredLanguage) {
        I18nService.setLanguage(session.user.preferredLanguage);
      }
    }
  }, []);

  // Sync state on role change or tab change
  const handleRoleChange = (role: UserRole | 'admin') => {
    const safeRole: UserRole = role === 'admin' ? 'officer' : role;
    setCurrentRole(safeRole);
    StorageService.setCurrentRole(safeRole);
    
    // Switch active persona in AuthService if present
    const matchedUser = AuthService.getRegisteredUsers().find(u => u.role === safeRole);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      if (matchedUser.preferredLanguage) {
        I18nService.setLanguage(matchedUser.preferredLanguage);
      }
    }

    if (safeRole === 'farmer') setActiveTab('farmer-dashboard');
    if (safeRole === 'expert') setActiveTab('expert-queue');
    if (safeRole === 'officer') setActiveTab('gis-map');
    if (safeRole === 'extension') setActiveTab('field-visits');
  };

  const handleNavigate = (roleOrTab: string, tabOrExtra?: any, extraParam?: any) => {
    // Overloaded to handle (tab) or (role, tab, extra)
    if (['farmer', 'expert', 'officer', 'extension'].includes(roleOrTab)) {
      const targetRole = roleOrTab as UserRole;
      const targetTab = tabOrExtra as string;
      setCurrentRole(targetRole);
      StorageService.setCurrentRole(targetRole);
      setActiveTab(targetTab);
      if (extraParam?.scenarioId) {
        setActiveScannerScenario(extraParam.scenarioId);
      }
    } else {
      let targetTab = roleOrTab;
      if (targetTab === 'gis-hotspots') targetTab = 'gis-map';

      // Auto-switch role if navigating to officer-specific or expert-specific tabs
      if (['gis-map', 'outbreak-command', 'outbreak-defense', 'district-analytics', 'outbreak-analytics'].includes(targetTab)) {
        setCurrentRole('officer');
        StorageService.setCurrentRole('officer');
      } else if (['expert-queue', 'expert-review'].includes(targetTab)) {
        setCurrentRole('expert');
        StorageService.setCurrentRole('expert');
      } else if (['field-visits'].includes(targetTab)) {
        setCurrentRole('extension');
        StorageService.setCurrentRole('extension');
      }

      setActiveTab(targetTab);
      if (tabOrExtra?.scenarioId) {
        setActiveScannerScenario(tabOrExtra.scenarioId);
      }
    }
  };

  const handleDiagnosisComplete = (diagnosis: DiagnosisResult) => {
    setActiveDiagnosis(diagnosis);
    setCases(StorageService.getCases());
    setNotifications(StorageService.getNotifications());
    setActiveTab('diagnosis-result');
  };

  const handleRefreshIot = () => {
    const updated = StorageService.simulateIotUpdate();
    setIotData(updated);
  };

  const handleUpdateTrapCount = (trapId: string, newCount: number) => {
    const updated = StorageService.updatePestTrapCount(trapId, newCount);
    setPestTraps(updated);
  };

  const handleToggleOffline = () => {
    setIsOffline(prev => !prev);
  };

  const handleSyncOffline = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsOffline(false);
      setCases(StorageService.getCases());
      setNotifications(StorageService.getNotifications());
    }, 1200);
  };

  const handleResetData = () => {
    StorageService.resetAllData();
    localStorage.removeItem('krishirakshak_onboarding_completed');
    localStorage.removeItem('krishirakshak_tour_completed');
    setFarms(StorageService.getFarms());
    setCases(StorageService.getCases());
    setWeather(StorageService.getWeather());
    setIotData(StorageService.getIotData());
    setPestTraps(StorageService.getPestTraps());
    setHotspots(StorageService.getHotspots());
    setFieldVisits(StorageService.getFieldVisits());
    setNotifications(StorageService.getNotifications());
    setActiveDiagnosis(null);
    setSelectedCaseForReview(null);
    setCurrentRole('farmer');
    setActiveTab('farmer-dashboard');
    setOnboardingInitialStage('language_selection');
    setIsOnboardingFlowOpen(true);
  };

  const handleAuthSuccess = (user: UserAccount) => {
    const safeRole: UserRole = user.role === 'admin' ? 'officer' : user.role;
    setCurrentUser(user);
    setCurrentRole(safeRole);
    StorageService.setCurrentRole(safeRole);
    setIsAuthModalOpen(false);

    if (safeRole === 'farmer') setActiveTab('farmer-dashboard');
    if (safeRole === 'expert') setActiveTab('expert-queue');
    if (safeRole === 'officer') setActiveTab('gis-map');
    if (safeRole === 'extension') setActiveTab('field-visits');
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setOnboardingInitialStage('auth');
    setIsOnboardingFlowOpen(true);
  };

  const handleOpenLanguageSelection = () => {
    setOnboardingInitialStage('language_selection');
    setIsOnboardingFlowOpen(true);
  };

  const handleOpenProductTour = () => {
    setOnboardingInitialStage('product_tour');
    setIsOnboardingFlowOpen(true);
  };

  // Active Case Record resolution for Expert Review
  const caseToReview = selectedCaseForReview || cases.find(c => c.status === 'needs_expert_review') || cases[0];
  const primaryFarm = farms[0];

  // If initial onboarding is active, display the voice-guided flow
  if (isOnboardingFlowOpen) {
    return (
      <OnboardingFlow
        initialStage={onboardingInitialStage}
        onComplete={(user) => {
          if (user) {
            handleAuthSuccess(user);
          } else {
            const session = AuthService.getAuthSession();
            if (session?.user) {
              handleAuthSuccess(session.user);
            }
          }
          setIsOnboardingFlowOpen(false);
        }}
        onCancel={() => setIsOnboardingFlowOpen(false)}
      />
    );
  }

  return (
    <div id="krishirakshak-app-root" className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative">
      
      {/* Offline Status Simulation Banner */}
      <OfflineBanner
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        pendingCount={cases.filter(c => !c.syncedWithServer).length}
        onSync={handleSyncOffline}
        isSyncing={isSyncing}
      />

      {/* Role-Based Top Navigation Header */}
      <Header
        currentRole={currentRole}
        currentUser={currentUser}
        onSelectRole={handleRoleChange}
        onRoleChange={handleRoleChange}
        onOpenVaani={() => setIsVaaniModalOpen(true)}
        onOpenAuth={() => {
          setOnboardingInitialStage('auth');
          setIsOnboardingFlowOpen(true);
        }}
        onLogout={handleLogout}
        unreadNotifsCount={notifications.filter(n => !n.read).length}
        unreadNotificationCount={notifications.filter(n => !n.read).length}
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
        onOpenDemoGuide={handleOpenProductTour}
        onResetData={handleResetData}
        onResetDemoData={handleResetData}
        onSelectTab={tab => setActiveTab(tab)}
        onNavigate={tab => setActiveTab(tab)}
      />

      {/* Main Split Layout: Sidebar + Screen Content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 gap-6">
        
        {/* Sidebar */}
        <Sidebar
          currentRole={currentRole}
          activeTab={activeTab}
          onSelectTab={tab => setActiveTab(tab)}
          onNavigate={tab => setActiveTab(tab)}
          onOpenVaani={() => setIsVaaniModalOpen(true)}
          onOpenTour={handleOpenProductTour}
          pendingExpertCount={cases.filter(c => c.status === 'needs_expert_review' || c.status === 'pending_expert').length}
          pendingExpertCasesCount={cases.filter(c => c.status === 'needs_expert_review' || c.status === 'pending_expert').length}
          urgentAlertsCount={notifications.filter(n => !n.read && n.type === 'risk_alert').length}
          activeAlertsCount={notifications.filter(n => !n.read && n.type === 'risk_alert').length}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 min-w-0 pb-16">
          
          {/* ================= FARMER VIEWS ================= */}
          {currentRole === 'farmer' && (
            <>
              {activeTab === 'farmer-dashboard' && (
                <FarmerDashboard
                  farms={farms}
                  weather={weather}
                  iotData={iotData}
                  pestTraps={pestTraps}
                  cases={cases}
                  onNavigate={handleNavigate}
                  onRefreshIot={handleRefreshIot}
                  onOpenVaani={() => setIsVaaniModalOpen(true)}
                  onOpenGuidedScan={() => setIsGuidedScanOpen(true)}
                  onOpenTour={handleOpenProductTour}
                />
              )}

              {activeTab === 'my-fields' && (
                <MyFields
                  farms={farms}
                  onNavigate={handleNavigate}
                  onOpenAddFarm={() => setIsAddFarmOpen(true)}
                  onOpenAddCrop={farmId => {
                    setSelectedFarmForCrop(farmId);
                    setIsAddCropOpen(true);
                  }}
                />
              )}

              {activeTab === 'crop-health' && (
                <CropHealthDetail
                  farm={primaryFarm}
                  weather={weather}
                  iotData={iotData}
                  pestTraps={pestTraps}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'crop-scanner' && (
                <CropScanner
                  initialScenarioId={activeScannerScenario}
                  onDiagnosisComplete={handleDiagnosisComplete}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'scan-history' && (
                <ScanHistory
                  cases={cases}
                  onNavigate={handleNavigate}
                  onSelectCaseForAdvisory={c => setSelectedCaseForAdvisory(c)}
                />
              )}

              {activeTab === 'diagnosis-result' && activeDiagnosis && (
                <AiDiagnosisResult
                  diagnosis={activeDiagnosis}
                  onNavigate={handleNavigate}
                  onSwitchRole={handleRoleChange}
                  onRescan={() => setActiveTab('crop-scanner')}
                />
              )}

              {activeTab === 'risk-forecast' && (
                <RiskForecast
                  forecast={weather.forecast7Days}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'pest-monitoring' && (
                <PestMonitoring
                  pestTraps={pestTraps}
                  onNavigate={handleNavigate}
                  onUpdateTrapCount={handleUpdateTrapCount}
                />
              )}

              {(activeTab === 'iot-monitor' || activeTab === 'iot-sensors') && (
                <IotSensorMonitor
                  iotData={iotData}
                  onRefreshIot={handleRefreshIot}
                  onNavigate={handleNavigate}
                />
              )}

              {(activeTab === 'weather-intelligence' || activeTab === 'weather-intel') && (
                <WeatherIntelligence
                  weather={weather}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'advisory' && (
                <AdvisoryView
                  activeCase={selectedCaseForAdvisory || cases[0]}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'follow-up' && (
                <FollowUpMonitoring
                  onNavigate={handleNavigate}
                  onSwitchRole={handleRoleChange}
                />
              )}

              {(activeTab === 'farmer-profile' || activeTab === 'profile') && (
                <FarmerProfile
                  farm={primaryFarm}
                  onResetData={handleResetData}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}

          {/* ================= EXPERT / SCIENTIST VIEWS ================= */}
          {currentRole === 'expert' && (
            <>
              {activeTab === 'expert-queue' && (
                <ExpertQueue
                  cases={cases}
                  onSelectCase={c => setSelectedCaseForReview(c)}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'expert-review' && (
                <ExpertCaseReview
                  caseRecord={caseToReview}
                  onNavigate={handleNavigate}
                  onSwitchRole={handleRoleChange}
                  onApproveSuccess={() => {
                    setCases(StorageService.getCases());
                    setNotifications(StorageService.getNotifications());
                  }}
                />
              )}
            </>
          )}

          {/* ================= AGRICULTURE OFFICER VIEWS ================= */}
          {currentRole === 'officer' && (
            <>
              {activeTab === 'gis-map' && (
                <DistrictGisMap
                  hotspots={hotspots}
                  onNavigate={handleNavigate}
                />
              )}

              {(activeTab === 'outbreak-command' || activeTab === 'outbreak-defense') && (
                <OutbreakDefense
                  hotspots={hotspots}
                  onNavigate={handleNavigate}
                />
              )}

              {(activeTab === 'district-analytics' || activeTab === 'outbreak-analytics') && (
                <DistrictAnalytics
                  hotspots={hotspots}
                  onNavigate={handleNavigate}
                />
              )}

              {/* Safe fallback for any unmatched officer tab */}
              {!['gis-map', 'outbreak-command', 'outbreak-defense', 'district-analytics', 'outbreak-analytics'].includes(activeTab) && (
                <DistrictGisMap
                  hotspots={hotspots}
                  onNavigate={handleNavigate}
                />
              )}
            </>
          )}

          {/* ================= EXTENSION WORKER VIEWS ================= */}
          {currentRole === 'extension' && (
            <>
              {activeTab === 'field-visits' && (
                <ExtensionDashboard
                  visits={fieldVisits}
                  onNavigate={handleNavigate}
                  onSwitchRole={handleRoleChange}
                />
              )}
            </>
          )}

        </main>

      </div>

      {/* Persistent Floating 🎙️ VAANI Voice Assistant Button */}
      <VaaniFloatingButton onClick={() => setIsVaaniModalOpen(true)} />

      {/* Multilingual Voice Assistant Overlay */}
      <VaaniAssistantModal
        isOpen={isVaaniModalOpen}
        onClose={() => setIsVaaniModalOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Guided Scan Mode Overlay */}
      <FarmerGuidedScannerOverlay
        isOpen={isGuidedScanOpen}
        onClose={() => setIsGuidedScanOpen(false)}
        onTriggerCameraAction={() => {
          setIsGuidedScanOpen(false);
          setActiveTab('crop-scanner');
        }}
      />

      {/* SIH 12-Step Evaluation Demo Control Bar */}
      <DemoControlBar
        currentRole={currentRole}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onSelectScenario={scId => {
          setActiveScannerScenario(scId);
        }}
        onResetData={handleResetData}
      />

      {/* Modals & Dialogs */}
      {isAuthModalOpen && (
        <AuthScreen
          initialRole={currentRole}
          initialMode="login"
          onSuccess={(user) => {
            handleAuthSuccess(user);
          }}
          onCancel={() => setIsAuthModalOpen(false)}
        />
      )}

      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        currentRole={currentRole}
        onNavigate={tab => {
          setActiveTab(tab);
          setIsNotifOpen(false);
        }}
      />

      <AddFarmModal
        isOpen={isAddFarmOpen}
        onClose={() => setIsAddFarmOpen(false)}
        onFarmAdded={newFarm => {
          setFarms(StorageService.getFarms());
        }}
      />

      <AddCropModal
        isOpen={isAddCropOpen}
        onClose={() => setIsAddCropOpen(false)}
        farmId={selectedFarmForCrop}
        onCropAdded={newCrop => {
          setFarms(StorageService.getFarms());
        }}
      />

      {/* Mobile-First 4-Tab Bottom Navigation Bar */}
      <BottomNav
        currentRole={currentRole}
        activeTab={activeTab}
        onNavigate={tab => handleNavigate(tab)}
        onOpenVaani={() => setIsVaaniModalOpen(true)}
        onOpenMore={() => handleNavigate('profile')}
      />

    </div>
  );
}
