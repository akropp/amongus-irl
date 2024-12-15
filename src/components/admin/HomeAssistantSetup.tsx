import React, { useState } from 'react';
import { Key, CheckCircle2 } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';

export default function HomeAssistantSetup() {
  const { haToken, setHaToken, isConnected, connectToHA } = useAdminStore();
  const [showToken, setShowToken] = useState(false);

  const handleConnect = () => {
    if (haToken) {
      connectToHA(haToken);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Key className="w-6 h-6" />
        Home Assistant Connection
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Home Assistant Token
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showToken ? 'text' : 'password'}
                value={haToken}
                onChange={(e) => setHaToken(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 rounded-md"
                placeholder="Enter your Home Assistant token"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              onClick={handleConnect}
              disabled={!haToken}
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Connect
            </button>
          </div>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span>Connected to Home Assistant</span>
          </div>
        )}
      </div>
    </div>
  );
}