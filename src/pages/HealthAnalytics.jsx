import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import {
  Heart,
  TrendingUp,
  Activity,
  AlertTriangle,
  User,
  Sliders,
  ShieldAlert,
  Apple,
  Dumbbell,
  CheckCircle,
  FileHeart
} from "lucide-react";
import "../styles/analytics.css";

const HealthAnalytics = () => {
  const { patients, updatePatient } = useContext(AppContext);
  const { currentUser } = useContext(AuthContext);
  const toast = useToast();

  // --- Dynamic Vitals States ---
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [heartRate, setHeartRate] = useState(72);
  const [systolicBP, setSystolicBP] = useState(120);
  const [diastolicBP, setDiastolicBP] = useState(80);
  const [oxygen, setOxygen] = useState(98);
  const [temperature, setTemperature] = useState(98.6);

  // --- Track Vitals when Patient is Selected ---
  useEffect(() => {
    if (selectedPatientId) {
      const patient = patients.find((p) => p.id === selectedPatientId);
      if (patient && patient.vitals) {
        setHeartRate(patient.vitals.heartRate || 75);
        
        if (patient.vitals.bloodPressure) {
          const parts = patient.vitals.bloodPressure.split("/");
          if (parts.length === 2) {
            setSystolicBP(parseInt(parts[0], 10) || 120);
            setDiastolicBP(parseInt(parts[1], 10) || 80);
          }
        }
        
        setOxygen(patient.vitals.oxygen || 98);
        setTemperature(patient.vitals.temperature || 98.6);
        toast.show(`Loaded clinical vitals for ${patient.name}`, "success");
      }
    }
  }, [selectedPatientId]);

  // --- Save Vitals back to Patient profile ---
  const handleSaveVitals = () => {
    if (!selectedPatientId) {
      toast.show("Please select a patient to update.", "warning");
      return;
    }

    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    const actor = currentUser?.name || "Practitioner";
    const role = currentUser?.role || "doctor";

    const updatedVitals = {
      heartRate: parseInt(heartRate, 10),
      bloodPressure: `${systolicBP}/${diastolicBP}`,
      oxygen: parseInt(oxygen, 10),
      temperature: parseFloat(parseFloat(temperature).toFixed(1)),
      ecgHistory: [...(patient.vitals?.ecgHistory || [70, 72, 75]).slice(-10), parseInt(heartRate, 10)]
    };

    // Add medical history logs to the timeline too
    const newHistoryItem = {
      date: new Date().toISOString().split("T")[0],
      type: "Vitals Update",
      notes: `Vitals logged: HR ${heartRate}bpm, BP ${systolicBP}/${diastolicBP}mmHg, SpO2 ${oxygen}%, Temp ${temperature}°F.`
    };

    updatePatient(
      patient.id,
      {
        vitals: updatedVitals,
        history: [...(patient.history || []), newHistoryItem]
      },
      actor,
      role
    );

    toast.show(`Vitals successfully logged for ${patient.name}!`, "success");
  };

  // --- Diagnostics Engine ---
  const evaluateVitals = () => {
    let healthScore = 100;
    let severity = "normal"; // normal, warning, danger
    const diagnosticsList = [];
    const dietTips = [];
    const exerciseTips = [];

    // 1. Heart Rate Evaluation
    if (heartRate < 60) {
      healthScore -= 10;
      diagnosticsList.push({
        status: "Bradycardia",
        desc: `Pulse rate (${heartRate} bpm) is lower than normal resting limits.`,
        severity: "warning"
      });
      dietTips.push("Include iron-rich foods and natural electrolyte drinks.");
      exerciseTips.push("Limit excessive cardiac strains. Prefer light walks.");
    } else if (heartRate >= 100 && heartRate < 120) {
      healthScore -= 12;
      diagnosticsList.push({
        status: "Mild Tachycardia",
        desc: `Elevated heart rate (${heartRate} bpm) at rest. May suggest stress or fever.`,
        severity: "warning"
      });
      dietTips.push("Limit caffeine, energy products, and high-sodium meals.");
      exerciseTips.push("Engage in restorative yoga, deep breathing cycles, and hydration.");
    } else if (heartRate >= 120) {
      healthScore -= 25;
      severity = "danger";
      diagnosticsList.push({
        status: "Severe Tachycardia",
        desc: `Critical pulse (${heartRate} bpm) detected. Potential cardiovascular strain.`,
        severity: "danger"
      });
      dietTips.push("Absolute sodium and stimulant restrictions.");
      exerciseTips.push("Immediate physical rest. Halt all active exercise workloads.");
    } else {
      diagnosticsList.push({
        status: "Normal Heart Rate",
        desc: "Pulse parameters reside within standard guidelines (60-99 bpm).",
        severity: "normal"
      });
    }

    // 2. Blood Pressure Evaluation
    if (systolicBP >= 140 || diastolicBP >= 90) {
      healthScore -= 20;
      if (systolicBP >= 160 || diastolicBP >= 100) severity = "danger";
      else if (severity !== "danger") severity = "warning";
      
      diagnosticsList.push({
        status: "Hypertension Stage 2",
        desc: `Elevated arterial pressure (${systolicBP}/${diastolicBP} mmHg) requires medical oversight.`,
        severity: systolicBP >= 160 ? "danger" : "warning"
      });
      dietTips.push("Establish Strict DASH Diet: high potassium, leafy greens, zero salt.");
      exerciseTips.push("Rest. Avoid heavy anaerobic muscle lifting operations.");
    } else if (systolicBP >= 121 && systolicBP <= 139 || diastolicBP >= 81 && diastolicBP <= 89) {
      healthScore -= 8;
      if (severity !== "danger") severity = "warning";
      diagnosticsList.push({
        status: "Prehypertension",
        desc: `Marginally elevated pressure (${systolicBP}/${diastolicBP} mmHg). Monitor changes regularly.`,
        severity: "warning"
      });
      dietTips.push("Reduce processed sugars and processed cholesterol foods.");
      exerciseTips.push("30 minutes of aerobic swimming or cycling activities daily.");
    } else if (systolicBP < 90 || diastolicBP < 60) {
      healthScore -= 15;
      if (severity !== "danger") severity = "warning";
      diagnosticsList.push({
        status: "Hypotension",
        desc: `Arterial tension (${systolicBP}/${diastolicBP} mmHg) is lower than recommended ranges.`,
        severity: "warning"
      });
      dietTips.push("Slightly raise healthy sodium intakes and keep mineral hydration high.");
      exerciseTips.push("Perform slow movements when standing up to avoid orthostatic dizziness.");
    } else {
      diagnosticsList.push({
        status: "Optimal Blood Pressure",
        desc: `Arterial tension (${systolicBP}/${diastolicBP} mmHg) is outstandingly stable.`,
        severity: "normal"
      });
    }

    // 3. Oxygen Saturation Evaluation
    if (oxygen < 95 && oxygen >= 90) {
      healthScore -= 18;
      if (severity !== "danger") severity = "warning";
      diagnosticsList.push({
        status: "Mild Hypoxia",
        desc: `Reduced blood oxygenation (${oxygen}%). Monitor respiratory respiration closely.`,
        severity: "warning"
      });
      dietTips.push("Consume antioxidant foods (blueberries, pecans) to support cell health.");
      exerciseTips.push("Perform incentive spirometry lung drills; avoid high elevations.");
    } else if (oxygen < 90) {
      healthScore -= 40;
      severity = "danger";
      diagnosticsList.push({
        status: "Severe Hypoxia",
        desc: `Critical respiratory emergency (${oxygen}% oxygen). High risk of cellular distress.`,
        severity: "danger"
      });
      dietTips.push("Requires medical hydration therapy. Halt oral intakes if distressed.");
      exerciseTips.push("Zero activity. Bedrest with supplemental oxygen supply requested.");
    } else {
      diagnosticsList.push({
        status: "Normal Oxygen Saturation",
        desc: `Superb respiratory gas index levels (${oxygen}% SpO2).`,
        severity: "normal"
      });
    }

    // 4. Temperature Evaluation
    if (temperature >= 100.4) {
      healthScore -= 15;
      if (severity !== "danger") severity = "warning";
      diagnosticsList.push({
        status: "Pyrexia (Fever)",
        desc: `Body temperature (${temperature}°F) indicates active inflammatory response.`,
        severity: "warning"
      });
      dietTips.push("Broths, diluted fruit juices, and light soups to replenish fluids.");
      exerciseTips.push("Complete thermal cool-down rest. Limit heavy blankets.");
    } else if (temperature < 96.0) {
      healthScore -= 15;
      if (severity !== "danger") severity = "warning";
      diagnosticsList.push({
        status: "Hypothermia Risk",
        desc: `Low body core reading (${temperature}°F). Warm blanket adjustments needed.`,
        severity: "warning"
      });
      dietTips.push("Consume warm herbal teas and broths.");
      exerciseTips.push("Gentle muscle contractions to stimulate metabolic core thermogenesis.");
    }

    // Fill defaults if empty
    if (dietTips.length === 0) dietTips.push("Maintain balanced intake of lean proteins, complex carbs, and water.");
    if (exerciseTips.length === 0) exerciseTips.push("Support standard active recovery with 150 min cardio per week.");

    return {
      healthScore: Math.max(10, healthScore),
      severity,
      diagnosticsList,
      dietTips,
      exerciseTips
    };
  };

  const { healthScore, severity, diagnosticsList, dietTips, exerciseTips } = evaluateVitals();

  // --- Dynamic Oscilloscope Path Generation ---
  // A beautiful repeating signature heartbeat path for the ECG wave
  const getEcgWavePath = () => {
    // Generate a beautiful heartbeat SVG path sequence
    // A standard ECG features: flat line, P wave (small up), flat, Q (sharp down), R (high peak), S (deep down), T wave (moderate up), flat
    const baseBeat = "l 15,0 q 5,-4 10,0 l 10,0 l 5,10 l 6,-45 l 6,55 l 5,-20 q 7,-5 12,0 l 15,0";
    // Repeat the wave across the viewport
    return `M 0,130 ${baseBeat} ${baseBeat} ${baseBeat} ${baseBeat} ${baseBeat} ${baseBeat} ${baseBeat} l 200,0`;
  };

  // Adjust ECG speed by heart rate: higher heart rate = faster animation loop
  const animationDuration = `${Math.max(1.2, 5 - (heartRate - 60) * 0.05)}s`;

  return (
    <div className="analytics-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>AI Health Analytics</h1>
          <p>Real-time cardiovascular telemetry, vitals risk modeling, and clinical decision support logs.</p>
        </div>
      </div>

      {/* High-Tech Oscilloscope Monitor */}
      <div className="oscilloscope-panel">
        <div className="oscilloscope-grid-bg"></div>
        <div className="oscilloscope-overlay-glass"></div>
        
        <svg className="ecg-svg-canvas" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            className={`ecg-trace-path ${severity}`}
            d={getEcgWavePath()}
            fill="none"
            stroke="var(--primary-color)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animationDuration: animationDuration
            }}
          />
        </svg>

        {/* Telemetry Status Bubbles */}
        <div className="telemetry-overlay-data">
          <div className={`telemetry-status-bubble ${severity}`}>
            <Heart size={12} className="pulse-primary-dot" style={{ animationDuration: "0.8s" }} />
            {severity === "danger" ? "Critical telemetry alert" : severity === "warning" ? "Vitals Deviating" : "System Stable"}
          </div>
          <div style={{ color: "#38bdf8", fontFamily: "monospace", fontSize: "0.75rem", fontWeight: "bold", marginTop: "0.5rem" }}>
            ECG CALIBRATION: {heartRate} Hz
          </div>
        </div>

        {/* Oscilloscope label footer */}
        <div className="oscilloscope-title">
          <Activity size={14} style={{ color: "var(--primary-color)" }} />
          <span>Biological Vitals Oscilloscope Telemetry</span>
        </div>
      </div>

      {/* Analytics Workspace Split */}
      <div className="analytics-workspace">
        {/* Left Side: Vitals Sliders Controls */}
        <div className="glass-card vitals-control-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Vitals Calibration</h3>
            <Sliders size={18} className="text-secondary" />
          </div>

          {/* Optional Patient Pre-loader */}
          <div className="form-group" style={{ marginBottom: "0.5rem" }}>
            <label style={{ fontSize: "0.75rem" }}>Load Active Patient Vitals</label>
            <select
              className="form-control"
              style={{ padding: "0.5rem" }}
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">-- Manual Calibration Mode --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status})
                </option>
              ))}
            </select>
          </div>

          {/* Heart Rate Slider */}
          <div className="vital-input-row">
            <div className="vital-input-header">
              <span className="vital-label">Heart Rate</span>
              <span className="vital-value-display" style={{ color: heartRate >= 100 ? "var(--danger-color)" : "var(--primary-color)" }}>
                {heartRate} BPM
              </span>
            </div>
            <input
              type="range"
              className="vital-range-slider"
              min="40"
              max="160"
              value={heartRate}
              onChange={(e) => setHeartRate(parseInt(e.target.value, 10))}
            />
          </div>

          {/* Systolic BP Slider */}
          <div className="vital-input-row">
            <div className="vital-input-header">
              <span className="vital-label">Systolic Blood Pressure</span>
              <span className="vital-value-display" style={{ color: systolicBP >= 140 ? "var(--danger-color)" : "var(--primary-color)" }}>
                {systolicBP} mmHg
              </span>
            </div>
            <input
              type="range"
              className="vital-range-slider"
              min="70"
              max="200"
              value={systolicBP}
              onChange={(e) => setSystolicBP(parseInt(e.target.value, 10))}
            />
          </div>

          {/* Diastolic BP Slider */}
          <div className="vital-input-row">
            <div className="vital-input-header">
              <span className="vital-label">Diastolic Blood Pressure</span>
              <span className="vital-value-display" style={{ color: diastolicBP >= 90 ? "var(--danger-color)" : "var(--primary-color)" }}>
                {diastolicBP} mmHg
              </span>
            </div>
            <input
              type="range"
              className="vital-range-slider"
              min="40"
              max="120"
              value={diastolicBP}
              onChange={(e) => setDiastolicBP(parseInt(e.target.value, 10))}
            />
          </div>

          {/* Oxygen saturation Slider */}
          <div className="vital-input-row">
            <div className="vital-input-header">
              <span className="vital-label">SpO2 (Oxygen Saturation)</span>
              <span className="vital-value-display" style={{ color: oxygen < 95 ? "var(--danger-color)" : "var(--success-color)" }}>
                {oxygen}%
              </span>
            </div>
            <input
              type="range"
              className="vital-range-slider"
              min="75"
              max="100"
              value={oxygen}
              onChange={(e) => setOxygen(parseInt(e.target.value, 10))}
            />
          </div>

          {/* Temperature Slider */}
          <div className="vital-input-row">
            <div className="vital-input-header">
              <span className="vital-label">Body Temperature</span>
              <span className="vital-value-display" style={{ color: temperature >= 100.4 ? "var(--danger-color)" : "var(--primary-color)" }}>
                {parseFloat(temperature).toFixed(1)} °F
              </span>
            </div>
            <input
              type="range"
              className="vital-range-slider"
              min="94"
              max="106"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
          </div>

          {selectedPatientId && currentUser?.role !== "patient" && (
            <button
              className="btn btn-primary"
              style={{ marginTop: "0.5rem" }}
              onClick={handleSaveVitals}
            >
              <CheckCircle size={16} /> Save Vitals to Patient Record
            </button>
          )}
        </div>

        {/* Right Side: AI Diagnostic Analyzer Report */}
        <div className="glass-card ai-report-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Diagnostic Report</h3>
            <FileHeart size={18} className="text-secondary" />
          </div>

          {/* Health score badge */}
          <div className="health-score-gauge">
            <div className="score-label">
              <h4>Diagnostic Health Score</h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Computed by vitals deviation algorithms.
              </p>
            </div>
            <div
              className="score-badge"
              style={{
                color: healthScore >= 85 ? "var(--success-color)" : healthScore >= 60 ? "var(--warning-color)" : "var(--danger-color)"
              }}
            >
              {healthScore}
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>/100</span>
            </div>
          </div>

          {/* High-Tech Terminal type report */}
          <div className="clinical-report-box">
            {diagnosticsList.map((item, index) => (
              <div className="diagnostic-bullet" key={index}>
                {item.severity === "danger" ? (
                  <ShieldAlert size={14} style={{ color: "var(--danger-color)", marginTop: "2px", flexShrink: 0 }} />
                ) : item.severity === "warning" ? (
                  <AlertTriangle size={14} style={{ color: "var(--warning-color)", marginTop: "2px", flexShrink: 0 }} />
                ) : (
                  <CheckCircle size={14} style={{ color: "var(--success-color)", marginTop: "2px", flexShrink: 0 }} />
                )}
                <div>
                  <span
                    style={{
                      color: item.severity === "danger" ? "var(--danger-color)" : item.severity === "warning" ? "var(--warning-color)" : "var(--success-color)",
                      marginRight: "0.25rem"
                    }}
                  >
                    [{item.status}]
                  </span>{" "}
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          {/* AI Clinical recommendations */}
          <div className="recommendations-section">
            <div className="recommendation-card">
              <h4>
                <Apple size={14} style={{ color: "var(--success-color)" }} />
                Nutritional Advice
              </h4>
              <ul>
                {dietTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="recommendation-card">
              <h4>
                <Dumbbell size={14} style={{ color: "var(--orange-color)" }} />
                Workload & Rest
              </h4>
              <ul>
                {exerciseTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Dials Gauges */}
      <div className="telemetry-dials">
        <div className="glass-card telemetry-dial-card">
          <div className="dial-circle-wrapper">
            <svg className="dial-circle-svg" viewBox="0 0 36 36">
              <path
                className="dial-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="2.5"
              />
              <path
                className="dial-fill"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={oxygen < 95 ? "var(--danger-color)" : "var(--success-color)"}
                strokeWidth="2.5"
                strokeDasharray={`${oxygen}, 100`}
              />
            </svg>
            <div className="dial-value-overlay">{oxygen}%</div>
          </div>
          <span className="dial-label">O2 Saturation</span>
        </div>

        <div className="glass-card telemetry-dial-card">
          <div className="dial-circle-wrapper">
            <svg className="dial-circle-svg" viewBox="0 0 36 36">
              <path
                className="dial-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="2.5"
              />
              <path
                className="dial-fill"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={heartRate > 100 || heartRate < 60 ? "var(--warning-color)" : "var(--primary-color)"}
                strokeWidth="2.5"
                strokeDasharray={`${(heartRate / 160) * 100}, 100`}
              />
            </svg>
            <div className="dial-value-overlay">{heartRate}</div>
          </div>
          <span className="dial-label">Heart Rate (BPM)</span>
        </div>

        <div className="glass-card telemetry-dial-card">
          <div className="dial-circle-wrapper">
            <svg className="dial-circle-svg" viewBox="0 0 36 36">
              <path
                className="dial-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="2.5"
              />
              <path
                className="dial-fill"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={temperature >= 100.4 ? "var(--danger-color)" : "var(--indigo-color)"}
                strokeWidth="2.5"
                strokeDasharray={`${((temperature - 94) / 12) * 100}, 100`}
              />
            </svg>
            <div className="dial-value-overlay" style={{ fontSize: "0.95rem" }}>{parseFloat(temperature).toFixed(1)}°</div>
          </div>
          <span className="dial-label">Temperature</span>
        </div>
      </div>
    </div>
  );
};

export default HealthAnalytics;
