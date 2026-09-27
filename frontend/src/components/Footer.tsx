import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ShieldCheck, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t-4 border-gov-blue">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Act Notice */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Scale className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-base tracking-tight">e-Metrology System</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              National Digital Platform for Online Registration, Verification, Re-verification, and Certification of Weighing and Measuring Instruments under the Legal Metrology Act, 2009.
            </p>
            <div className="pt-2 flex items-center gap-2 text-emerald-400 text-[11px] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Tamper-Evident QR Authentication</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide">Public Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/verify" className="hover:text-white transition">Verify Digital Certificate</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition">Track Application Timeline</Link>
              </li>
              <li>
                <Link to="/instruments/new" className="hover:text-white transition">Register Measuring Instrument</Link>
              </li>
              <li>
                <Link to="/applications/new" className="hover:text-white transition">Apply for Annual Re-verification</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">Legal Metrology Officer Portal</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Regulatory Stakeholders */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide">Regulatory Framework</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Legal Metrology Act, 2009 (No. 1 of 2010)</li>
              <li>Legal Metrology (General) Rules, 2011</li>
              <li>National Physical Laboratory (NPL India)</li>
              <li>International Organization of Legal Metrology (OIML)</li>
              <li>Govt Approved Test Centres (GATC Wing)</li>
            </ul>
          </div>

          {/* Col 4: National Helpline & Support */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide">National Helpdesk</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <span>Directorate of Legal Metrology, Krishi Bhawan, New Delhi - 110001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Toll-Free National Helpline: 1800-11-4000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>support-metrology@gov.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Footer */}
      <div className="border-t border-slate-800 bg-slate-950 py-4 px-4 text-center text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            © {new Date().getFullYear()} Department of Legal Metrology. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Security Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Hyperlink Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms & Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
