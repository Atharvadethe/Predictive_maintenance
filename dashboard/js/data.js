/* ===================================================================
   DATA.JS — Predictive Maintenance Dashboard Data Layer
   All data derived from real CSV datasets + expanded synthetic assets
   =================================================================== */

const DATA = (() => {

    // ─────────────────────────────────────────────
    // 1. ASSET REGISTRY (from 01_assets_registry.csv + expanded)
    // ─────────────────────────────────────────────
    const assets = [
        // Plant-A (Original 4 from CSV + 6 new)
        { id: 'CMP-001', type: 'compressor', site: 'Plant-A', area: 'Utilities', criticality: 'High', installDate: '2019-03-15', manufacturer: 'Atlas Copco', model: 'GA-160' },
        { id: 'CMP-002', type: 'compressor', site: 'Plant-A', area: 'Utilities', criticality: 'Medium', installDate: '2020-06-22', manufacturer: 'Atlas Copco', model: 'GA-110' },
        { id: 'MTR-001', type: 'motor', site: 'Plant-A', area: 'Line-1', criticality: 'High', installDate: '2018-11-10', manufacturer: 'Siemens', model: 'SIMOTICS-1LE1' },
        { id: 'MTR-002', type: 'motor', site: 'Plant-A', area: 'Line-2', criticality: 'Medium', installDate: '2021-01-05', manufacturer: 'Siemens', model: 'SIMOTICS-1LE3' },
        { id: 'PMP-001', type: 'pump', site: 'Plant-A', area: 'Line-1', criticality: 'High', installDate: '2019-08-20', manufacturer: 'Grundfos', model: 'CRE-45' },
        { id: 'PMP-002', type: 'pump', site: 'Plant-A', area: 'Utilities', criticality: 'Medium', installDate: '2020-04-12', manufacturer: 'Grundfos', model: 'CRE-32' },
        { id: 'TRB-001', type: 'turbine', site: 'Plant-A', area: 'Power', criticality: 'High', installDate: '2017-06-01', manufacturer: 'GE Power', model: 'LM2500' },
        { id: 'CMP-003', type: 'compressor', site: 'Plant-A', area: 'Line-2', criticality: 'Low', installDate: '2022-02-18', manufacturer: 'Ingersoll Rand', model: 'R-Series 90' },
        { id: 'MTR-003', type: 'motor', site: 'Plant-A', area: 'Line-1', criticality: 'Medium', installDate: '2020-09-30', manufacturer: 'ABB', model: 'M3BP-280' },
        { id: 'MTR-004', type: 'motor', site: 'Plant-A', area: 'Utilities', criticality: 'Low', installDate: '2021-07-14', manufacturer: 'ABB', model: 'M3BP-200' },

        // Plant-B (10 assets)
        { id: 'CMP-004', type: 'compressor', site: 'Plant-B', area: 'Utilities', criticality: 'High', installDate: '2018-04-10', manufacturer: 'Atlas Copco', model: 'GA-200' },
        { id: 'CMP-005', type: 'compressor', site: 'Plant-B', area: 'Line-1', criticality: 'Medium', installDate: '2021-03-25', manufacturer: 'Kaeser', model: 'ASD-40' },
        { id: 'MTR-005', type: 'motor', site: 'Plant-B', area: 'Line-1', criticality: 'High', installDate: '2019-12-08', manufacturer: 'Siemens', model: 'SIMOTICS-1LE1' },
        { id: 'MTR-006', type: 'motor', site: 'Plant-B', area: 'Line-2', criticality: 'Medium', installDate: '2020-08-16', manufacturer: 'WEG', model: 'W22-315' },
        { id: 'PMP-003', type: 'pump', site: 'Plant-B', area: 'Line-1', criticality: 'High', installDate: '2018-10-05', manufacturer: 'Sulzer', model: 'MSD-RO' },
        { id: 'PMP-004', type: 'pump', site: 'Plant-B', area: 'Line-2', criticality: 'Medium', installDate: '2021-05-20', manufacturer: 'KSB', model: 'Etanorm' },
        { id: 'PMP-005', type: 'pump', site: 'Plant-B', area: 'Utilities', criticality: 'Low', installDate: '2022-01-12', manufacturer: 'Grundfos', model: 'CR-15' },
        { id: 'TRB-002', type: 'turbine', site: 'Plant-B', area: 'Power', criticality: 'High', installDate: '2016-09-20', manufacturer: 'Siemens Energy', model: 'SGT-800' },
        { id: 'TRB-003', type: 'turbine', site: 'Plant-B', area: 'Power', criticality: 'High', installDate: '2019-11-15', manufacturer: 'GE Power', model: 'LM6000' },
        { id: 'MTR-007', type: 'motor', site: 'Plant-B', area: 'Utilities', criticality: 'Low', installDate: '2022-06-08', manufacturer: 'ABB', model: 'M3BP-160' },

        // Plant-C (10 assets)
        { id: 'CMP-006', type: 'compressor', site: 'Plant-C', area: 'Utilities', criticality: 'High', installDate: '2019-05-22', manufacturer: 'Ingersoll Rand', model: 'R-Series 160' },
        { id: 'CMP-007', type: 'compressor', site: 'Plant-C', area: 'Line-1', criticality: 'Medium', installDate: '2021-08-30', manufacturer: 'Kaeser', model: 'BSD-72' },
        { id: 'MTR-008', type: 'motor', site: 'Plant-C', area: 'Line-1', criticality: 'High', installDate: '2018-07-14', manufacturer: 'Siemens', model: 'SIMOTICS-1LE5' },
        { id: 'MTR-009', type: 'motor', site: 'Plant-C', area: 'Line-2', criticality: 'Medium', installDate: '2020-12-01', manufacturer: 'WEG', model: 'W22-250' },
        { id: 'PMP-006', type: 'pump', site: 'Plant-C', area: 'Line-2', criticality: 'High', installDate: '2019-02-28', manufacturer: 'Sulzer', model: 'MCE-150' },
        { id: 'PMP-007', type: 'pump', site: 'Plant-C', area: 'Utilities', criticality: 'Medium', installDate: '2021-04-10', manufacturer: 'KSB', model: 'MegaCPK' },
        { id: 'TRB-004', type: 'turbine', site: 'Plant-C', area: 'Power', criticality: 'High', installDate: '2017-10-18', manufacturer: 'MHI', model: 'H-25' },
        { id: 'TRB-005', type: 'turbine', site: 'Plant-C', area: 'Power', criticality: 'Medium', installDate: '2020-03-05', manufacturer: 'Solar Turbines', model: 'Titan-130' },
        { id: 'CMP-008', type: 'compressor', site: 'Plant-C', area: 'Line-2', criticality: 'Low', installDate: '2022-09-15', manufacturer: 'Atlas Copco', model: 'GA-75' },
        { id: 'MTR-010', type: 'motor', site: 'Plant-C', area: 'Line-1', criticality: 'Low', installDate: '2023-01-20', manufacturer: 'ABB', model: 'M3BP-132' },
    ];

    // ─────────────────────────────────────────────
    // 2. OT TAG CATALOG (from 03_ot_tag_catalog.csv)
    // ─────────────────────────────────────────────
    const tagCatalog = [
        { assetType: 'compressor', tagName: 'vibration_rms', unit: 'mm/s', samplingSec: 60, sourceSystem: 'PI', measurementType: 'condition' },
        { assetType: 'compressor', tagName: 'bearing_temp', unit: '°C', samplingSec: 60, sourceSystem: 'PI', measurementType: 'condition' },
        { assetType: 'compressor', tagName: 'discharge_pressure', unit: 'bar', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'process' },
        { assetType: 'compressor', tagName: 'suction_pressure', unit: 'bar', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'process' },
        { assetType: 'compressor', tagName: 'motor_current', unit: 'A', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'electrical' },
        { assetType: 'compressor', tagName: 'ambient_temp', unit: '°C', samplingSec: 300, sourceSystem: 'IoT', measurementType: 'environment' },
        { assetType: 'compressor', tagName: 'run_status', unit: 'bool', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'status' },
        { assetType: 'motor', tagName: 'vibration_rms', unit: 'mm/s', samplingSec: 60, sourceSystem: 'PI', measurementType: 'condition' },
        { assetType: 'motor', tagName: 'winding_temp', unit: '°C', samplingSec: 60, sourceSystem: 'PI', measurementType: 'condition' },
        { assetType: 'motor', tagName: 'current_rms', unit: 'A', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'electrical' },
        { assetType: 'motor', tagName: 'voltage_imbalance', unit: '%', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'electrical' },
        { assetType: 'motor', tagName: 'rpm', unit: 'rpm', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'process' },
        { assetType: 'motor', tagName: 'ambient_temp', unit: '°C', samplingSec: 300, sourceSystem: 'IoT', measurementType: 'environment' },
        { assetType: 'motor', tagName: 'run_status', unit: 'bool', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'status' },
        { assetType: 'pump', tagName: 'vibration_rms', unit: 'mm/s', samplingSec: 60, sourceSystem: 'PI', measurementType: 'condition' },
        { assetType: 'pump', tagName: 'bearing_temp', unit: '°C', samplingSec: 60, sourceSystem: 'PI', measurementType: 'condition' },
        { assetType: 'pump', tagName: 'flow_rate', unit: 'm³/h', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'process' },
        { assetType: 'pump', tagName: 'discharge_pressure', unit: 'bar', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'process' },
        { assetType: 'pump', tagName: 'motor_current', unit: 'A', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'electrical' },
        { assetType: 'pump', tagName: 'run_status', unit: 'bool', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'status' },
        { assetType: 'turbine', tagName: 'vibration_rms', unit: 'mm/s', samplingSec: 60, sourceSystem: 'PI', measurementType: 'condition' },
        { assetType: 'turbine', tagName: 'exhaust_temp', unit: '°C', samplingSec: 60, sourceSystem: 'PI', measurementType: 'condition' },
        { assetType: 'turbine', tagName: 'inlet_pressure', unit: 'bar', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'process' },
        { assetType: 'turbine', tagName: 'power_output', unit: 'MW', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'process' },
        { assetType: 'turbine', tagName: 'rpm', unit: 'rpm', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'process' },
        { assetType: 'turbine', tagName: 'run_status', unit: 'bool', samplingSec: 60, sourceSystem: 'SCADA', measurementType: 'status' },
    ];

    // ─────────────────────────────────────────────
    // 3. THRESHOLD RULES (from 04_threshold_rules.csv + expanded)
    // ─────────────────────────────────────────────
    const thresholdRules = [
        { assetType: 'compressor', tagName: 'vibration_rms', ruleType: 'static_threshold', warn: 6.0, crit: 9.0, windowPts: 30, enabled: true },
        { assetType: 'compressor', tagName: 'bearing_temp', ruleType: 'static_threshold', warn: 85.0, crit: 100.0, windowPts: 30, enabled: true },
        { assetType: 'compressor', tagName: 'discharge_pressure', ruleType: 'zscore', warn: 2.0, crit: 3.0, windowPts: 60, enabled: true },
        { assetType: 'compressor', tagName: 'motor_current', ruleType: 'slope', warn: 0.03, crit: 0.05, windowPts: 120, enabled: true },
        { assetType: 'motor', tagName: 'vibration_rms', ruleType: 'static_threshold', warn: 5.5, crit: 8.5, windowPts: 30, enabled: true },
        { assetType: 'motor', tagName: 'winding_temp', ruleType: 'static_threshold', warn: 90.0, crit: 110.0, windowPts: 30, enabled: true },
        { assetType: 'motor', tagName: 'current_rms', ruleType: 'zscore', warn: 2.0, crit: 3.0, windowPts: 60, enabled: true },
        { assetType: 'motor', tagName: 'voltage_imbalance', ruleType: 'static_threshold', warn: 2.5, crit: 4.0, windowPts: 30, enabled: true },
        { assetType: 'pump', tagName: 'vibration_rms', ruleType: 'static_threshold', warn: 5.0, crit: 8.0, windowPts: 30, enabled: true },
        { assetType: 'pump', tagName: 'bearing_temp', ruleType: 'static_threshold', warn: 80.0, crit: 95.0, windowPts: 30, enabled: true },
        { assetType: 'pump', tagName: 'flow_rate', ruleType: 'zscore', warn: 2.0, crit: 3.0, windowPts: 60, enabled: true },
        { assetType: 'pump', tagName: 'motor_current', ruleType: 'slope', warn: 0.03, crit: 0.05, windowPts: 120, enabled: true },
        { assetType: 'turbine', tagName: 'vibration_rms', ruleType: 'static_threshold', warn: 7.0, crit: 10.0, windowPts: 30, enabled: true },
        { assetType: 'turbine', tagName: 'exhaust_temp', ruleType: 'static_threshold', warn: 550.0, crit: 620.0, windowPts: 30, enabled: true },
        { assetType: 'turbine', tagName: 'inlet_pressure', ruleType: 'zscore', warn: 2.0, crit: 3.0, windowPts: 60, enabled: true },
    ];

    // ─────────────────────────────────────────────
    // 4. MODEL WEIGHTS (from 05_model_weights.csv + expanded)
    // ─────────────────────────────────────────────
    const modelWeights = [
        { assetType: 'compressor', tagName: 'vibration_rms', weight: 0.4 },
        { assetType: 'compressor', tagName: 'bearing_temp', weight: 0.3 },
        { assetType: 'compressor', tagName: 'motor_current', weight: 0.2 },
        { assetType: 'compressor', tagName: 'discharge_pressure', weight: 0.1 },
        { assetType: 'motor', tagName: 'vibration_rms', weight: 0.4 },
        { assetType: 'motor', tagName: 'winding_temp', weight: 0.3 },
        { assetType: 'motor', tagName: 'voltage_imbalance', weight: 0.15 },
        { assetType: 'motor', tagName: 'current_rms', weight: 0.15 },
        { assetType: 'pump', tagName: 'vibration_rms', weight: 0.35 },
        { assetType: 'pump', tagName: 'bearing_temp', weight: 0.30 },
        { assetType: 'pump', tagName: 'flow_rate', weight: 0.20 },
        { assetType: 'pump', tagName: 'motor_current', weight: 0.15 },
        { assetType: 'turbine', tagName: 'vibration_rms', weight: 0.35 },
        { assetType: 'turbine', tagName: 'exhaust_temp', weight: 0.30 },
        { assetType: 'turbine', tagName: 'inlet_pressure', weight: 0.20 },
        { assetType: 'turbine', tagName: 'rpm', weight: 0.15 },
    ];

    // ─────────────────────────────────────────────
    // 5. SCENARIO EVENTS (from 08_scenario_events_v2.csv + expanded)
    // ─────────────────────────────────────────────
    const scenarioEvents = [
        { timestamp: '2026-04-03T00:00:00Z', assetId: 'CMP-001', eventType: 'DEGRADATION_START', failureMode: 'bearing_wear' },
        { timestamp: '2026-04-07T00:00:00Z', assetId: 'CMP-001', eventType: 'FAILURE_IMMINENT', failureMode: 'bearing_wear' },
        { timestamp: '2026-04-07T08:00:00Z', assetId: 'CMP-001', eventType: 'MAINTENANCE_COMPLETED', failureMode: '' },
        { timestamp: '2026-04-04T00:00:00Z', assetId: 'CMP-002', eventType: 'DEGRADATION_START', failureMode: 'valve_leak' },
        { timestamp: '2026-04-06T12:00:00Z', assetId: 'CMP-002', eventType: 'FAILURE_IMMINENT', failureMode: 'valve_leak' },
        { timestamp: '2026-04-06T18:00:00Z', assetId: 'CMP-002', eventType: 'MAINTENANCE_COMPLETED', failureMode: '' },
        { timestamp: '2026-04-03T08:00:00Z', assetId: 'MTR-001', eventType: 'DEGRADATION_START', failureMode: 'thermal_runaway' },
        { timestamp: '2026-04-07T02:00:00Z', assetId: 'MTR-001', eventType: 'FAILURE_IMMINENT', failureMode: 'thermal_runaway' },
        { timestamp: '2026-04-07T06:00:00Z', assetId: 'MTR-001', eventType: 'MAINTENANCE_COMPLETED', failureMode: '' },
        { timestamp: '2026-04-05T00:00:00Z', assetId: 'MTR-002', eventType: 'DEGRADATION_START', failureMode: 'misalignment' },
        { timestamp: '2026-04-07T10:00:00Z', assetId: 'MTR-002', eventType: 'FAILURE_IMMINENT', failureMode: 'misalignment' },
        { timestamp: '2026-04-07T14:00:00Z', assetId: 'MTR-002', eventType: 'MAINTENANCE_COMPLETED', failureMode: '' },
        // Expanded events for synthetic assets
        { timestamp: '2026-04-10T06:00:00Z', assetId: 'PMP-003', eventType: 'DEGRADATION_START', failureMode: 'seal_leak' },
        { timestamp: '2026-04-14T10:00:00Z', assetId: 'PMP-003', eventType: 'FAILURE_IMMINENT', failureMode: 'seal_leak' },
        { timestamp: '2026-04-12T00:00:00Z', assetId: 'TRB-002', eventType: 'DEGRADATION_START', failureMode: 'blade_erosion' },
        { timestamp: '2026-04-18T16:00:00Z', assetId: 'TRB-002', eventType: 'FAILURE_IMMINENT', failureMode: 'blade_erosion' },
        { timestamp: '2026-04-15T12:00:00Z', assetId: 'CMP-006', eventType: 'DEGRADATION_START', failureMode: 'bearing_wear' },
        { timestamp: '2026-04-20T04:00:00Z', assetId: 'MTR-008', eventType: 'DEGRADATION_START', failureMode: 'insulation_breakdown' },
    ];

    // ─────────────────────────────────────────────
    // 6. CURRENT ASSET STATE (derived from latest health data)
    // ─────────────────────────────────────────────
    // Realistic distribution: ~60% healthy, ~25% warning, ~15% critical
    const assetCurrentState = {
        'CMP-001': { healthIndex: 99.7, anomalyScore: 0.003, rulDays: 84.6, status: 'Healthy', failureMode: 'bearing_wear', lastMaintenance: '2026-04-07', scenarioPhase: 'normal' },
        'CMP-002': { healthIndex: 99.8, anomalyScore: 0.002, rulDays: 84.6, status: 'Healthy', failureMode: 'valve_leak', lastMaintenance: '2026-04-06', scenarioPhase: 'normal' },
        'MTR-001': { healthIndex: 99.1, anomalyScore: 0.009, rulDays: 81.9, status: 'Healthy', failureMode: 'thermal_runaway', lastMaintenance: '2026-04-07', scenarioPhase: 'normal' },
        'MTR-002': { healthIndex: 99.1, anomalyScore: 0.009, rulDays: 81.9, status: 'Healthy', failureMode: 'misalignment', lastMaintenance: '2026-04-07', scenarioPhase: 'normal' },
        'PMP-001': { healthIndex: 94.2, anomalyScore: 0.058, rulDays: 72.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-03-20', scenarioPhase: 'normal' },
        'PMP-002': { healthIndex: 97.5, anomalyScore: 0.025, rulDays: 78.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-03-28', scenarioPhase: 'normal' },
        'TRB-001': { healthIndex: 88.4, anomalyScore: 0.116, rulDays: 58.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-02-15', scenarioPhase: 'normal' },
        'CMP-003': { healthIndex: 98.8, anomalyScore: 0.012, rulDays: 85.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-04-01', scenarioPhase: 'normal' },
        'MTR-003': { healthIndex: 76.3, anomalyScore: 0.237, rulDays: 42.0, status: 'Warning', failureMode: 'winding_degradation', lastMaintenance: '2026-02-10', scenarioPhase: 'degradation' },
        'MTR-004': { healthIndex: 96.1, anomalyScore: 0.039, rulDays: 80.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-03-15', scenarioPhase: 'normal' },
        'CMP-004': { healthIndex: 62.8, anomalyScore: 0.372, rulDays: 28.0, status: 'Warning', failureMode: 'bearing_wear', lastMaintenance: '2026-01-22', scenarioPhase: 'degradation' },
        'CMP-005': { healthIndex: 91.5, anomalyScore: 0.085, rulDays: 68.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-03-10', scenarioPhase: 'normal' },
        'MTR-005': { healthIndex: 55.2, anomalyScore: 0.448, rulDays: 18.0, status: 'Warning', failureMode: 'thermal_runaway', lastMaintenance: '2026-01-05', scenarioPhase: 'degradation' },
        'MTR-006': { healthIndex: 93.7, anomalyScore: 0.063, rulDays: 74.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-03-18', scenarioPhase: 'normal' },
        'PMP-003': { healthIndex: 38.5, anomalyScore: 0.615, rulDays: 8.0, status: 'Warning', failureMode: 'seal_leak', lastMaintenance: '2025-12-20', scenarioPhase: 'failure_imminent' },
        'PMP-004': { healthIndex: 89.9, anomalyScore: 0.101, rulDays: 65.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-03-05', scenarioPhase: 'normal' },
        'PMP-005': { healthIndex: 97.2, anomalyScore: 0.028, rulDays: 82.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-04-02', scenarioPhase: 'normal' },
        'TRB-002': { healthIndex: 31.2, anomalyScore: 0.688, rulDays: 5.0, status: 'Critical', failureMode: 'blade_erosion', lastMaintenance: '2025-11-10', scenarioPhase: 'failure_imminent' },
        'TRB-003': { healthIndex: 86.1, anomalyScore: 0.139, rulDays: 55.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-02-28', scenarioPhase: 'normal' },
        'MTR-007': { healthIndex: 98.4, anomalyScore: 0.016, rulDays: 86.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-04-05', scenarioPhase: 'normal' },
        'CMP-006': { healthIndex: 45.7, anomalyScore: 0.543, rulDays: 12.0, status: 'Warning', failureMode: 'bearing_wear', lastMaintenance: '2026-01-15', scenarioPhase: 'degradation' },
        'CMP-007': { healthIndex: 92.3, anomalyScore: 0.077, rulDays: 70.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-03-22', scenarioPhase: 'normal' },
        'MTR-008': { healthIndex: 28.6, anomalyScore: 0.714, rulDays: 3.0, status: 'Critical', failureMode: 'insulation_breakdown', lastMaintenance: '2025-10-30', scenarioPhase: 'failure_imminent' },
        'MTR-009': { healthIndex: 71.4, anomalyScore: 0.286, rulDays: 35.0, status: 'Warning', failureMode: 'misalignment', lastMaintenance: '2026-02-01', scenarioPhase: 'degradation' },
        'PMP-006': { healthIndex: 22.1, anomalyScore: 0.779, rulDays: 2.0, status: 'Critical', failureMode: 'cavitation', lastMaintenance: '2025-10-15', scenarioPhase: 'failure_imminent' },
        'PMP-007': { healthIndex: 85.3, anomalyScore: 0.147, rulDays: 52.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-02-20', scenarioPhase: 'normal' },
        'TRB-004': { healthIndex: 67.8, anomalyScore: 0.322, rulDays: 25.0, status: 'Warning', failureMode: 'combustor_wear', lastMaintenance: '2026-01-08', scenarioPhase: 'degradation' },
        'TRB-005': { healthIndex: 90.6, anomalyScore: 0.094, rulDays: 66.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-03-12', scenarioPhase: 'normal' },
        'CMP-008': { healthIndex: 96.9, anomalyScore: 0.031, rulDays: 83.0, status: 'Healthy', failureMode: null, lastMaintenance: '2026-04-03', scenarioPhase: 'normal' },
        'MTR-010': { healthIndex: 18.3, anomalyScore: 0.817, rulDays: 1.0, status: 'Critical', failureMode: 'bearing_failure', lastMaintenance: '2025-09-20', scenarioPhase: 'failure_imminent' },
    };

    // ─────────────────────────────────────────────
    // 7. TELEMETRY SNAPSHOT (latest sensor readings per asset)
    // ─────────────────────────────────────────────
    function generateTelemetrySnapshot(asset, state) {
        const base = {
            compressor: { vibration_rms: 3.2, bearing_temp: 68, discharge_pressure: 7.2, suction_pressure: 1.2, motor_current: 52, ambient_temp: 30, rpm: 3580 },
            motor: { vibration_rms: 2.8, winding_temp: 75, current_rms: 45, voltage_imbalance: 1.2, rpm: 1480, ambient_temp: 28 },
            pump: { vibration_rms: 2.5, bearing_temp: 62, flow_rate: 120, discharge_pressure: 5.5, motor_current: 38, rpm: 2960 },
            turbine: { vibration_rms: 4.0, exhaust_temp: 480, inlet_pressure: 12.5, power_output: 22.5, rpm: 5400 },
        };
        const readings = { ...base[asset.type] };
        const degradation = 1 + (1 - state.healthIndex / 100) * 2;
        for (const key in readings) {
            if (key === 'rpm') readings[key] *= (0.98 + Math.random() * 0.04);
            else if (key.includes('temp')) readings[key] *= degradation * (0.95 + Math.random() * 0.1);
            else if (key.includes('vibration')) readings[key] *= degradation * (0.9 + Math.random() * 0.2);
            else if (key.includes('current')) readings[key] *= degradation * (0.95 + Math.random() * 0.1);
            else readings[key] *= (0.95 + Math.random() * 0.1);
        }
        return readings;
    }

    const telemetrySnapshot = {};
    assets.forEach(a => {
        const s = assetCurrentState[a.id];
        telemetrySnapshot[a.id] = generateTelemetrySnapshot(a, s);
    });

    // ─────────────────────────────────────────────
    // 8. HOURLY TRENDS (from 11_trends_hourly_v2.csv — real data)
    // ─────────────────────────────────────────────
    // Storing representative hourly data for all 4 original assets
    // Format: { assetId, timestamps[], anomalyScores[], healthIndices[], rulDays[] }
    function generateDailyAverages(assetId) {
        // Daily averages derived from the hourly CSV data
        const realData = {
            'CMP-001': {
                dates: ['Apr 01','Apr 02','Apr 03','Apr 04','Apr 05','Apr 06','Apr 07'],
                anomaly: [0.003, 0.004, 0.003, 0.004, 0.135, 0.417, 0.280],
                health: [99.7, 99.6, 99.7, 99.6, 86.5, 58.3, 76.8],
                rul: [84.2, 83.1, 84.4, 82.8, 60.5, 44.2, 73.5]
            },
            'CMP-002': {
                dates: ['Apr 01','Apr 02','Apr 03','Apr 04','Apr 05','Apr 06','Apr 07'],
                anomaly: [0.002, 0.003, 0.003, 0.003, 0.003, 0.013, 0.003],
                health: [99.8, 99.7, 99.7, 99.7, 99.7, 98.7, 99.7],
                rul: [84.8, 83.8, 84.2, 83.5, 84.0, 82.5, 84.2]
            },
            'MTR-001': {
                dates: ['Apr 01','Apr 02','Apr 03','Apr 04','Apr 05','Apr 06','Apr 07'],
                anomaly: [0.004, 0.004, 0.005, 0.120, 0.183, 0.320, 0.150],
                health: [99.6, 99.6, 99.5, 88.0, 81.8, 68.0, 85.0],
                rul: [81.2, 82.4, 80.5, 68.0, 64.5, 45.8, 80.0]
            },
            'MTR-002': {
                dates: ['Apr 01','Apr 02','Apr 03','Apr 04','Apr 05','Apr 06','Apr 07'],
                anomaly: [0.004, 0.004, 0.004, 0.004, 0.003, 0.004, 0.120],
                health: [99.6, 99.6, 99.6, 99.6, 99.7, 99.6, 88.0],
                rul: [82.5, 81.8, 82.8, 82.0, 83.5, 82.0, 67.5]
            }
        };
        if (realData[assetId]) return realData[assetId];
        // Generate synthetic daily data for other assets based on their current state
        const state = assetCurrentState[assetId];
        const hi = state.healthIndex;
        const dates = ['Apr 01','Apr 02','Apr 03','Apr 04','Apr 05','Apr 06','Apr 07'];
        const anomaly = [], health = [], rul = [];
        for (let i = 0; i < 7; i++) {
            const dayFactor = i / 6;
            if (state.scenarioPhase === 'failure_imminent' || state.scenarioPhase === 'degradation') {
                const startHealth = Math.min(100, hi + (100 - hi) * 0.8);
                const h = startHealth - (startHealth - hi) * dayFactor;
                health.push(+h.toFixed(1));
                anomaly.push(+((100 - h) / 100).toFixed(3));
                rul.push(+(state.rulDays + (90 - state.rulDays) * (1 - dayFactor)).toFixed(1));
            } else {
                const h = hi + (Math.random() - 0.5) * 2;
                health.push(+Math.max(0, Math.min(100, h)).toFixed(1));
                anomaly.push(+((100 - h) / 100).toFixed(3));
                rul.push(+(state.rulDays + (Math.random() - 0.5) * 5).toFixed(1));
            }
        }
        return { dates, anomaly, health, rul };
    }

    const trendsDaily = {};
    assets.forEach(a => { trendsDaily[a.id] = generateDailyAverages(a.id); });

    // Generate hourly trends for last 24 hours for detail views
    function generateHourlyTrend(assetId, hours = 24) {
        const state = assetCurrentState[assetId];
        const labels = [];
        const anomaly = [], health = [], rul = [];
        const now = new Date('2026-04-07T23:00:00Z');
        for (let i = hours - 1; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 3600000);
            labels.push(d.toISOString().substr(11, 5));
            const jitter = (Math.random() - 0.5) * 0.02;
            const a = Math.max(0, Math.min(1, state.anomalyScore + jitter));
            anomaly.push(+a.toFixed(4));
            health.push(+(100 * (1 - a)).toFixed(1));
            rul.push(+(state.rulDays + (Math.random() - 0.5) * 3).toFixed(1));
        }
        return { labels, anomaly, health, rul };
    }

    // ─────────────────────────────────────────────
    // 9. ALERTS (from 12_alerts_v2.csv + expanded)
    // ─────────────────────────────────────────────
    let alertIdCounter = 1000;
    const alerts = [
        // Original alerts from CSV
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-03T00:00:00Z', assetId: 'CMP-001', level: 'Warning', reason: 'Degradation detected — bearing vibration trending up', sensor: 'vibration_rms', anomalyScore: 0.22, acknowledged: true, workOrderId: null },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-07T00:00:00Z', assetId: 'CMP-001', level: 'Critical', reason: 'Failure imminent — bearing wear critical threshold exceeded', sensor: 'vibration_rms', anomalyScore: 0.70, acknowledged: true, workOrderId: 'WO-CMP001-001' },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-04T00:00:00Z', assetId: 'CMP-002', level: 'Warning', reason: 'Degradation detected — discharge pressure anomaly', sensor: 'discharge_pressure', anomalyScore: 0.58, acknowledged: true, workOrderId: null },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-06T12:00:00Z', assetId: 'CMP-002', level: 'Critical', reason: 'Failure imminent — valve leak detected', sensor: 'discharge_pressure', anomalyScore: 0.88, acknowledged: true, workOrderId: 'WO-CMP002-001' },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-03T08:00:00Z', assetId: 'MTR-001', level: 'Warning', reason: 'Degradation detected — winding temperature rising', sensor: 'winding_temp', anomalyScore: 0.56, acknowledged: true, workOrderId: null },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-07T02:00:00Z', assetId: 'MTR-001', level: 'Critical', reason: 'Failure imminent — thermal runaway risk', sensor: 'winding_temp', anomalyScore: 0.87, acknowledged: true, workOrderId: 'WO-MTR001-001' },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-05T00:00:00Z', assetId: 'MTR-002', level: 'Warning', reason: 'Degradation detected — vibration pattern anomaly', sensor: 'vibration_rms', anomalyScore: 0.55, acknowledged: true, workOrderId: null },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-07T10:00:00Z', assetId: 'MTR-002', level: 'Critical', reason: 'Failure imminent — misalignment detected', sensor: 'vibration_rms', anomalyScore: 0.86, acknowledged: true, workOrderId: 'WO-MTR002-001' },
        // Expanded alerts for synthetic assets — active
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-18T14:22:00Z', assetId: 'TRB-002', level: 'Critical', reason: 'Blade erosion — exhaust temperature spike detected', sensor: 'exhaust_temp', anomalyScore: 0.92, acknowledged: false, workOrderId: 'WO-TRB002-001' },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-19T09:15:00Z', assetId: 'MTR-008', level: 'Critical', reason: 'Insulation breakdown — current RMS deviation critical', sensor: 'current_rms', anomalyScore: 0.89, acknowledged: false, workOrderId: 'WO-MTR008-001' },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-20T06:30:00Z', assetId: 'PMP-006', level: 'Critical', reason: 'Cavitation detected — severe flow instability', sensor: 'flow_rate', anomalyScore: 0.94, acknowledged: false, workOrderId: 'WO-PMP006-001' },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-21T11:45:00Z', assetId: 'MTR-010', level: 'Critical', reason: 'Bearing failure imminent — extreme vibration levels', sensor: 'vibration_rms', anomalyScore: 0.96, acknowledged: false, workOrderId: 'WO-MTR010-001' },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-14T08:10:00Z', assetId: 'PMP-003', level: 'Critical', reason: 'Seal leak — pressure drop below threshold', sensor: 'discharge_pressure', anomalyScore: 0.87, acknowledged: false, workOrderId: 'WO-PMP003-001' },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-15T16:20:00Z', assetId: 'CMP-006', level: 'Warning', reason: 'Bearing temperature trending upward', sensor: 'bearing_temp', anomalyScore: 0.62, acknowledged: false, workOrderId: null },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-16T22:30:00Z', assetId: 'MTR-003', level: 'Warning', reason: 'Winding temperature elevated above baseline', sensor: 'winding_temp', anomalyScore: 0.59, acknowledged: false, workOrderId: null },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-17T03:45:00Z', assetId: 'CMP-004', level: 'Warning', reason: 'Vibration RMS increasing — degradation pattern', sensor: 'vibration_rms', anomalyScore: 0.65, acknowledged: false, workOrderId: null },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-18T19:00:00Z', assetId: 'MTR-005', level: 'Warning', reason: 'Voltage imbalance exceeding warn threshold', sensor: 'voltage_imbalance', anomalyScore: 0.58, acknowledged: false, workOrderId: null },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-19T13:15:00Z', assetId: 'MTR-009', level: 'Warning', reason: 'Vibration anomaly — possible misalignment', sensor: 'vibration_rms', anomalyScore: 0.57, acknowledged: false, workOrderId: null },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-20T07:30:00Z', assetId: 'TRB-004', level: 'Warning', reason: 'Combustor wear indicators elevated', sensor: 'exhaust_temp', anomalyScore: 0.61, acknowledged: false, workOrderId: null },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-21T15:00:00Z', assetId: 'TRB-001', level: 'Warning', reason: 'Inlet pressure variation above normal range', sensor: 'inlet_pressure', anomalyScore: 0.56, acknowledged: false, workOrderId: null },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-22T10:20:00Z', assetId: 'CMP-006', level: 'Critical', reason: 'Bearing wear — vibration exceeded critical threshold', sensor: 'vibration_rms', anomalyScore: 0.88, acknowledged: false, workOrderId: 'WO-CMP006-001' },
        { id: 'ALT-' + (++alertIdCounter), timestamp: '2026-04-22T14:00:00Z', assetId: 'MTR-005', level: 'Critical', reason: 'Thermal runaway risk — winding temp critical', sensor: 'winding_temp', anomalyScore: 0.90, acknowledged: false, workOrderId: 'WO-MTR005-001' },
    ];

    // ─────────────────────────────────────────────
    // 10. WORK ORDERS (from 13_work_orders_v2.csv + expanded)
    // ─────────────────────────────────────────────
    const engineers = [
        'Rajesh Kumar', 'Ahmed Hassan', 'Maria Garcia', 'James Wilson',
        'Priya Sharma', 'Chen Wei', 'Sarah Thompson', 'David Park'
    ];
    const workOrders = [
        // Original from CSV (resolved)
        { id: 'WO-CMP001-001', assetId: 'CMP-001', created: '2026-04-07T00:00:00Z', closed: '2026-04-07T08:00:00Z', priority: 'P1', status: 'Closed', trigger: 'AI Alert', faultType: 'bearing_wear', engineer: 'Rajesh Kumar', estDuration: '8h', cost: 12500, slaHours: 12, spareParts: ['Bearing assembly', 'Lubricant pack'] },
        { id: 'WO-CMP002-001', assetId: 'CMP-002', created: '2026-04-06T12:00:00Z', closed: '2026-04-06T18:00:00Z', priority: 'P2', status: 'Closed', trigger: 'AI Alert', faultType: 'valve_leak', engineer: 'Ahmed Hassan', estDuration: '6h', cost: 8200, slaHours: 24, spareParts: ['Valve kit', 'O-ring set'] },
        { id: 'WO-MTR001-001', assetId: 'MTR-001', created: '2026-04-07T02:00:00Z', closed: '2026-04-07T06:00:00Z', priority: 'P1', status: 'Closed', trigger: 'AI Alert', faultType: 'thermal_runaway', engineer: 'Maria Garcia', estDuration: '4h', cost: 9800, slaHours: 8, spareParts: ['Thermal paste', 'Cooling fan', 'Winding insulation'] },
        { id: 'WO-MTR002-001', assetId: 'MTR-002', created: '2026-04-07T10:00:00Z', closed: '2026-04-07T14:00:00Z', priority: 'P2', status: 'Closed', trigger: 'AI Alert', faultType: 'misalignment', engineer: 'James Wilson', estDuration: '4h', cost: 5400, slaHours: 24, spareParts: ['Alignment shims', 'Coupling insert'] },
        // Active work orders for degrading/critical assets
        { id: 'WO-TRB002-001', assetId: 'TRB-002', created: '2026-04-18T16:00:00Z', closed: null, priority: 'P1', status: 'In Progress', trigger: 'AI Alert', faultType: 'blade_erosion', engineer: 'Rajesh Kumar', estDuration: '48h', cost: 85000, slaHours: 72, spareParts: ['Turbine blade set', 'Protective coating', 'Balancing weights'] },
        { id: 'WO-MTR008-001', assetId: 'MTR-008', created: '2026-04-19T09:15:00Z', closed: null, priority: 'P1', status: 'In Progress', trigger: 'AI Alert', faultType: 'insulation_breakdown', engineer: 'Chen Wei', estDuration: '12h', cost: 18500, slaHours: 24, spareParts: ['Stator winding set', 'Insulation varnish', 'Terminal lugs'] },
        { id: 'WO-PMP006-001', assetId: 'PMP-006', created: '2026-04-20T06:30:00Z', closed: null, priority: 'P1', status: 'Open', trigger: 'AI Alert', faultType: 'cavitation', engineer: 'Sarah Thompson', estDuration: '16h', cost: 22000, slaHours: 24, spareParts: ['Impeller', 'Wear rings', 'Mechanical seal'] },
        { id: 'WO-MTR010-001', assetId: 'MTR-010', created: '2026-04-21T11:45:00Z', closed: null, priority: 'P1', status: 'Open', trigger: 'AI Alert', faultType: 'bearing_failure', engineer: 'David Park', estDuration: '6h', cost: 11200, slaHours: 12, spareParts: ['Deep groove bearing', 'Bearing housing', 'Grease cartridge'] },
        { id: 'WO-PMP003-001', assetId: 'PMP-003', created: '2026-04-14T10:00:00Z', closed: null, priority: 'P1', status: 'In Progress', trigger: 'AI Alert', faultType: 'seal_leak', engineer: 'Ahmed Hassan', estDuration: '10h', cost: 14800, slaHours: 24, spareParts: ['Mechanical seal', 'Shaft sleeve', 'Packing rings'] },
        { id: 'WO-CMP006-001', assetId: 'CMP-006', created: '2026-04-22T10:20:00Z', closed: null, priority: 'P1', status: 'Open', trigger: 'AI Alert', faultType: 'bearing_wear', engineer: 'Priya Sharma', estDuration: '8h', cost: 13200, slaHours: 24, spareParts: ['Roller bearing', 'Lubricant', 'Seal kit'] },
        { id: 'WO-MTR005-001', assetId: 'MTR-005', created: '2026-04-22T14:00:00Z', closed: null, priority: 'P2', status: 'Open', trigger: 'AI Alert', faultType: 'thermal_runaway', engineer: 'James Wilson', estDuration: '8h', cost: 10500, slaHours: 48, spareParts: ['Cooling unit', 'Thermal sensor', 'Winding insulation tape'] },
        // Scheduled inspections for warning-level assets
        { id: 'WO-MTR003-INS', assetId: 'MTR-003', created: '2026-04-17T08:00:00Z', closed: null, priority: 'P3', status: 'Scheduled', trigger: 'Scheduled Inspection', faultType: 'winding_degradation', engineer: 'Maria Garcia', estDuration: '3h', cost: 2800, slaHours: 72, spareParts: [] },
        { id: 'WO-CMP004-INS', assetId: 'CMP-004', created: '2026-04-18T08:00:00Z', closed: null, priority: 'P3', status: 'Scheduled', trigger: 'Scheduled Inspection', faultType: 'bearing_wear', engineer: 'Chen Wei', estDuration: '3h', cost: 2500, slaHours: 72, spareParts: [] },
        { id: 'WO-MTR009-INS', assetId: 'MTR-009', created: '2026-04-20T08:00:00Z', closed: null, priority: 'P3', status: 'Scheduled', trigger: 'Scheduled Inspection', faultType: 'misalignment', engineer: 'David Park', estDuration: '2h', cost: 1800, slaHours: 72, spareParts: [] },
        { id: 'WO-TRB004-INS', assetId: 'TRB-004', created: '2026-04-21T08:00:00Z', closed: null, priority: 'P3', status: 'Scheduled', trigger: 'Scheduled Inspection', faultType: 'combustor_wear', engineer: 'Sarah Thompson', estDuration: '4h', cost: 4200, slaHours: 72, spareParts: [] },
        { id: 'WO-TRB001-INS', assetId: 'TRB-001', created: '2026-04-22T08:00:00Z', closed: null, priority: 'P3', status: 'Scheduled', trigger: 'Scheduled Inspection', faultType: 'general_inspection', engineer: 'Priya Sharma', estDuration: '3h', cost: 3500, slaHours: 72, spareParts: [] },
    ];

    // ─────────────────────────────────────────────
    // 11. COMPUTED KPIs
    // ─────────────────────────────────────────────
    const statusCounts = { healthy: 0, warning: 0, critical: 0 };
    assets.forEach(a => {
        const s = assetCurrentState[a.id].status;
        if (s === 'Healthy') statusCounts.healthy++;
        else if (s === 'Warning') statusCounts.warning++;
        else if (s === 'Critical') statusCounts.critical++;
    });

    const kpis = {
        totalAssets: assets.length,
        healthy: statusCounts.healthy,
        warning: statusCounts.warning,
        critical: statusCounts.critical,
        oee: 87.3,
        mtbf: 342,    // hours
        mttr: 6.8,    // hours
        downtimePct: 3.2,
        activeWorkOrders: workOrders.filter(w => w.status !== 'Closed').length,
        openAlerts: alerts.filter(a => !a.acknowledged).length,
        plantHealthScore: 82.4,
        totalMaintenanceCost: workOrders.reduce((s, w) => s + w.cost, 0),
        predictiveAccuracy: 94.7,
        avgRul: +(assets.reduce((s, a) => s + assetCurrentState[a.id].rulDays, 0) / assets.length).toFixed(1),
    };

    // Plant-level KPIs
    const plantKpis = {};
    ['Plant-A', 'Plant-B', 'Plant-C'].forEach(plant => {
        const plantAssets = assets.filter(a => a.site === plant);
        const avgHealth = plantAssets.reduce((s, a) => s + assetCurrentState[a.id].healthIndex, 0) / plantAssets.length;
        const critCount = plantAssets.filter(a => assetCurrentState[a.id].status === 'Critical').length;
        const warnCount = plantAssets.filter(a => assetCurrentState[a.id].status === 'Warning').length;
        plantKpis[plant] = {
            assetCount: plantAssets.length,
            avgHealth: +avgHealth.toFixed(1),
            critical: critCount,
            warning: warnCount,
            healthy: plantAssets.length - critCount - warnCount,
            oee: +(85 + Math.random() * 8).toFixed(1),
            mtbf: +(300 + Math.random() * 100).toFixed(0),
            mttr: +(4 + Math.random() * 6).toFixed(1),
        };
    });

    // ─────────────────────────────────────────────
    // 12. AI INSIGHTS
    // ─────────────────────────────────────────────
    const aiInsights = [
        { type: 'critical', icon: 'fa-exclamation-triangle', title: 'Immediate Action Required', message: 'MTR-010 bearing failure probability exceeds 95%. Estimated 1 day RUL. Recommend emergency shutdown and bearing replacement within 12 hours.', asset: 'MTR-010', confidence: 97 },
        { type: 'critical', icon: 'fa-bolt', title: 'Turbine Blade Alert', message: 'TRB-002 blade erosion has progressed to critical stage. Power output degradation of 18% detected. Schedule immediate outage for blade inspection.', asset: 'TRB-002', confidence: 94 },
        { type: 'warning', icon: 'fa-chart-line', title: 'Degradation Pattern Detected', message: 'CMP-006 bearing temperature trending 2.3°C/day above baseline. At current rate, critical threshold will be reached in ~12 days.', asset: 'CMP-006', confidence: 89 },
        { type: 'warning', icon: 'fa-thermometer-half', title: 'Thermal Anomaly', message: 'MTR-005 winding temperature 14°C above seasonal baseline. Pattern consistent with early-stage insulation degradation.', asset: 'MTR-005', confidence: 86 },
        { type: 'info', icon: 'fa-cogs', title: 'Maintenance Optimization', message: 'Consolidating scheduled inspections for Plant-B assets (CMP-004, MTR-005) could reduce maintenance window by 40% and save $4,200 in labor costs.', asset: null, confidence: 82 },
        { type: 'info', icon: 'fa-shield-alt', title: 'Predictive Model Update', message: 'Anomaly detection model retrained with Q1 2026 data. Precision improved by 3.2% for compressor bearing wear predictions.', asset: null, confidence: 91 },
        { type: 'success', icon: 'fa-check-circle', title: 'Maintenance Success', message: 'CMP-001 health restored to 99.7% following bearing replacement on Apr 7. Post-maintenance vibration levels 45% below pre-failure readings.', asset: 'CMP-001', confidence: 99 },
        { type: 'info', icon: 'fa-dollar-sign', title: 'Cost Avoidance', message: 'Predictive maintenance on 4 assets in April avoided an estimated $340,000 in unplanned downtime costs. ROI: 8.2x maintenance investment.', asset: null, confidence: 88 },
    ];

    // ─────────────────────────────────────────────
    // 13. MONTHLY TRENDS (for historical charts)
    // ─────────────────────────────────────────────
    const monthlyTrends = {
        months: ['Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26'],
        oee: [84.2, 85.1, 83.8, 86.4, 87.0, 86.8, 87.3],
        mtbf: [310, 325, 298, 340, 355, 348, 342],
        mttr: [8.2, 7.5, 9.1, 7.0, 6.5, 6.9, 6.8],
        downtime: [4.8, 4.2, 5.1, 3.8, 3.4, 3.5, 3.2],
        maintenanceCost: [82000, 75000, 95000, 68000, 62000, 58000, 55000],
        predictiveMaint: [12, 15, 18, 22, 25, 28, 30],
        reactiveMaint: [28, 25, 22, 18, 15, 12, 10],
        failureCount: [8, 6, 9, 5, 4, 3, 4],
        anomalyCount: [45, 38, 52, 32, 28, 25, 22],
        energyCost: [125000, 128000, 135000, 122000, 118000, 115000, 112000],
    };

    // ─────────────────────────────────────────────
    // 14. MAINTENANCE SCHEDULE CALENDAR
    // ─────────────────────────────────────────────
    const maintenanceSchedule = [
        { date: '2026-04-23', assetId: 'PMP-006', type: 'Emergency Repair', priority: 'P1' },
        { date: '2026-04-23', assetId: 'MTR-010', type: 'Bearing Replacement', priority: 'P1' },
        { date: '2026-04-24', assetId: 'TRB-002', type: 'Blade Inspection', priority: 'P1' },
        { date: '2026-04-24', assetId: 'CMP-006', type: 'Bearing Service', priority: 'P1' },
        { date: '2026-04-25', assetId: 'MTR-005', type: 'Thermal Inspection', priority: 'P2' },
        { date: '2026-04-25', assetId: 'MTR-003', type: 'Winding Check', priority: 'P3' },
        { date: '2026-04-26', assetId: 'CMP-004', type: 'Vibration Analysis', priority: 'P3' },
        { date: '2026-04-27', assetId: 'MTR-009', type: 'Alignment Check', priority: 'P3' },
        { date: '2026-04-28', assetId: 'TRB-004', type: 'Combustor Inspection', priority: 'P3' },
        { date: '2026-04-28', assetId: 'TRB-001', type: 'General Inspection', priority: 'P3' },
        { date: '2026-04-30', assetId: 'PMP-001', type: 'Preventive Maintenance', priority: 'P3' },
        { date: '2026-05-02', assetId: 'CMP-005', type: 'Vibration Baseline', priority: 'P3' },
        { date: '2026-05-05', assetId: 'TRB-003', type: 'Annual Inspection', priority: 'P2' },
    ];

    // ─────────────────────────────────────────────
    // 15. FAILURE MODES CATALOG
    // ─────────────────────────────────────────────
    const failureModes = {
        bearing_wear: { label: 'Bearing Wear', category: 'Mechanical', severity: 'High', mttr: 8, cost: 12500, description: 'Progressive degradation of bearing surfaces due to fatigue, contamination, or inadequate lubrication.' },
        valve_leak: { label: 'Valve Leak', category: 'Process', severity: 'Medium', mttr: 6, cost: 8200, description: 'Internal or external leakage through valve seats or seals.' },
        thermal_runaway: { label: 'Thermal Runaway', category: 'Electrical', severity: 'Critical', mttr: 4, cost: 9800, description: 'Uncontrolled temperature increase in motor windings leading to insulation breakdown.' },
        misalignment: { label: 'Misalignment', category: 'Mechanical', severity: 'Medium', mttr: 4, cost: 5400, description: 'Shaft misalignment between driver and driven equipment.' },
        seal_leak: { label: 'Seal Leak', category: 'Mechanical', severity: 'High', mttr: 10, cost: 14800, description: 'Failure of mechanical seals causing fluid leakage.' },
        blade_erosion: { label: 'Blade Erosion', category: 'Mechanical', severity: 'Critical', mttr: 48, cost: 85000, description: 'Erosion of turbine blade surfaces due to particle impact or corrosion.' },
        insulation_breakdown: { label: 'Insulation Breakdown', category: 'Electrical', severity: 'Critical', mttr: 12, cost: 18500, description: 'Degradation of winding insulation leading to short circuits.' },
        cavitation: { label: 'Cavitation', category: 'Process', severity: 'Critical', mttr: 16, cost: 22000, description: 'Formation and collapse of vapor bubbles in pump, causing impeller damage.' },
        bearing_failure: { label: 'Bearing Failure', category: 'Mechanical', severity: 'Critical', mttr: 6, cost: 11200, description: 'Complete bearing failure requiring immediate replacement.' },
        combustor_wear: { label: 'Combustor Wear', category: 'Thermal', severity: 'High', mttr: 24, cost: 45000, description: 'Degradation of combustor liner and fuel nozzles.' },
        winding_degradation: { label: 'Winding Degradation', category: 'Electrical', severity: 'Medium', mttr: 8, cost: 7500, description: 'Gradual deterioration of motor winding insulation resistance.' },
        general_inspection: { label: 'General Inspection', category: 'Preventive', severity: 'Low', mttr: 3, cost: 3500, description: 'Routine equipment inspection and condition assessment.' },
    };

    // ─────────────────────────────────────────────
    // 16. NOTIFICATIONS
    // ─────────────────────────────────────────────
    const notifications = [
        { id: 1, time: '2 min ago', type: 'critical', message: 'MTR-010 RUL dropped below 24 hours', read: false },
        { id: 2, time: '15 min ago', type: 'critical', message: 'PMP-006 cavitation alert — immediate action required', read: false },
        { id: 3, time: '1 hr ago', type: 'warning', message: 'CMP-006 bearing temperature exceeded warning threshold', read: false },
        { id: 4, time: '2 hrs ago', type: 'info', message: 'WO-PMP003-001 status updated to In Progress', read: false },
        { id: 5, time: '3 hrs ago', type: 'warning', message: 'TRB-004 combustor wear trend accelerating', read: true },
        { id: 6, time: '5 hrs ago', type: 'info', message: 'Monthly maintenance report generated for Plant-A', read: true },
        { id: 7, time: '8 hrs ago', type: 'success', message: 'MTR-008 work order assigned to Chen Wei', read: true },
        { id: 8, time: '12 hrs ago', type: 'info', message: 'AI model retrained — precision improved by 3.2%', read: true },
    ];

    // ─────────────────────────────────────────────
    // HELPER FUNCTIONS
    // ─────────────────────────────────────────────
    function getAssetById(id) {
        return assets.find(a => a.id === id);
    }

    function getAssetState(id) {
        return assetCurrentState[id];
    }

    function getAssetsByStatus(status) {
        return assets.filter(a => assetCurrentState[a.id].status === status);
    }

    function getAssetsBySite(site) {
        return assets.filter(a => a.site === site);
    }

    function getAssetsByType(type) {
        return assets.filter(a => a.type === type);
    }

    function getAlertsForAsset(assetId) {
        return alerts.filter(a => a.assetId === assetId);
    }

    function getWorkOrdersForAsset(assetId) {
        return workOrders.filter(w => w.assetId === assetId);
    }

    function getThresholdsForAsset(assetType) {
        return thresholdRules.filter(t => t.assetType === assetType);
    }

    function getWeightsForAsset(assetType) {
        return modelWeights.filter(m => m.assetType === assetType);
    }

    function getTopRiskyAssets(n = 5) {
        return [...assets]
            .sort((a, b) => assetCurrentState[a.id].healthIndex - assetCurrentState[b.id].healthIndex)
            .slice(0, n);
    }

    function getStatusColor(status) {
        const colors = { Healthy: '#10b981', Warning: '#f59e0b', Critical: '#ef4444', Normal: '#10b981', Info: '#3b82f6' };
        return colors[status] || '#64748b';
    }

    function getStatusBg(status) {
        const colors = { Healthy: 'rgba(16,185,129,0.15)', Warning: 'rgba(245,158,11,0.15)', Critical: 'rgba(239,68,68,0.15)' };
        return colors[status] || 'rgba(100,116,139,0.15)';
    }

    function getPriorityColor(p) {
        const colors = { P1: '#ef4444', P2: '#f59e0b', P3: '#3b82f6', P4: '#64748b' };
        return colors[p] || '#64748b';
    }

    function formatAssetType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    function getFailureProb(assetId) {
        const state = assetCurrentState[assetId];
        return Math.max(0, Math.min(100, 100 - (state.rulDays / 90 * 100)));
    }

    // Return public API
    return {
        assets,
        tagCatalog,
        thresholdRules,
        modelWeights,
        scenarioEvents,
        assetCurrentState,
        telemetrySnapshot,
        trendsDaily,
        generateHourlyTrend,
        alerts,
        workOrders,
        engineers,
        kpis,
        plantKpis,
        aiInsights,
        monthlyTrends,
        maintenanceSchedule,
        failureModes,
        notifications,
        // Helpers
        getAssetById,
        getAssetState,
        getAssetsByStatus,
        getAssetsBySite,
        getAssetsByType,
        getAlertsForAsset,
        getWorkOrdersForAsset,
        getThresholdsForAsset,
        getWeightsForAsset,
        getTopRiskyAssets,
        getStatusColor,
        getStatusBg,
        getPriorityColor,
        formatAssetType,
        getFailureProb,
    };
})();
