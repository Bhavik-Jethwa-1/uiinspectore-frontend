import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Save, CreditCard, DollarSign, Globe, Calendar, Shield, CheckCircle2, XCircle, AlertTriangle, Building, FileText, Zap } from 'lucide-react';

const ACCENT = '#ef4444';

const PAYMENT_GATEWAYS = [
  { id: 'stripe',     name: 'Stripe',     description: 'Primary global payment processor',                status: 'connected',  apiKey: 'sk_live_•••••••••••••qN4H', webhook: 'whk_•••••••••••••L9p2', mode: 'live',    color: '#635bff' },
  { id: 'razorpay',   name: 'Razorpay',   description: 'India-focused UPI, cards, and netbanking',         status: 'connected',  apiKey: 'rzp_live_••••••••••K2xF', webhook: 'whk_••••••••••••P8t1', mode: 'live',    color: '#3395ff' },
  { id: 'paypal',     name: 'PayPal',     description: 'Secondary processor for PayPal balance users',    status: 'disconnected', apiKey: '—',                       webhook: '—',                      mode: 'sandbox', color: '#003087' },
  { id: 'paddle',     name: 'Paddle',     description: 'Merchant of record for tax compliance (EU)',      status: 'disconnected', apiKey: '—',                       webhook: '—',                      mode: 'sandbox', color: '#ff5a00' },
];

const TAX_RATES = [
  { region: 'United States', code: 'US', rate: 0,     type: 'sales_tax' },
  { region: 'United Kingdom', code: 'GB', rate: 20,    type: 'vat' },
  { region: 'Germany',        code: 'DE', rate: 19,    type: 'vat' },
  { region: 'France',         code: 'FR', rate: 20,    type: 'vat' },
  { region: 'India',          code: 'IN', rate: 18,    type: 'gst' },
  { region: 'Canada',         code: 'CA', rate: 13,    type: 'hst' },
  { region: 'Australia',      code: 'AU', rate: 10,    type: 'gst' },
  { region: 'Japan',          code: 'JP', rate: 10,    type: 'jct' },
];

export default function AdminBillingAdminPage() {
  const [settings, setSettings] = useState({
    currency: 'USD',
    taxRate: 0,
    invoicePrefix: 'UII-',
    paymentTerms: 'net_30',
    gracePeriodDays: 7,
    autoChargeEnabled: true,
    dunningEmailsEnabled: true,
    taxInclusive: false,
  });
  const [savedAt, setSavedAt] = useState(null);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSavedAt(new Date());
  };

  const connectedGateways = PAYMENT_GATEWAYS.filter(g => g.status === 'connected').length;

  return (
    <div style={{ background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)', minHeight: '100vh' }}>
      
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-black text-white flex items-center gap-2">
              <Receipt size={20} style={{ color: ACCENT }} /> Billing Configuration
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Currency, tax, invoicing, and payment gateway settings
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savedAt && (
              <div className="text-[11px] text-green-400 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle2 size={11} /> Saved at {savedAt.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all"
              style={{ background: ACCENT, color: '#fff' }}>
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Currency',         value: settings.currency, icon: DollarSign, color: '#10b981' },
            { label: 'Tax Rate',         value: `${settings.taxRate}%`, icon: Globe,    color: '#8b5cf6' },
            { label: 'Connected Gateways', value: `${connectedGateways}/${PAYMENT_GATEWAYS.length}`, icon: CreditCard, color: '#06b6d4' },
            { label: 'Grace Period',     value: `${settings.gracePeriodDays} days`, icon: Calendar, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}15` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div className="text-[22px] font-black text-white mb-0.5">{s.value}</div>
              <div className="text-[11px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* General settings */}
          <div className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
              <Globe size={14} className="text-gray-500" /> General Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Default Currency</label>
                <select
                  value={settings.currency}
                  onChange={e => handleChange('currency', e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-[12px] text-white outline-none"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="JPY">JPY — Japanese Yen (¥)</option>
                  <option value="CAD">CAD — Canadian Dollar ($)</option>
                  <option value="AUD">AUD — Australian Dollar ($)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={e => handleChange('taxRate', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-[12px] text-white outline-none font-mono"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Invoice Prefix</label>
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={e => handleChange('invoicePrefix', e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-[12px] text-white outline-none font-mono"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <p className="text-[10px] text-gray-500 mt-1">Next invoice: <span className="font-mono text-white">{settings.invoicePrefix}2026-07-24-00482</span></p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Payment Terms</label>
                <select
                  value={settings.paymentTerms}
                  onChange={e => handleChange('paymentTerms', e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-[12px] text-white outline-none"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <option value="due_on_receipt">Due on Receipt</option>
                  <option value="net_7">Net 7</option>
                  <option value="net_15">Net 15</option>
                  <option value="net_30">Net 30</option>
                  <option value="net_60">Net 60</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Grace Period (days)</label>
                <input
                  type="number"
                  value={settings.gracePeriodDays}
                  onChange={e => handleChange('gracePeriodDays', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg text-[12px] text-white outline-none font-mono"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <p className="text-[10px] text-gray-500 mt-1">Days before suspending service after failed payment</p>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="rounded-2xl border p-5"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
            <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={14} className="text-gray-500" /> Automation
            </h3>

            <div className="space-y-3">
              {[
                { key: 'autoChargeEnabled',   label: 'Auto-charge saved cards',   description: 'Automatically attempt to charge the customer\'s saved card on renewal' },
                { key: 'dunningEmailsEnabled', label: 'Dunning email sequence',   description: 'Send a series of reminder emails before and after failed payments' },
                { key: 'taxInclusive',         label: 'Tax-inclusive pricing',     description: 'Show prices with tax included in customer-facing UI' },
              ].map(t => (
                <div key={t.key} className="flex items-center justify-between gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-white">{t.label}</div>
                    <div className="text-[10px] text-gray-500">{t.description}</div>
                  </div>
                  <button
                    onClick={() => handleChange(t.key, !settings[t.key])}
                    className="relative w-11 h-6 rounded-full transition-all shrink-0"
                    style={{ background: settings[t.key] ? ACCENT : 'rgba(255,255,255,0.1)' }}>
                    <span
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                      style={{ left: settings[t.key] ? '22px' : '2px' }}
                    />
                  </button>
                </div>
              ))}
            </div>

            <h3 className="text-[14px] font-bold text-white mb-3 mt-6 flex items-center gap-2">
              <Building size={14} className="text-gray-500" /> Company Info
            </h3>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-gray-500">Legal name</span>
                <span className="text-white font-semibold">UIInspectore Inc.</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-gray-500">Tax ID</span>
                <span className="text-white font-mono">EU37294810</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-gray-500">Address</span>
                <span className="text-white text-right">123 Market St<br />San Francisco, CA 94103</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-gray-500">Support email</span>
                <span className="text-white font-mono">billing@uiinspectore.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div>
          <h3 className="text-[14px] font-bold text-white mb-3 flex items-center gap-2">
            <CreditCard size={14} className="text-gray-500" /> Payment Gateways
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PAYMENT_GATEWAYS.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border p-4"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: g.status === 'connected' ? `${g.color}30` : 'rgba(239,68,68,0.1)',
                }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${g.color}20`, border: `1px solid ${g.color}40` }}>
                      <CreditCard size={16} style={{ color: g.color }} />
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-white">{g.name}</div>
                      <div className="text-[10px] text-gray-500">{g.description}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 capitalize shrink-0"
                    style={{
                      background: g.status === 'connected' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: g.status === 'connected' ? '#10b981' : '#ef4444',
                    }}>
                    {g.status === 'connected' ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
                    {g.status}
                  </span>
                </div>

                {g.status === 'connected' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-500">API Key</span>
                      <span className="font-mono text-gray-300">{g.apiKey}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-500">Webhook</span>
                      <span className="font-mono text-gray-300">{g.webhook}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-500">Mode</span>
                      <span className="font-bold uppercase" style={{ color: g.mode === 'live' ? '#ef4444' : '#f59e0b' }}>{g.mode}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-500 italic py-2">
                    Not connected — click to configure
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  {g.status === 'connected' ? (
                    <>
                      <button className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all hover:bg-white/5"
                        style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                        Configure
                      </button>
                      <button className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all hover:bg-white/5"
                        style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      className="w-full py-1.5 rounded-lg text-[11px] font-bold transition-all"
                      style={{ background: g.color, color: '#fff' }}>
                      Connect {g.name}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Regional tax rates */}
        <div className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
          <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
            <FileText size={14} className="text-gray-500" /> Regional Tax Rates
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                  {['Region', 'Code', 'Type', 'Rate'].map(h => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TAX_RATES.map(t => (
                  <tr key={t.code} style={{ borderBottom: '1px solid rgba(239,68,68,0.05)' }}>
                    <td className="px-3 py-2.5 text-[12px] text-white">{t.region}</td>
                    <td className="px-3 py-2.5 text-[11px] font-mono text-gray-400">{t.code}</td>
                    <td className="px-3 py-2.5 text-[11px] uppercase text-gray-400 font-semibold">{t.type}</td>
                    <td className="px-3 py-2.5 text-[12px] font-bold text-white">{t.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}