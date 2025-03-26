import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/settings');
      if (response.data.status === 'success') {
        console.log('Fetched settings:', response.data.data);
        setSettings(response.data.data);
      } else {
        toast.error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('An error occurred while fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const handleSaveSettings = async (group) => {
    setSaving(true);
    setErrors({});

    try {
      const allSettingsResponse = await api.get('/admin/settings');
      
      if (allSettingsResponse.data.status !== 'success') {
        toast.error('Failed to fetch settings for update');
        setSaving(false);
        return;
      }
      
      const currentSettings = settings;
      
      const settingsToUpdate = {};
      
      const settingGroups = {
        general: ['store_name', 'store_email', 'store_phone', 'store_address', 'currency_symbol', 'default_language', 'time_zone'],
        payment: ['payment_cash_on_delivery', 'payment_bank_transfer', 'payment_flutterwave', 'payment_paystack', 'tax_rate', 'bank_account_number', 'bank_name', 'bank_account_name'],
        appearance: ['primary_color', 'secondary_color', 'accent_color', 'dark_mode', 'touch_slider_sensitivity'],
        notification: ['order_confirmation_emails', 'order_status_update_emails', 'low_stock_alerts', 'newsletter_subscription_notifications', 'marketing_emails', 'sms_notifications', 'order_confirmation_sms', 'order_status_update_sms', 'low_stock_sms_alerts', 'admin_phone', 'promotional_sms']
      };
      
      const groupKeys = settingGroups[group] || [];
      
      groupKeys.forEach(key => {
        if (currentSettings[key] !== undefined) {
          settingsToUpdate[key] = currentSettings[key];
        }
      });
      
      if (Object.keys(settingsToUpdate).length === 0) {
        toast.warning('No settings to update in this group');
        setSaving(false);
        return;
      }
      
      console.log('Sending settings update:', { settings: settingsToUpdate });
      
      const response = await api.put('/admin/settings', {
        settings: settingsToUpdate
      });

      if (response.data.status === 'success') {
        toast.success(`${capitalizeFirstLetter(group)} settings updated successfully`);
        fetchSettings();
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      if (error.response && error.response.data) {
        console.log('Error response:', error.response.data);
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        }
        toast.error(error.response.data.message || 'An error occurred while updating settings');
      } else {
        toast.error('An error occurred while updating settings');
      }
    } finally {
      setSaving(false);
    }
  };

  const isSpecialGroup = (key) => {
    return false;
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Store Settings</h1>

      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'general'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'payment'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('payment')}
            >
              Payment
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'appearance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('appearance')}
            >
              Appearance
            </button>
          </li>
          <li>
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'notification'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('notification')}
            >
              Notifications
            </button>
          </li>
        </ul>
      </div>

      {activeTab === 'general' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Store Name
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={settings.store_name || ''}
                onChange={(e) => handleInputChange('store_name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Store Email
              </label>
              <input
                type="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={settings.store_email || ''}
                onChange={(e) => handleInputChange('store_email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Store Phone
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={settings.store_phone || ''}
                onChange={(e) => handleInputChange('store_phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Store Address
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={settings.store_address || ''}
                onChange={(e) => handleInputChange('store_address', e.target.value)}
                rows="2"
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Currency Symbol
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={settings.currency_symbol || ''}
                onChange={(e) => handleInputChange('currency_symbol', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Default Language
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={settings.default_language || 'English'}
                onChange={(e) => handleInputChange('default_language', e.target.value)}
              >
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Time Zone
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={settings.time_zone || 'Africa/Lagos'}
                onChange={(e) => handleInputChange('time_zone', e.target.value)}
              >
                <option value="Africa/Lagos">Africa/Lagos</option>
                <option value="Africa/Accra">Africa/Accra</option>
                <option value="Africa/Nairobi">Africa/Nairobi</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              onClick={() => handleSaveSettings('general')}
              disabled={saving}
            >
              {saving && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Save General Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={settings.tax_rate || ''}
                onChange={(e) => handleInputChange('tax_rate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Bank Name
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={settings.bank_name || ''}
                onChange={(e) => handleInputChange('bank_name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Bank Account Number
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={settings.bank_account_number || ''}
                onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Bank Account Name
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={settings.bank_account_name || ''}
                onChange={(e) => handleInputChange('bank_account_name', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-3">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="payment_cash_on_delivery"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.payment_cash_on_delivery === 'true'}
                  onChange={(e) => handleInputChange('payment_cash_on_delivery', e.target.checked ? 'true' : 'false')}
                />
                <label htmlFor="payment_cash_on_delivery" className="ml-2 block text-sm text-gray-900">
                  Cash on Delivery
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="payment_bank_transfer"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.payment_bank_transfer === 'true'}
                  onChange={(e) => handleInputChange('payment_bank_transfer', e.target.checked ? 'true' : 'false')}
                />
                <label htmlFor="payment_bank_transfer" className="ml-2 block text-sm text-gray-900">
                  Bank Transfer
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="payment_flutterwave"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.payment_flutterwave === 'true'}
                  onChange={(e) => handleInputChange('payment_flutterwave', e.target.checked ? 'true' : 'false')}
                />
                <label htmlFor="payment_flutterwave" className="ml-2 block text-sm text-gray-900">
                  Flutterwave
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="payment_paystack"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.payment_paystack === 'true'}
                  onChange={(e) => handleInputChange('payment_paystack', e.target.checked ? 'true' : 'false')}
                />
                <label htmlFor="payment_paystack" className="ml-2 block text-sm text-gray-900">
                  Paystack
                </label>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              onClick={() => handleSaveSettings('payment')}
              disabled={saving}
            >
              {saving && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Save Payment Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Primary Color
              </label>
              <div className="flex">
                <input
                  type="color"
                  className="h-10 w-10 border rounded mr-2"
                  value={settings.primary_color || '#0066b2'}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                />
                <input
                  type="text"
                  className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={settings.primary_color || '#0066b2'}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Secondary Color
              </label>
              <div className="flex">
                <input
                  type="color"
                  className="h-10 w-10 border rounded mr-2"
                  value={settings.secondary_color || '#ff6600'}
                  onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                />
                <input
                  type="text"
                  className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={settings.secondary_color || '#ff6600'}
                  onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Accent Color
              </label>
              <div className="flex">
                <input
                  type="color"
                  className="h-10 w-10 border rounded mr-2"
                  value={settings.accent_color || '#00cc66'}
                  onChange={(e) => handleInputChange('accent_color', e.target.value)}
                />
                <input
                  type="text"
                  className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={settings.accent_color || '#00cc66'}
                  onChange={(e) => handleInputChange('accent_color', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Slider Sensitivity
              </label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                value={settings.touch_slider_sensitivity || '80'}
                onChange={(e) => handleInputChange('touch_slider_sensitivity', e.target.value)}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <input
                id="dark_mode"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.dark_mode === 'true'}
                onChange={(e) => handleInputChange('dark_mode', e.target.checked ? 'true' : 'false')}
              />
              <label htmlFor="dark_mode" className="ml-2 block text-sm text-gray-900">
                Enable Dark Mode
              </label>
            </div>
          </div>
          <div className="mt-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              onClick={() => handleSaveSettings('appearance')}
              disabled={saving}
            >
              {saving && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Save Appearance Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notification' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-3">Email Notifications</h3>
            <div className="flex items-center">
              <input
                id="order_confirmation_emails"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.order_confirmation_emails === 'true'}
                onChange={(e) => handleInputChange('order_confirmation_emails', e.target.checked ? 'true' : 'false')}
              />
              <label htmlFor="order_confirmation_emails" className="ml-2 block text-sm text-gray-900">
                Send Order Confirmation Emails
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="order_status_update_emails"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.order_status_update_emails === 'true'}
                onChange={(e) => handleInputChange('order_status_update_emails', e.target.checked ? 'true' : 'false')}
              />
              <label htmlFor="order_status_update_emails" className="ml-2 block text-sm text-gray-900">
                Send Order Status Update Emails
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="low_stock_alerts"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.low_stock_alerts === 'true'}
                onChange={(e) => handleInputChange('low_stock_alerts', e.target.checked ? 'true' : 'false')}
              />
              <label htmlFor="low_stock_alerts" className="ml-2 block text-sm text-gray-900">
                Enable Low Stock Email Alerts
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="newsletter_subscription_notifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.newsletter_subscription_notifications === 'true'}
                onChange={(e) => handleInputChange('newsletter_subscription_notifications', e.target.checked ? 'true' : 'false')}
              />
              <label htmlFor="newsletter_subscription_notifications" className="ml-2 block text-sm text-gray-900">
                Newsletter Subscription Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="marketing_emails"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.marketing_emails === 'true'}
                onChange={(e) => handleInputChange('marketing_emails', e.target.checked ? 'true' : 'false')}
              />
              <label htmlFor="marketing_emails" className="ml-2 block text-sm text-gray-900">
                Send Marketing Emails
              </label>
            </div>

            <h3 className="text-lg font-medium mb-3 mt-6">SMS Notifications (Termii)</h3>
            <div className={`mt-6 ${activeTab === 'notification' ? 'block' : 'hidden'}`}>
              <h3 className="text-lg font-semibold mb-4">SMS Notification Settings</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>SMS Service Setup in Progress:</strong> The SMS functionality is currently in setup mode and awaiting approval from Termii. SMS features will be fully available once the account is approved.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  id="sms_notifications"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.sms_notifications === 'true'}
                  onChange={(e) => handleInputChange('sms_notifications', e.target.checked ? 'true' : 'false')}
                />
                <label htmlFor="sms_notifications" className="ml-2 block text-sm text-gray-900">
                  Enable SMS Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="order_confirmation_sms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.order_confirmation_sms === 'true'}
                  onChange={(e) => handleInputChange('order_confirmation_sms', e.target.checked ? 'true' : 'false')}
                  disabled={settings.sms_notifications !== 'true'}
                />
                <label htmlFor="order_confirmation_sms" className={`ml-2 block text-sm ${settings.sms_notifications === 'true' ? 'text-gray-900' : 'text-gray-400'}`}>
                  Send Order Confirmation SMS
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="order_status_update_sms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.order_status_update_sms === 'true'}
                  onChange={(e) => handleInputChange('order_status_update_sms', e.target.checked ? 'true' : 'false')}
                  disabled={settings.sms_notifications !== 'true'}
                />
                <label htmlFor="order_status_update_sms" className={`ml-2 block text-sm ${settings.sms_notifications === 'true' ? 'text-gray-900' : 'text-gray-400'}`}>
                  Send Order Status Update SMS
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="low_stock_sms_alerts"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.low_stock_sms_alerts === 'true'}
                  onChange={(e) => handleInputChange('low_stock_sms_alerts', e.target.checked ? 'true' : 'false')}
                  disabled={settings.sms_notifications !== 'true'}
                />
                <label htmlFor="low_stock_sms_alerts" className={`ml-2 block text-sm ${settings.sms_notifications === 'true' ? 'text-gray-900' : 'text-gray-400'}`}>
                  Enable Low Stock SMS Alerts
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="promotional_sms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.promotional_sms === 'true'}
                  onChange={(e) => handleInputChange('promotional_sms', e.target.checked ? 'true' : 'false')}
                  disabled={settings.sms_notifications !== 'true'}
                />
                <label htmlFor="promotional_sms" className={`ml-2 block text-sm ${settings.sms_notifications === 'true' ? 'text-gray-900' : 'text-gray-400'}`}>
                  Enable Promotional SMS (coupons, offers, etc.)
                </label>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Admin Phone Number (for alerts)
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={settings.admin_phone || ''}
                  onChange={(e) => handleInputChange('admin_phone', e.target.value)}
                  placeholder="e.g., 08012345678"
                />
                <p className="text-xs text-gray-500 mt-1">Phone number to receive low stock alerts and other admin notifications</p>
              </div>

            </div>
          </div>
          <div className="mt-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              onClick={() => handleSaveSettings('notification')}
              disabled={saving}
            >
              {saving && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Save Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
