import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Upload, FileText, X, AlertCircle, User, Briefcase, ChevronRight } from 'lucide-react';
import { agentsApi } from '../lib/api';
import { Link } from 'react-router-dom';
import { usePageChrome } from '../context/AppContext';

export default function AgentRegistration() {
  const { setPageChrome } = usePageChrome();
  const [submitted, setSubmitted] = useState(false);
  const [assignedAgentCode, setAssignedAgentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '', gender: '', dateOfBirth: '', nationality: '', countryOfResidence: '',
    phone: '', email: '', residentialAddress: '',
    organizationName: '', yearsOfExperience: '', areasOfRecruitment: '', targetCountries: '',
    studentsPerYear: '', referralSource: '', personalStatement: '',
    linkedin: '', twitter: '', website: '', agreedToTerms: false,
  });

  const [files, setFiles] = useState({
    passportPhoto: '',
    idDocument: '',
  });
  const [fileNames, setFileNames] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('intelera_agent_app_normal');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.fileNames) setFileNames(parsed.fileNames);
      } catch (e) {
        console.error('Failed to load saved progress', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!submitted) {
      try {
        localStorage.setItem('intelera_agent_app_normal', JSON.stringify({ formData, fileNames }));
      } catch (e) {
        console.warn('Failed to save draft progress to localStorage:', e);
      }
    }
  }, [formData, fileNames, submitted]);

  useEffect(() => {
    if (submitted) {
      setPageChrome({ hideFooter: true, hideFloatingUi: true });
      document.body.style.overflow = 'hidden';
    } else {
      setPageChrome({ hideFooter: false, hideFloatingUi: false });
      document.body.style.overflow = '';
    }
    return () => {
      setPageChrome({ hideFooter: false, hideFloatingUi: false });
      document.body.style.overflow = '';
    };
  }, [submitted, setPageChrome]);

  const updateForm = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit.');
      return;
    }
    const b64 = await fileToBase64(file);
    setFiles((prev) => ({ ...prev, [fieldName]: b64 }));
    setFileNames((prev) => ({ ...prev, [fieldName]: file.name }));
  };

  const removeFile = (fieldName) => {
    setFiles((prev) => ({ ...prev, [fieldName]: '' }));
    setFileNames((prev) => ({ ...prev, [fieldName]: null }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.gender || !formData.dateOfBirth || !formData.nationality) return false;
    if (!formData.countryOfResidence || !formData.residentialAddress) return false;
    if (!formData.yearsOfExperience || !formData.areasOfRecruitment || !formData.studentsPerYear || !formData.targetCountries) return false;
    if (!files.passportPhoto || !files.idDocument) return false;
    if (!formData.agreedToTerms) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please ensure all required fields are filled, documents are uploaded, and terms are accepted.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        socialMediaLinks: { linkedin: formData.linkedin, twitter: formData.twitter, website: formData.website },
        areasOfRecruitment: formData.areasOfRecruitment.split(',').map((s) => s.trim()),
        targetCountries: formData.targetCountries.split(',').map((s) => s.trim()),
        yearsOfExperience: Number(formData.yearsOfExperience),
        studentsPerYear: Number(formData.studentsPerYear),
        passportPhoto: files.passportPhoto,
        idDocument: files.idDocument,
      };

      const result = await agentsApi.register(payload);
      setAssignedAgentCode(result.agentCode || '');
      setSubmitted(true);
      localStorage.removeItem('intelera_agent_app_normal');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      setError(err.message || 'Registration failed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const successModal = (
    <AnimatePresence>
      {submitted && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-received-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[300] flex items-center justify-center px-4 sm:px-6 bg-slate-900/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 sm:p-12 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={2} />
            </div>
            <h2 id="application-received-title" className="text-3xl font-bold text-slate-900 mb-3 font-sans">
              Application Received
            </h2>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Thank you, {formData.fullName}. Our partnership team will carefully review your application and contact you within 2–3 business days.
            </p>
            {assignedAgentCode && (
              <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">Your Agent Login ID</p>
                <p className="text-2xl font-mono font-bold text-emerald-900">{assignedAgentCode}</p>
                <p className="text-sm text-emerald-800/80 mt-2">
                  Save this ID. After approval, you will sign in to the agent portal using this login ID and the password sent to your email.
                </p>
              </div>
            )}
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-3.5 font-medium text-white transition-colors hover:bg-slate-800"
            >
              Return to Homepage
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (submitted) {
    return (
      <>
        <div className="min-h-[50vh] bg-slate-50" aria-hidden />
        {typeof document !== 'undefined' && createPortal(successModal, document.body)}
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 font-sans">Agent Registration Form</h1>
            <p className="text-slate-500 text-sm">Partner with us to recruit students globally. Please provide accurate information below.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <form onSubmit={handleSubmit} className="divide-y divide-slate-100">

              <div className="p-8">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                  <User className="w-5 h-5 text-blue-600" /> Personal Information
                </h2>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Full Name *</label>
                    <input required name="fullName" value={formData.fullName} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Gender *</label>
                    <select required name="gender" value={formData.gender} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Date of Birth *</label>
                    <input required type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Nationality *</label>
                    <input required name="nationality" value={formData.nationality} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Enter your nationality" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Email Address *</label>
                    <input required type="email" name="email" value={formData.email} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Enter your email address" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Phone Number *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Enter your phone number" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Country of Residence *</label>
                    <input required name="countryOfResidence" value={formData.countryOfResidence} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="e.g. United Kingdom" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Residential Address *</label>
                    <input required name="residentialAddress" value={formData.residentialAddress} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Enter your full residential address" />
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                  <Briefcase className="w-5 h-5 text-blue-600" /> Professional Overview
                </h2>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Years of Experience *</label>
                    <input required type="number" min="0" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Enter years of experience" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Expected Students Per Year *</label>
                    <input required type="number" min="0" name="studentsPerYear" value={formData.studentsPerYear} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" placeholder="Enter expected students per year" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Areas of Recruitment (Comma Separated) *</label>
                    <input required name="areasOfRecruitment" value={formData.areasOfRecruitment} onChange={updateForm} placeholder="Enter areas of recruitment" className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Target Countries (Comma Separated) *</label>
                    <input required name="targetCountries" value={formData.targetCountries} onChange={updateForm} placeholder="Enter target countries" className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Personal Statement / Motivation *</label>
                    <textarea required rows={4} name="personalStatement" value={formData.personalStatement} onChange={updateForm} className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none" placeholder="Enter your personal statement or motivation..." />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Identity Verification
                </h2>
                <p className="text-slate-600 mb-6 mt-4">Please upload clear copies of your identification. PDF format only. Max 15MB per file.</p>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'passportPhoto', label: 'Passport Size Photo' },
                    { id: 'idDocument', label: 'National ID / Passport' },
                  ].map((doc) => (
                    <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          {doc.label} <span className="text-red-500">*</span>
                        </span>
                        {files[doc.id] && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>

                      {files[doc.id] ? (
                        <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                          <span className="text-xs text-slate-600 truncate max-w-[200px]">{fileNames[doc.id] || 'Uploaded successfully'}</span>
                          <button type="button" onClick={() => removeFile(doc.id)} className="text-slate-400 hover:text-red-500 p-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, doc.id)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className="flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-500 hover:bg-blue-50 transition-colors">
                            <Upload className="w-4 h-4" />
                            <span className="text-xs font-medium">Choose File</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-white">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                  <input required type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={updateForm} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <label className="text-sm text-slate-700 leading-relaxed">I confirm that the information provided is accurate and I agree to the Agent Partnership Terms & Conditions.</label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : 'Submit Application'}
                    {!loading && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}
