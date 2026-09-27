import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Save, Scale, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { ChecklistConfig, InstrumentType } from '../types';
import { LoadingSpinner } from '../components/LoadingAndEmpty';

export const SettingsChecklistPage: React.FC = () => {
  const [checklists, setChecklists] = useState<ChecklistConfig[]>([]);
  const [types, setTypes] = useState<InstrumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Checklist Modal / Row
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistDesc, setNewChecklistDesc] = useState('');

  // New Instrument Type
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCategory, setNewTypeCategory] = useState('WEIGHING');
  const [newTypeValidity, setNewTypeValidity] = useState(365);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [checkRes, typeRes] = await Promise.all([
        api.get('/verifications/checklists'),
        api.get('/instruments/types'),
      ]);
      if (checkRes.success) setChecklists(checkRes.items);
      if (typeRes.success) setTypes(typeRes.types);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChecklistToggle = (index: number, field: 'isMandatory' | 'isActive') => {
    setChecklists((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: !copy[index][field] };
      return copy;
    });
  };

  const handleSaveChecklists = async () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      const res = await api.put('/verifications/checklists', { items: checklists });
      if (res.success) {
        setSuccessMsg('Checklist configurations saved successfully.');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert('Error saving checklist: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistTitle.trim()) return;
    const newItem: ChecklistConfig = {
      id: '',
      itemKey: `CUSTOM_${Date.now()}`,
      title: newChecklistTitle.trim(),
      description: newChecklistDesc.trim(),
      isMandatory: true,
      sortOrder: checklists.length + 1,
      isActive: true,
    };
    setChecklists([...checklists, newItem]);
    setNewChecklistTitle('');
    setNewChecklistDesc('');
  };

  const handleAddInstrumentType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    try {
      const res = await api.post('/instruments/types', {
        name: newTypeName.trim(),
        category: newTypeCategory,
        standardValidityDays: newTypeValidity,
      });
      if (res.success) {
        setNewTypeName('');
        fetchData();
      }
    } catch (err: any) {
      alert('Failed to add instrument type: ' + err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Directorate Metrological Configurations..." />;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Statutory Verification & Checklist Configurations
        </h1>
        <p className="text-xs text-slate-500">
          Configure physical inspection checkpoints and instrument classifications mandated for Legal Metrology Officers.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Section 1: Verification Checklist Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-gov-blue" />
              <span>Inspection Checkpoints</span>
            </h2>
            <p className="text-xs text-slate-500">
              Checkpoints displayed on LMO field inspection consoles
            </p>
          </div>
          <button
            onClick={handleSaveChecklists}
            disabled={saving}
            className="px-4 py-2 bg-gov-blue hover:bg-gov-dark text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Checkpoints'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {checklists.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5 flex-1">
                <div className="font-bold text-slate-800">
                  {idx + 1}. {item.title}
                </div>
                {item.description && <div className="text-slate-500 text-[11px]">{item.description}</div>}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isMandatory}
                    onChange={() => handleChecklistToggle(idx, 'isMandatory')}
                  />
                  <span className="font-semibold text-slate-700">Mandatory</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={() => handleChecklistToggle(idx, 'isActive')}
                  />
                  <span className="font-semibold text-emerald-700">Active</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Checklist Item Inline */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="New Checklist Title (e.g. Sensitivity Test Under Full Load)..."
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none"
          />
          <input
            type="text"
            placeholder="Description / Regulatory rule reference (optional)..."
            value={newChecklistDesc}
            onChange={(e) => setNewChecklistDesc(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none"
          />
          <button
            type="button"
            onClick={handleAddChecklistItem}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Section 2: Instrument Types Catalog */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-gov-blue" />
            <span>Configured Instrument Types</span>
          </h2>
          <p className="text-xs text-slate-500">
            Instrument categories and default statutory validity periods
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {types.map((t) => (
            <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800">{t.name}</div>
              <div className="text-[11px] text-slate-500">Category: {t.category}</div>
              <div className="text-[11px] text-blue-700 font-semibold">Validity: {t.standardValidityDays} Days</div>
            </div>
          ))}
        </div>

        {/* Add Instrument Type Form */}
        <form onSubmit={handleAddInstrumentType} className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <input
            type="text"
            required
            placeholder="New Instrument Type Name..."
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-300 outline-none"
          />
          <select
            value={newTypeCategory}
            onChange={(e) => setNewTypeCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 outline-none font-medium"
          >
            <option value="WEIGHING">WEIGHING</option>
            <option value="VOLUME">VOLUME</option>
            <option value="LENGTH">LENGTH</option>
            <option value="FLOW">FLOW</option>
            <option value="OTHER">OTHER</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-gov-blue hover:bg-gov-dark text-white font-bold rounded-lg flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Type</span>
          </button>
        </form>
      </div>
    </div>
  );
};
