import {
  Farm,
  CaseRecord,
  IotSensorData,
  PestTrapData,
  WeatherData,
  GisHotspot,
  NotificationItem,
  FieldVisit,
  FollowUpRecord,
  LabReferralDetails,
  UserRole
} from '../types';
import {
  INITIAL_FARMS,
  INITIAL_CASES,
  INITIAL_IOT_NODE,
  INITIAL_PEST_TRAPS,
  INITIAL_WEATHER,
  INITIAL_HOTSPOTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_FIELD_VISITS,
  INITIAL_FOLLOW_UPS
} from '../data/mockData';

const STORAGE_KEYS = {
  FARMS: 'krishirakshak_farms_v1',
  CASES: 'krishirakshak_cases_v1',
  IOT: 'krishirakshak_iot_v1',
  TRAPS: 'krishirakshak_traps_v1',
  WEATHER: 'krishirakshak_weather_v1',
  HOTSPOTS: 'krishirakshak_hotspots_v1',
  NOTIFICATIONS: 'krishirakshak_notifs_v1',
  FIELD_VISITS: 'krishirakshak_visits_v1',
  FOLLOW_UPS: 'krishirakshak_followups_v1',
  OFFLINE_MODE: 'krishirakshak_offline_mode_v1',
  ROLE: 'krishirakshak_role_v1',
  LANGUAGE: 'krishirakshak_lang_v1',
  OFFLINE_PENDING_QUEUE: 'krishirakshak_pending_offline_scans_v1'
};

const notifyChange = (key: string) => {
  window.dispatchEvent(new CustomEvent('krishi_state_change', { detail: { key } }));
};

export const StorageService = {
  // Role
  getCurrentRole(): UserRole {
    const raw = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (raw && ['farmer', 'extension', 'officer', 'expert'].includes(raw)) {
      return raw as UserRole;
    }
    return 'farmer';
  },

  setCurrentRole(role: UserRole) {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    notifyChange('role');
  },

  // Farms
  getFarms(): Farm[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FARMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(INITIAL_FARMS));
      return INITIAL_FARMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FARMS;
    }
  },

  saveFarms(farms: Farm[]) {
    localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(farms));
    notifyChange('farms');
  },

  addFarm(farm: Farm) {
    const farms = this.getFarms();
    farms.unshift(farm);
    this.saveFarms(farms);
  },

  addCropToFarm(farmId: string, crop: Farm['crops'][0]) {
    const farms = this.getFarms();
    const target = farms.find(f => f.id === farmId);
    if (target) {
      target.crops.push(crop);
      this.saveFarms(farms);
    }
  },

  // Cases
  getCases(): CaseRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CASES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
      return INITIAL_CASES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CASES;
    }
  },

  saveCases(cases: CaseRecord[]) {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    notifyChange('cases');
  },

  addCase(caseRecord: CaseRecord) {
    const cases = this.getCases();
    cases.unshift(caseRecord);
    this.saveCases(cases);

    // Also trigger notification
    this.addNotification({
      id: `notif-${Date.now()}`,
      title: `New Scan Analyzed: ${caseRecord.cropName} (${caseRecord.diagnosis?.diseaseName || caseRecord.diseaseName})`,
      message: caseRecord.diagnosis?.needsExpertReview || caseRecord.status === 'needs_expert_review'
        ? `Confidence ${caseRecord.diagnosis?.confidence || caseRecord.confidence}%. Routed to Expert Validation Queue.`
        : `Confidence ${caseRecord.diagnosis?.confidence || caseRecord.confidence}%. Safe IPM Advisory generated.`,
      timestamp: 'Just now',
      type: caseRecord.status === 'needs_expert_review' ? 'expert_update' : 'risk_alert',
      riskLevel: caseRecord.diagnosis?.riskScore?.riskLevel || caseRecord.riskScore?.riskLevel || 'low',
      read: false,
      targetRole: caseRecord.status === 'needs_expert_review' ? 'expert' : 'farmer',
      actionPath: caseRecord.status === 'needs_expert_review' ? 'expert-queue' : 'advisory'
    });
  },

  updateCaseStatus(caseId: string, status: CaseRecord['status'], expertNotes?: string) {
    const cases = this.getCases();
    const target = cases.find(c => c.id === caseId);
    if (target) {
      target.status = status;
      if (expertNotes) target.expertNotes = expertNotes;
      target.updatedAt = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.saveCases(cases);
    }
  },

  referCaseToLab(caseId: string, labReferral: LabReferralDetails) {
    const cases = this.getCases();
    const target = cases.find(c => c.id === caseId);
    if (target) {
      target.status = 'lab_investigation_pending';
      target.labReferral = labReferral;
      target.expertNotes = `Referred to ${labReferral.labName} (${labReferral.labId}): ${labReferral.referralReason}`;
      target.updatedAt = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      target.expertReview = {
        expertId: 'EXP-IND-01',
        expertName: labReferral.referredByExpert || 'Dr. Ananya Sharma (Lead Scientist)',
        reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
        action: 'lab_requested',
        confirmedDisease: `Laboratory Referral Flagged (${labReferral.labId})`,
        comments: `Flagged for ${labReferral.testRequested} at ${labReferral.labName}. Reason: ${labReferral.referralReason}`
      };

      this.saveCases(cases);

      // Notification for Farmer
      this.addNotification({
        id: `notif-lab-${Date.now()}`,
        title: `🔬 Lab Referral Tagged: Case #${caseId} (${labReferral.labId})`,
        message: `Expert flagged foliar sample for ${labReferral.testRequested} at ${labReferral.labName}. Status: Laboratory Investigation Pending.`,
        timestamp: 'Just now',
        type: 'expert_update',
        riskLevel: target.diagnosis?.riskScore?.riskLevel || target.riskScore?.riskLevel || 'high',
        read: false,
        targetRole: 'farmer',
        actionPath: 'advisory'
      });

      // Notification for Extension Officer (Physical Sample Pickup)
      this.addNotification({
        id: `notif-ext-lab-${Date.now()}`,
        title: `Field Sample Collection: Lab Tag ${labReferral.labId}`,
        message: `Collect foliar tissue sample from ${target.farmerName} (${target.village}) and dispatch to ${labReferral.labName}. Priority: ${labReferral.priority}.`,
        timestamp: 'Just now',
        type: 'general',
        riskLevel: target.diagnosis?.riskScore?.riskLevel || target.riskScore?.riskLevel || 'high',
        read: false,
        targetRole: 'extension',
        actionPath: 'field-visits'
      });
    }
  },

  confirmCaseByExpert(
    caseId: string,
    action: 'confirmed' | 'corrected' | 'lab_requested',
    confirmedDisease: string,
    comments: string,
    expertName: string = 'Dr. Ananya Sharma (Senior Agronomist)'
  ) {
    const cases = this.getCases();
    const target = cases.find(c => c.id === caseId);
    if (target) {
      target.status = action === 'lab_requested' ? 'lab_requested' : 'expert_confirmed';
      target.expertReview = {
        expertId: 'EXP-IND-01',
        expertName,
        reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
        action,
        confirmedDisease,
        comments
      };
      if (target.advisory) {
        target.advisory.diseaseName = confirmedDisease;
        target.advisory.expertName = expertName;
        target.advisory.isExpertApproved = true;
      }

      this.saveCases(cases);

      // Create notification for farmer
      this.addNotification({
        id: `notif-${Date.now()}`,
        title: `Expert Validation Complete for Case #${caseId}`,
        message: `${expertName} confirmed diagnosis for your ${target.cropName} field: "${confirmedDisease}". Safe advisory is ready.`,
        timestamp: 'Just now',
        type: 'expert_update',
        riskLevel: target.diagnosis?.riskScore?.riskLevel || target.riskScore?.riskLevel || 'low',
        read: false,
        targetRole: 'farmer',
        actionPath: 'advisory'
      });

      // Update GIS Hotspot count
      const hotspots = this.getHotspots();
      const match = hotspots.find(h => (h.village || h.villageName || '').toLowerCase().includes(target.village.toLowerCase()) || h.block.toLowerCase().includes(target.block.toLowerCase()));
      if (match) {
        match.confirmedCases = (match.confirmedCases || 0) + 1;
        this.saveHotspots(hotspots);
      }
    }
  },

  // IoT Sensor
  getIotData(): IotSensorData {
    const raw = localStorage.getItem(STORAGE_KEYS.IOT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.IOT, JSON.stringify(INITIAL_IOT_NODE));
      return INITIAL_IOT_NODE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_IOT_NODE;
    }
  },

  refreshIotTelemetry(): IotSensorData {
    const current = this.getIotData();
    const tempDelta = (Math.random() * 0.8 - 0.4);
    const humidityDelta = (Math.random() * 2 - 1);
    const moistureDelta = (Math.random() * 1.5 - 0.7);

    const newTemp = +(current.temperature + tempDelta).toFixed(1);
    const newHumidity = Math.min(96, Math.max(65, +(current.humidity + humidityDelta).toFixed(0)));
    const newMoisture = Math.min(80, Math.max(30, +(current.soilMoisture + moistureDelta).toFixed(0)));
    const newLeafWetness = newHumidity > 80 ? 88 : 72;

    const updated: IotSensorData = {
      ...current,
      temperature: newTemp,
      humidity: newHumidity,
      soilMoisture: newMoisture,
      leafWetnessScore: newLeafWetness,
      leafWetnessLabel: newLeafWetness > 80 ? 'High' : 'Moderate',
      lastUpdated: 'Just now (Telemetric Ping received)'
    };

    localStorage.setItem(STORAGE_KEYS.IOT, JSON.stringify(updated));
    notifyChange('iot');
    return updated;
  },

  simulateIotUpdate(): IotSensorData {
    return this.refreshIotTelemetry();
  },

  // Pest Traps
  getPestTraps(): PestTrapData[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRAPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRAPS, JSON.stringify(INITIAL_PEST_TRAPS));
      return INITIAL_PEST_TRAPS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PEST_TRAPS;
    }
  },

  savePestTraps(traps: PestTrapData[]) {
    localStorage.setItem(STORAGE_KEYS.TRAPS, JSON.stringify(traps));
    notifyChange('traps');
  },

  updateTrapCount(trapId: string, count: number): PestTrapData[] {
    const traps = this.getPestTraps();
    const trap = traps.find(t => t.trapId === trapId);
    if (trap) {
      trap.currentCount = count;
      trap.status = count >= trap.threshold ? 'above_threshold' : 'normal';
      trap.lastChecked = 'Just now';
      trap.history.push({ date: 'Today (Live update)', count });
      this.savePestTraps(traps);
    }
    return traps;
  },

  updatePestTrapCount(trapId: string, count: number): PestTrapData[] {
    return this.updateTrapCount(trapId, count);
  },

  // Weather
  getWeather(): WeatherData {
    const raw = localStorage.getItem(STORAGE_KEYS.WEATHER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(INITIAL_WEATHER));
      return INITIAL_WEATHER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_WEATHER;
    }
  },

  // Hotspots
  getHotspots(): GisHotspot[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HOTSPOTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify(INITIAL_HOTSPOTS));
      return INITIAL_HOTSPOTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_HOTSPOTS;
    }
  },

  saveHotspots(hotspots: GisHotspot[]) {
    localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify(hotspots));
    notifyChange('hotspots');
  },

  // Follow-ups
  getFollowUps(): FollowUpRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(INITIAL_FOLLOW_UPS));
      return INITIAL_FOLLOW_UPS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FOLLOW_UPS;
    }
  },

  addFollowUp(record: FollowUpRecord) {
    const followUps = this.getFollowUps();
    followUps.unshift(record);
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(followUps));
    notifyChange('followups');

    // Add notification
    this.addNotification({
      id: `notif-${Date.now()}`,
      title: 'Follow-Up Treatment Verified & Logged',
      message: `Foliar recovery verified for ${record.cropName}. Field risk reduced from ${record.initialRiskScore || record.beforeRiskScore} to ${record.followUpRiskScore || record.afterRiskScore}. Data added to Research Retraining Queue.`,
      timestamp: 'Just now',
      type: 'followup_reminder',
      riskLevel: 'low',
      read: false,
      targetRole: 'farmer',
      actionPath: 'follow-up'
    });
  },

  // Field Visits
  getFieldVisits(): FieldVisit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FIELD_VISITS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FIELD_VISITS, JSON.stringify(INITIAL_FIELD_VISITS));
      return INITIAL_FIELD_VISITS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FIELD_VISITS;
    }
  },

  completeFieldVisit(visitId: string, notes: string) {
    const visits = this.getFieldVisits();
    const v = visits.find(item => item.id === visitId);
    if (v) {
      v.status = 'Completed';
      v.observations = notes;
      v.geoVerified = true;
      localStorage.setItem(STORAGE_KEYS.FIELD_VISITS, JSON.stringify(visits));
      notifyChange('visits');
    }
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  addNotification(notif: NotificationItem) {
    const list = this.getNotifications();
    list.unshift(notif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    notifyChange('notifications');
  },

  markNotificationRead(id: string) {
    const list = this.getNotifications();
    const target = list.find(n => n.id === id);
    if (target) {
      target.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
      notifyChange('notifications');
    }
  },

  markAllNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    notifyChange('notifications');
  },

  // Offline Mode
  getOfflineMode(): boolean {
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE) === 'true';
  },

  setOfflineMode(enabled: boolean) {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, enabled ? 'true' : 'false');
    notifyChange('offline');
  },

  getOfflinePendingScans(): any[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_PENDING_QUEUE);
    return raw ? JSON.parse(raw) : [];
  },

  addOfflinePendingScan(scan: any) {
    const queue = this.getOfflinePendingScans();
    queue.push(scan);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_PENDING_QUEUE, JSON.stringify(queue));
    notifyChange('offline_queue');
  },

  clearOfflinePendingScans() {
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_PENDING_QUEUE);
    notifyChange('offline_queue');
  },

  // Reset demo state
  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(INITIAL_FARMS));
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    localStorage.setItem(STORAGE_KEYS.IOT, JSON.stringify(INITIAL_IOT_NODE));
    localStorage.setItem(STORAGE_KEYS.TRAPS, JSON.stringify(INITIAL_PEST_TRAPS));
    localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(INITIAL_WEATHER));
    localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify(INITIAL_HOTSPOTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.FIELD_VISITS, JSON.stringify(INITIAL_FIELD_VISITS));
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(INITIAL_FOLLOW_UPS));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, 'false');
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_PENDING_QUEUE);
    notifyChange('reset_all');
  }
};
