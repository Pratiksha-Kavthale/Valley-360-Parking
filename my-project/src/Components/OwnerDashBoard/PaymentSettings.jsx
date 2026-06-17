import { useEffect, useState } from 'react';
import api from '/src/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../Footer/Footer';

const initialForm = {
  upiId: '',
  upiDisplayName: '',
  paymentEnabled: false,
};

const PaymentSettings = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/owner/payment-settings');
        setFormData({
          upiId: response.data?.upiId || '',
          upiDisplayName: response.data?.upiDisplayName || '',
          paymentEnabled: Boolean(response.data?.paymentEnabled),
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load payment settings.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await api.put('/owner/payment-settings', formData);
      setFormData({
        upiId: response.data?.upiId || '',
        upiDisplayName: response.data?.upiDisplayName || '',
        paymentEnabled: Boolean(response.data?.paymentEnabled),
      });
      toast.success('Payment settings saved successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save payment settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 text-slate-800 overflow-x-hidden">
      <ToastContainer position="top-center" />
      <section className="py-10 sm:py-16">
        <div className="container mx-auto max-w-3xl px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Owner Payments</p>
              <h1 className="text-3xl font-bold text-slate-900">UPI Payment Settings</h1>
              <p className="text-slate-600">Configure the UPI handle customers will pay to when booking your parking slots.</p>
            </div>

            {loading ? (
              <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-slate-600">Loading payment settings...</div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="upiId" className="block text-sm font-medium text-slate-700">UPI ID</label>
                  <input
                    id="upiId"
                    name="upiId"
                    type="text"
                    value={formData.upiId}
                    onChange={handleChange}
                    placeholder="name@bank"
                    className="mt-2 w-full rounded-xl border border-rose-200 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-rose-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="upiDisplayName" className="block text-sm font-medium text-slate-700">UPI Display Name</label>
                  <input
                    id="upiDisplayName"
                    name="upiDisplayName"
                    type="text"
                    value={formData.upiDisplayName}
                    onChange={handleChange}
                    placeholder="Parking Owner Name"
                    className="mt-2 w-full rounded-xl border border-rose-200 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-rose-400"
                    required
                  />
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                  <input
                    type="checkbox"
                    name="paymentEnabled"
                    checked={formData.paymentEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                  />
                  <span>
                    <span className="block font-semibold text-slate-900">Enable payments</span>
                    <span className="block text-sm text-slate-600">Allow customers to generate payment QR codes for your parking slots.</span>
                  </span>
                </label>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                  UPI handle should look like <span className="font-semibold">name@bank</span>. The backend will reject invalid handles.
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-rose-500 px-6 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default PaymentSettings;
