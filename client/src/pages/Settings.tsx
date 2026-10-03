import { Settings as SettingsIcon, Bell, Shield, User, Globe } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-slate-200 p-3 rounded-xl text-slate-700">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account and application preferences.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Profile Settings</h3>
            <p className="text-sm text-slate-500">Update your name, email, and avatar.</p>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100 flex items-center space-x-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full">
            <Bell size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            <p className="text-sm text-slate-500">Manage email alerts and AI generation updates.</p>
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Configure</button>
        </div>

        <div className="p-6 border-b border-slate-100 flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full">
            <Globe size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">Workspace Preferences</h3>
            <p className="text-sm text-slate-500">Set default language, timezone, and date formats.</p>
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Configure</button>
        </div>

        <div className="p-6 flex items-center space-x-4">
          <div className="bg-rose-50 text-rose-600 p-3 rounded-full">
            <Shield size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800">Security & API Keys</h3>
            <p className="text-sm text-slate-500">Manage Gemini API connections and security roles.</p>
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Configure</button>
        </div>
      </div>

      <div className="mt-8 text-center text-slate-400 text-sm">
        <p>This page is currently a placeholder for future settings functionality.</p>
      </div>
    </div>
  );
}
