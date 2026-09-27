import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Upload, ShieldCheck, ArrowLeft, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { InstrumentType } from '../types';

export const RegisterInstrumentPage: React.FC = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState<InstrumentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'Platform Weighing Machine',
    category: 'WEIGHING',
    manufacturer: '',
    model: '',
    serialNumber: '',
    capacity: '',
    accuracyClass: 'Class III',
    unitOfMeasurement: 'kg',
    dateOfManufacture: '',
    installationDate: '',
    location: '',
    district: 'South Delhi',
    state: 'Delhi',
    previousVerificationNumber: '',
    previousVerificationDate: '',
    previousValidityDate: '',
    photographUrl: '',
    supportingDocsUrl: '',
  });

  useEffect(() => {
    api.get('/instruments/types').then((res) => {
      if (res.success && res.types) {
        setTypes(res.types);
        if (res.types.length > 0) {
          setFormData((prev) => ({
            ...prev,
            type: res.types[0].name,
            category: res.types[0].category,
          }));
        }
      }
    });
  }, []);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTypeName = e.target.value;
    const found = types.find((t) => t.name === selectedTypeName);
    setFormData({
      ...formData,
      type: selectedTypeName,
      category: found ? found.category : formData.category,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await api.upload(file);
      if (res.success && res.file) {
        setFormData((prev) => ({ ...prev, photographUrl: res.file.url }));
      }
    } catch (err: any) {
      setError('Photo upload failed: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const res = await api.upload(file);
      if (res.success && res.file) {
        setFormData((prev) => ({ ...prev, supportingDocsUrl: res.file.url }));
      }
    } catch (err: any) {
      setError('Document upload failed: ' + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/instruments', formData);
      if (res.success && res.instrument) {
        navigate(`/instruments/${res.instrument.id}`);
      } else {
        setError(res.message || 'Failed to register instrument.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving instrument.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/instruments"
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Register Weighing / Measuring Instrument
          </h1>
          <p className="text-xs text-slate-500">
            Submit statutory technical specifications to register the instrument in the National Legal Metrology database.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Instrument Classification */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              1. Instrument Classification & Approval
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instrument Type *
                </label>
                <select
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none font-medium"
                >
                  {types.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                  {types.length === 0 && (
                    <>
                      <option value="Electronic Weighing Scale">Electronic Weighing Scale</option>
                      <option value="Platform Weighing Machine">Platform Weighing Machine</option>
                      <option value="Weighbridge (Heavy Duty)">Weighbridge (Heavy Duty)</option>
                      <option value="Retail Counter Scale">Retail Counter Scale</option>
                      <option value="Fuel Dispensing Meter">Fuel Dispensing Meter</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Statutory Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  readOnly
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Technical Specifications */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              2. Technical & Metrological Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Manufacturer Name *
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  required
                  placeholder="e.g. Mettler Toledo India"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Model Designation *
                </label>
                <input
                  type="text"
                  name="model"
                  required
                  placeholder="e.g. MT-PFA-579"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Serial Number (Unique) *
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  required
                  placeholder="e.g. SN-2024-99881"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Max Capacity / Range *
                </label>
                <input
                  type="text"
                  name="capacity"
                  required
                  placeholder="e.g. 1500 kg or 60 Ton"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Accuracy Class *
                </label>
                <select
                  name="accuracyClass"
                  value={formData.accuracyClass}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none font-medium"
                >
                  <option value="Class I">Class I (Special Accuracy / Analytical)</option>
                  <option value="Class II">Class II (High Accuracy / Precision)</option>
                  <option value="Class III">Class III (Medium Accuracy / Commercial)</option>
                  <option value="Class IIII">Class IIII (Ordinary Accuracy)</option>
                  <option value="Class 0.5">Class 0.5 (Liquid Flow Dispenser)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Unit of Measurement *
                </label>
                <select
                  name="unitOfMeasurement"
                  value={formData.unitOfMeasurement}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-gov-accent outline-none"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="mg">Milligram (mg)</option>
                  <option value="t">Metric Ton (t)</option>
                  <option value="L">Litre (L)</option>
                  <option value="mL">Millilitre (mL)</option>
                  <option value="m">Metre (m)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Manufacture
                </label>
                <input
                  type="date"
                  name="dateOfManufacture"
                  value={formData.dateOfManufacture}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Installation Date
                </label>
                <input
                  type="date"
                  name="installationDate"
                  value={formData.installationDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical Location */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              3. Physical Location & Jurisdiction
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  State / UT *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="e.g. Delhi"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  District *
                </label>
                <input
                  type="text"
                  name="district"
                  required
                  placeholder="e.g. South Delhi"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Premises / Site Address *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. Warehouse Bay 4, Bijwasan Depot"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Previous Verification Details (Optional / Re-verification) */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              4. Previous Verification History (If applicable)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Previous Certificate No
                </label>
                <input
                  type="text"
                  name="previousVerificationNumber"
                  placeholder="e.g. LM-CERT-2025-000412"
                  value={formData.previousVerificationNumber}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Previous Stamping Date
                </label>
                <input
                  type="date"
                  name="previousVerificationDate"
                  value={formData.previousVerificationDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Previous Expiry Date
                </label>
                <input
                  type="date"
                  name="previousValidityDate"
                  value={formData.previousValidityDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Document & Photograph Upload */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              5. Instrument Photograph & Supporting Calibration Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-700">Upload Instrument Photograph</div>
                <p className="text-[11px] text-slate-400 mb-3">Clear image showing serial number plate</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="text-xs text-slate-500"
                />
                {uploadingPhoto && <span className="text-xs text-blue-600 block mt-1">Uploading...</span>}
                {formData.photographUrl && (
                  <span className="text-xs text-emerald-600 font-semibold block mt-1">✔ Photo uploaded successfully</span>
                )}
              </div>

              <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50">
                <FileText className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-700">Upload Supporting Documents</div>
                <p className="text-[11px] text-slate-400 mb-3">Model approval certificate or invoice (PDF/Image)</p>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={handleDocUpload}
                  className="text-xs text-slate-500"
                />
                {uploadingDoc && <span className="text-xs text-blue-600 block mt-1">Uploading...</span>}
                {formData.supportingDocsUrl && (
                  <span className="text-xs text-emerald-600 font-semibold block mt-1">✔ Document uploaded successfully</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Link
              to="/instruments"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gov-blue hover:bg-gov-dark text-white text-xs font-bold rounded-lg shadow-md transition flex items-center gap-2"
            >
              {loading ? (
                <span>Registering Instrument...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Submit Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
