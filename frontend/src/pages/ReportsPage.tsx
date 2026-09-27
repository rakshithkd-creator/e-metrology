import React, { useState } from 'react';
import { FileSpreadsheet, Download, Printer, FileText, CheckCircle2, Clock, Scale } from 'lucide-react';
import { api } from '../api/client';

export const ReportsPage: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadCsv = (reportType: string) => {
    setDownloading(reportType);
    window.open(`/api/reports/export/${reportType}`, '_blank');
    setTimeout(() => setDownloading(null), 1500);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const reportsList = [
    {
      id: 'applications',
      title: 'Verification Applications Report',
      description: 'Comprehensive export of all statutory verification applications, categories, applicant contacts, and allocation status.',
      icon: FileText,
      badge: 'CSV / Excel',
    },
    {
      id: 'certificates',
      title: 'Legal Metrology Certificates Master Registry',
      description: 'Full statutory repository export containing certificate numbers, valid periods, security seal codes, and verified tolerances.',
      icon: CheckCircle2,
      badge: 'CSV / Excel',
    },
    {
      id: 'verifications',
      title: 'Field Verification & Stamping Log',
      description: 'On-site measurement inspection results, testing officers, GPS locations, and PASS/FAIL records.',
      icon: Scale,
      badge: 'CSV / Excel',
    },
    {
      id: 'expiry',
      title: 'Statutory Validity & Expiry Audit Report',
      description: 'Instruments due for re-verification within 90/60/30 days, or already lapsed under Section 30 enforcement.',
      icon: Clock,
      badge: 'CSV / Excel',
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-gov-blue" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Statutory Directorate MIS & Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export official analytical reports for state and central legal metrology authorities.
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          const isCurrent = downloading === rep.id;

          return (
            <div
              key={rep.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-gov-blue flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    {rep.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-800">{rep.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rep.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleDownloadCsv(rep.id)}
                  disabled={isCurrent}
                  className="w-full py-2.5 bg-gov-blue hover:bg-gov-dark disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>{isCurrent ? 'Generating CSV Export...' : 'Download CSV Dataset'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
