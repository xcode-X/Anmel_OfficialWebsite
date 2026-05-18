import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Upload, FileText, X, AlertCircle, User, BookOpen, GraduationCap, MapPin, Phone, Mail, Building, Clock, Briefcase, ChevronRight } from 'lucide-react';
import { studentRegistrations, universitiesApi } from '../lib/api';
import { Link, useSearchParams } from 'react-router-dom';

const degreeLevels = [
  'High School / Foundation Program',
  'Undergraduate / Bachelor’s Degree',
  'Master’s Degree',
  'PhD / Doctorate'
];

// Universities fetched from API

export default function StudentApplication() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [partnerUniversities, setPartnerUniversities] = useState([]);

  useEffect(() => {
    // poll() fires immediately on mount, filters out DB_UNAVAILABLE, and polls every 30 s.
    // Never pass universitiesApi.list() directly to setState — it may return a Symbol
    // sentinel when the DB is temporarily unavailable, which would break the select.
    const cleanup = universitiesApi.poll(
      (data) => { if (Array.isArray(data)) setPartnerUniversities(data); },
      30000,
    );
    return cleanup;
  }, []);

  const initUni = searchParams.get('university') || '';
  const initCourse = searchParams.get('course') || '';

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', country: '',
    educationLevel: '', experienceLevel: '',
    university: initUni, course: initCourse, degreeLevel: '', studyMode: '', campus: '',
    passportPhoto: '', oLevelCertificate: '', aLevelCertificate: '',
    highSchoolDiploma: '', waecResult: '', academicTranscript: '',
    bachelorDegree: '', masterDegree: '', englishProficiency: '',
    healthCertificate: '', passportBioPage: '', recommendationLetters: '',
    personalStatement: '', cvResume: '', otherDocuments: ''
  });

  const [fileNames, setFileNames] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('intelera_student_app_normal');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData);
        setFileNames(parsed.fileNames);
      } catch (e) {
        console.error('Failed to load saved progress', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('intelera_student_app_normal', JSON.stringify({ formData, fileNames }));
  }, [formData, fileNames]);

  const updateForm = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getRequiredDocs = () => {
    const lvl = formData.degreeLevel;
    if (lvl === 'High School / Foundation Program') {
      return [
        { name: 'passportPhoto', label: 'Passport Photo' },
        { name: 'oLevelCertificate', label: 'O-Level Certificate' },
        { name: 'waecResult', label: 'WAEC/WASSCE Results' },
        { name: 'academicTranscript', label: 'High School Transcript' },
        { name: 'healthCertificate', label: 'Health Certificate' }
      ];
    } else if (lvl === 'Undergraduate / Bachelor’s Degree') {
      return [
        { name: 'passportPhoto', label: 'Passport Photo' },
        { name: 'highSchoolDiploma', label: 'High School Diploma' },
        { name: 'waecResult', label: 'WAEC/WASSCE Results' },
        { name: 'academicTranscript', label: 'Academic Transcript' },
        { name: 'healthCertificate', label: 'Health Certificate' }
      ];
    } else if (lvl === 'Master’s Degree') {
      return [
        { name: 'passportPhoto', label: 'Passport Photo' },
        { name: 'highSchoolDiploma', label: 'High School Diploma' },
        { name: 'waecResult', label: 'WAEC/WASSCE Results' },
        { name: 'bachelorDegree', label: 'Bachelor’s Degree Certificate' },
        { name: 'academicTranscript', label: 'University Transcript' },
        { name: 'cvResume', label: 'CV/Resume' },
        { name: 'recommendationLetters', label: 'Recommendation Letters' },
        { name: 'personalStatement', label: 'Personal Statement' },
        { name: 'healthCertificate', label: 'Health Certificate' }
      ];
    } else if (lvl === 'PhD / Doctorate') {
      return [
        { name: 'passportPhoto', label: 'Passport Photo' },
        { name: 'highSchoolDiploma', label: 'High School Diploma' },
        { name: 'waecResult', label: 'WAEC/WASSCE Results' },
        { name: 'bachelorDegree', label: 'Bachelor’s Degree Certificate' },
        { name: 'masterDegree', label: 'Master’s Degree Certificate' },
        { name: 'academicTranscript', label: 'Academic Transcripts' },
        { name: 'otherDocuments', label: 'Research Proposal' },
        { name: 'recommendationLetters', label: 'Recommendation Letters' },
        { name: 'cvResume', label: 'CV/Resume' },
        { name: 'healthCertificate', label: 'Health Certificate' }
      ];
    }
    return [];
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("File size exceeds 15MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [fieldName]: reader.result }));
      setFileNames(prev => ({ ...prev, [fieldName]: file.name }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: '' }));
    setFileNames(prev => ({ ...prev, [fieldName]: null }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone) return false;
    if (!formData.educationLevel) return false;
    if (!formData.university || !formData.course || !formData.degreeLevel) return false;
    
    const required = getRequiredDocs();
    if (!required.every(doc => !!formData[doc.name])) return false;
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fill in all required fields and upload all mandatory documents.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    setError('');
    try {
      await studentRegistrations.register(formData);
      setSubmitted(true);
      localStorage.removeItem('intelera_student_app_normal');
    } catch (err) {
      setError(err.message || 'Submission failed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 max-w-lg text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 font-sans">Application Submitted</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">Thank you, {formData.fullName}. Your application has been successfully submitted. Our admissions team will review your profile and contact you shortly.</p>
          <Link to="/" className="inline-flex items-center justify-center w-full py-3.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
            Return to Homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-sans">Student Application Form</h1>
          <p className="text-slate-500 text-sm">Please fill out all the required information below to process your admission.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
            
            {/* 1. Personal Information */}
            <div className="p-8">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-blue-600" /> Personal Details
              </h2>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Full Name *</label>
                  <input required name="fullName" value={formData.fullName} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Email Address *</label>
                  <input required type="email" name="email" value={formData.email} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Enter your email address" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Phone Number *</label>
                  <input required name="phone" value={formData.phone} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Enter your phone number" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Country of Residence</label>
                  <input name="country" value={formData.country} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Enter your country of residence" />
                </div>
              </div>
            </div>

            {/* 2. Academic Background */}
            <div className="p-8">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-blue-600" /> Academic Background
              </h2>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Current Education Level *</label>
                  <select required name="educationLevel" value={formData.educationLevel} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors">
                    <option value="">Select Option</option>
                    <option value="High School">High School</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Years of Experience</label>
                  <select name="experienceLevel" value={formData.experienceLevel} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors">
                    <option value="">Select Option</option>
                    <option value="None">None (Recent Graduate)</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Program Selection */}
            <div className="p-8">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                <GraduationCap className="w-5 h-5 text-blue-600" /> Program Selection
              </h2>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Degree Applied For *</label>
                  <select required name="degreeLevel" value={formData.degreeLevel} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors">
                    <option value="">Select Degree</option>
                    {degreeLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Preferred University *</label>
                  <select required name="university" value={formData.university} onChange={(e) => {
                      updateForm(e);
                      setFormData(prev => ({ ...prev, course: '' }));
                    }} 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors">
                    <option value="">Select University</option>
                    {partnerUniversities.map(u => (
                      <option key={u.name} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Course / Program *</label>
                  <select required name="course" value={formData.course} onChange={updateForm} 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    disabled={!formData.university}>
                    <option value="">{formData.university ? 'Select Course' : 'Select University First'}</option>
                    {formData.university && partnerUniversities.find(u => u.name === formData.university)?.courses.map(c => (
                      <option key={c.name || c} value={c.name || c}>{c.name || c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Study Mode</label>
                  <select name="studyMode" value={formData.studyMode} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors">
                    <option value="">Select Mode</option>
                    <option value="On-Campus">On-Campus</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Document Uploads */}
            <div className="p-8 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" /> Required Documents
              </h2>
              
              {!formData.degreeLevel ? (
                <p className="text-sm text-slate-500 mb-6 bg-slate-100 p-4 rounded-lg border border-slate-200">
                  Please select your <strong className="text-slate-700">Desired Degree Level</strong> above to see exactly which documents you need to upload.
                </p>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-6">Upload the mandatory documents for your application. Max size 15MB per file (PDF only).</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {getRequiredDocs().map((doc) => (
                      <div key={doc.name} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            {doc.label} <span className="text-red-500">*</span>
                          </span>
                          {formData[doc.name] && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                        
                        {formData[doc.name] ? (
                          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                            <span className="text-xs text-slate-600 truncate max-w-[200px]">{fileNames[doc.name] || 'Uploaded successfully'}</span>
                            <button type="button" onClick={() => removeFile(doc.name)} className="text-slate-400 hover:text-red-500 p-1">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, doc.name)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-500 hover:bg-blue-50 transition-colors">
                              <Upload className="w-4 h-4" />
                              <span className="text-xs font-medium">Choose File</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Submit Action */}
            <div className="p-8 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">By submitting, you agree to our Terms and Privacy Policy.</p>
              <button 
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Submit Application'} {!loading && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
