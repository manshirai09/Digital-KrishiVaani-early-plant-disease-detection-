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
  UserRole,
  Dataset,
  DatasetImage
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
  INITIAL_FOLLOW_UPS,
  INITIAL_DATASETS,
  INITIAL_DATASET_IMAGES
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
  OFFLINE_PENDING_QUEUE: 'krishirakshak_pending_offline_scans_v1',
  DATASETS: 'krishirakshak_datasets_v1',
  DATASET_IMAGES: 'krishirakshak_dataset_images_v1'
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
      const parsed: CaseRecord[] = JSON.parse(raw);
      let changed = false;
      parsed.forEach(c => {
        if (c.id === 'KR-1024' || (c.cropName === 'Cotton' && (c.diseaseName?.includes('Cercospora') || c.diagnosis?.diseaseName?.includes('Cercospora')))) {
          if (c.imageUrl !== '/TomatoYellowCurlVirus1.JPG.jpeg') {
            c.imageUrl = '/TomatoYellowCurlVirus1.JPG.jpeg';
            changed = true;
          }
          if (c.diagnosis && c.diagnosis.sampleImageUrl !== '/TomatoYellowCurlVirus1.JPG.jpeg') {
            c.diagnosis.sampleImageUrl = '/TomatoYellowCurlVirus1.JPG.jpeg';
            changed = true;
          }
        }
      });
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_CASES;
    }
  },

  saveCases(cases: CaseRecord[]) {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    notifyChange('cases');
  },

  updateCaseImage(caseId: string, imageUrl: string) {
    const cases = this.getCases();
    const target = cases.find(c => c.id === caseId);
    if (target) {
      target.imageUrl = imageUrl;
      if (target.diagnosis) {
        target.diagnosis.sampleImageUrl = imageUrl;
      }
      target.updatedAt = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.saveCases(cases);
    }
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

  addFieldVisit(visit: FieldVisit): FieldVisit[] {
    const visits = this.getFieldVisits();
    visits.unshift(visit);
    localStorage.setItem(STORAGE_KEYS.FIELD_VISITS, JSON.stringify(visits));
    notifyChange('visits');
    return visits;
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

  syncOfflinePendingScans(): any[] {
    const pending = this.getOfflinePendingScans();
    if (pending.length === 0) return [];
    
    const cases = this.getCases();
    pending.forEach(scan => {
      const exists = cases.some(c => c.caseId === scan.caseId);
      if (!exists) {
        cases.unshift({
          id: scan.id || `case-${Date.now()}-${Math.random()}`,
          caseId: scan.caseId || `KR-${Math.floor(1000 + Math.random() * 9000)}`,
          farmId: 'farm-01',
          cropName: scan.diseaseName?.includes('Soybean') ? 'Soybean' : 'Cotton',
          diseaseName: scan.diseaseName || 'Crop Health Observation',
          pathogenType: scan.pathogenType || 'Fungal',
          confidence: scan.confidence || 85,
          severityScore: scan.severityPercent || 25,
          riskScore: scan.riskScore?.overallScore || 40,
          status: scan.needsExpertReview ? 'needs_expert_review' : 'resolved',
          createdAt: new Date().toISOString().split('T')[0],
          timestamp: 'Just now (Synced from offline)',
          imageUrl: scan.sampleImageUrl || '/cotton_leaf_spot.svg',
          symptoms: scan.symptomPattern || 'Detected via Edge AI MobileNetV3',
          voiceNoteText: scan.notes
        });
      }
    });

    this.saveCases(cases);
    this.clearOfflinePendingScans();
    return pending;
  },

  // Datasets Management
  getDatasets(): Dataset[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DATASETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(INITIAL_DATASETS));
      return INITIAL_DATASETS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DATASETS;
    }
  },

  saveDatasets(datasets: Dataset[]) {
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));
    notifyChange('datasets');
  },

  addDataset(dataset: Dataset) {
    const datasets = this.getDatasets();
    datasets.unshift(dataset);
    this.saveDatasets(datasets);
  },

  updateDataset(datasetId: string, updates: Partial<Dataset>) {
    const datasets = this.getDatasets();
    const index = datasets.findIndex(d => d.id === datasetId);
    if (index !== -1) {
      datasets[index] = { ...datasets[index], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
      this.saveDatasets(datasets);
    }
  },

  deleteDataset(datasetId: string) {
    const datasets = this.getDatasets().filter(d => d.id !== datasetId);
    this.saveDatasets(datasets);
    const images = this.getDatasetImages().filter(img => img.datasetId !== datasetId);
    this.saveDatasetImages(images);
  },

  // Dataset Images Management
  getDatasetImages(datasetId?: string): DatasetImage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DATASET_IMAGES);
    let images: DatasetImage[] = [];
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DATASET_IMAGES, JSON.stringify(INITIAL_DATASET_IMAGES));
      images = INITIAL_DATASET_IMAGES;
    } else {
      try {
        images = JSON.parse(raw);
      } catch {
        images = INITIAL_DATASET_IMAGES;
      }
    }
    if (datasetId) {
      return images.filter(img => img.datasetId === datasetId);
    }
    return images;
  },

  saveDatasetImages(images: DatasetImage[]) {
    localStorage.setItem(STORAGE_KEYS.DATASET_IMAGES, JSON.stringify(images));
    notifyChange('dataset_images');
  },

  addImageToDataset(image: DatasetImage) {
    const images = this.getDatasetImages();
    images.unshift(image);
    this.saveDatasetImages(images);

    // Update dataset count
    const datasets = this.getDatasets();
    const dataset = datasets.find(d => d.id === image.datasetId);
    if (dataset) {
      dataset.imageCount = (dataset.imageCount || 0) + 1;
      if (image.boundingBoxes && image.boundingBoxes.length > 0) {
        dataset.annotatedCount = (dataset.annotatedCount || 0) + 1;
      }
      if (image.verificationStatus === 'verified_by_scientist') {
        dataset.verifiedCount = (dataset.verifiedCount || 0) + 1;
      }
      dataset.updatedAt = new Date().toISOString().split('T')[0];
      this.saveDatasets(datasets);
    }

    // Add notification
    this.addNotification({
      id: `notif-img-${Date.now()}`,
      title: `Image Added to Dataset: ${dataset?.name || image.cropName}`,
      message: `New labeled sample for ${image.diseaseLabel} (${image.cropName}) added to training archive.`,
      timestamp: 'Just now',
      type: 'expert_update',
      riskLevel: 'low',
      read: false,
      targetRole: 'expert',
      actionPath: 'datasets'
    });
  },

  addBatchImagesToDataset(newImages: DatasetImage[]) {
    if (newImages.length === 0) return;
    const images = this.getDatasetImages();
    const updatedImages = [...newImages, ...images];
    this.saveDatasetImages(updatedImages);

    // Recalculate counts for impacted datasets
    const datasets = this.getDatasets();
    datasets.forEach(ds => {
      const dsImages = updatedImages.filter(img => img.datasetId === ds.id);
      ds.imageCount = dsImages.length;
      ds.annotatedCount = dsImages.filter(img => img.boundingBoxes && img.boundingBoxes.length > 0).length;
      ds.verifiedCount = dsImages.filter(img => img.verificationStatus === 'verified_by_scientist').length;
      ds.updatedAt = new Date().toISOString().split('T')[0];
    });
    this.saveDatasets(datasets);
  },

  updateDatasetImage(imageId: string, updates: Partial<DatasetImage>) {
    const images = this.getDatasetImages();
    const index = images.findIndex(img => img.id === imageId);
    if (index !== -1) {
      images[index] = { ...images[index], ...updates };
      this.saveDatasetImages(images);

      // Refresh dataset metrics
      const datasetId = images[index].datasetId;
      const datasets = this.getDatasets();
      const dataset = datasets.find(d => d.id === datasetId);
      if (dataset) {
        const dsImages = images.filter(img => img.datasetId === datasetId);
        dataset.annotatedCount = dsImages.filter(img => img.boundingBoxes && img.boundingBoxes.length > 0).length;
        dataset.verifiedCount = dsImages.filter(img => img.verificationStatus === 'verified_by_scientist').length;
        this.saveDatasets(datasets);
      }
    }
  },

  deleteDatasetImage(imageId: string) {
    const images = this.getDatasetImages();
    const target = images.find(img => img.id === imageId);
    const filtered = images.filter(img => img.id !== imageId);
    this.saveDatasetImages(filtered);

    if (target) {
      const datasets = this.getDatasets();
      const dataset = datasets.find(d => d.id === target.datasetId);
      if (dataset) {
        const dsImages = filtered.filter(img => img.datasetId === target.datasetId);
        dataset.imageCount = dsImages.length;
        dataset.annotatedCount = dsImages.filter(img => img.boundingBoxes && img.boundingBoxes.length > 0).length;
        dataset.verifiedCount = dsImages.filter(img => img.verificationStatus === 'verified_by_scientist').length;
        this.saveDatasets(datasets);
      }
    }
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
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(INITIAL_DATASETS));
    localStorage.setItem(STORAGE_KEYS.DATASET_IMAGES, JSON.stringify(INITIAL_DATASET_IMAGES));
    notifyChange('reset_all');
  }
};
