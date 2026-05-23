import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { AppContext } from "../../context/AppContext";
import {
  Heart,
  User,
  Phone,
  Activity,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import "./Auth.css";

const Register = () => {
  const { login } = useContext(AuthContext);
  const { addPatient, addToast } = useContext(AppContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    email: "",
    password: "",
    contactPhone: "",
    emergencyName: "",
    emergencyRelation: "Spouse",
    emergencyPhone: "",
    bloodGroup: "O+",
    condition: "",
    allergies: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return "Full Name is required.";
    if (!formData.age || isNaN(formData.age) || formData.age <= 0) return "Please enter a valid age.";
    if (!formData.email.trim() || !formData.email.includes("@")) return "Please enter a valid email address.";
    if (formData.password.length < 4) return "Password must be at least 4 characters.";
    return null;
  };

  const validateStep2 = () => {
    if (!formData.emergencyName.trim()) return "Emergency contact name is required.";
    if (!formData.emergencyPhone.trim()) return "Emergency contact phone is required.";
    return null;
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Package patient record structure
    const newPatientData = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      status: "Discharged", // Registered outpatient
      department: "General Medicine",
      room: "Outpatient",
      admissionDate: new Date().toISOString().split("T")[0],
      condition: formData.condition || "Routine Registration",
      emergencyContact: {
        name: formData.emergencyName,
        relation: formData.emergencyRelation,
        phone: formData.emergencyPhone
      },
      vitals: {
        heartRate: 72,
        bloodPressure: "120/80",
        oxygen: 98,
        temperature: 98.6,
        ecgHistory: [70, 71, 72, 70, 72, 71]
      },
      history: [
        {
          date: new Date().toISOString().split("T")[0],
          type: "Registration",
          notes: `Self-registered outpatient. Medical Background: Group ${formData.bloodGroup}. Allergies: ${formData.allergies || "None declared"}.`
        }
      ],
      prescriptions: []
    };

    // Add to global database
    const patientObj = addPatient(newPatientData, formData.name, "patient");
    
    // Auto login
    const res = login(formData.email, formData.password);
    if (res.success) {
      addToast(`Account created! Welcome, ${formData.name}!`, "success");
      navigate("/dashboard");
    } else {
      setError(res.error || "Registration succeeded but login failed.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="blur-circle circle-1"></div>
      <div className="blur-circle circle-2"></div>

      <div className="register-container">
        {/* Stepper Card */}
        <div className="register-card glass-card">
          <div className="register-card-header">
            <div className="register-logo" onClick={() => navigate("/login")}>
              <Heart size={24} className="heart-icon pulse-animation" />
              <span>MedVitals Registration</span>
            </div>
            
            {/* Steps Progress Indicator */}
            <div className="stepper-bar">
              <div className={`step-dot ${step >= 1 ? "active" : ""}`}>
                <User size={14} />
                <span>Account</span>
              </div>
              <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
              <div className={`step-dot ${step >= 2 ? "active" : ""}`}>
                <Phone size={14} />
                <span>Contact</span>
              </div>
              <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
              <div className={`step-dot ${step >= 3 ? "active" : ""}`}>
                <Activity size={14} />
                <span>Clinical</span>
              </div>
            </div>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="step-content animated-step">
              <h3 className="step-title">Step 1: Account Information</h3>
              <p className="step-desc">Enter your core personal details to create an account</p>
              
              <div className="form-group">
                <label>Full Patient Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    className="form-control"
                    placeholder="e.g. 28"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    className="form-control"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="step-actions">
                <button className="btn btn-secondary" onClick={() => navigate("/login")}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleNext}>
                  <span>Next Step</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Emergency Contact */}
          {step === 2 && (
            <div className="step-content animated-step">
              <h3 className="step-title">Step 2: Emergency Contacts</h3>
              <p className="step-desc">Establish secure relative details for safety procedures</p>

              <div className="form-group">
                <label>Personal Mobile Number</label>
                <input
                  type="tel"
                  name="contactPhone"
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={formData.contactPhone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Full Name</label>
                <input
                  type="text"
                  name="emergencyName"
                  className="form-control"
                  placeholder="e.g. Jane Doe"
                  value={formData.emergencyName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Relationship</label>
                  <select
                    name="emergencyRelation"
                    className="form-control"
                    value={formData.emergencyRelation}
                    onChange={handleChange}
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Emergency Mobile Number</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="step-actions">
                <button className="btn btn-secondary" onClick={handleBack}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button className="btn btn-primary" onClick={handleNext}>
                  <span>Next Step</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Initial Clinical Details */}
          {step === 3 && (
            <div className="step-content animated-step">
              <h3 className="step-title">Step 3: Clinical Background</h3>
              <p className="step-desc">Provide core medical information to tailor clinical treatments</p>

              <div className="form-group">
                <label>Blood Group Type</label>
                <select
                  name="bloodGroup"
                  className="form-control"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Pre-Existing Medical Conditions (If any)</label>
                <textarea
                  name="condition"
                  className="form-control"
                  placeholder="e.g. Hypertension, Diabetes Type II, Asthma..."
                  value={formData.condition}
                  onChange={handleChange}
                  rows={2}
                  style={{ resize: "none" }}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Known Allergies (Drugs, Foods, Chemicals)</label>
                <textarea
                  name="allergies"
                  className="form-control"
                  placeholder="e.g. Penicillin, Peanuts, Latex..."
                  value={formData.allergies}
                  onChange={handleChange}
                  rows={2}
                  style={{ resize: "none" }}
                ></textarea>
              </div>

              <div className="step-actions">
                <button className="btn btn-secondary" onClick={handleBack}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button className="btn btn-primary btn-submit-success" onClick={handleSubmit}>
                  <CheckCircle2 size={16} />
                  <span>Complete & Register</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
