'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Save } from 'lucide-react';
import api from '@/lib/api';
import type { Client } from '@/types';

export default function ChatPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setNotes(client.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!selectedClient) return;

    setSaving(true);
    try {
      await api.put(`/clients/${selectedClient.id}`, { notes });
      alert('Notes saved successfully!');
      fetchClients();
    } catch (err) {
      console.error('Failed to save notes:', err);
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Client Notes</h1>
        <p className="text-gray-400">Manage notes and communications for each client</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-1">
          <div className="glass-effect rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Clients</h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : clients.length > 0 ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedClient?.id === client.id
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-purple-500/30'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                        <MessageSquare size={20} className="text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{client.name}</p>
                        <p className="text-xs text-gray-400 truncate">{client.phone}</p>
                        {client.notes && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {client.notes.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="mx-auto mb-3" size={40} />
                <p>No clients available</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes Editor */}
        <div className="lg:col-span-2">
          <div className="glass-effect rounded-xl p-6">
            {selectedClient ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                    <p className="text-gray-400">{selectedClient.phone} • {selectedClient.location}</p>
                  </div>
                  <button
                    onClick={handleSaveNotes}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes & Communications
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={15}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white resize-none"
                    placeholder="Add notes about this client, communication history, preferences, etc..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    These notes are private and only visible to you
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] text-gray-400">
                <MessageSquare size={64} className="mb-4 text-gray-600" />
                <p className="text-lg">Select a client to view or edit notes</p>
                <p className="text-sm text-gray-500 mt-2">
                  Keep track of important information about your clients
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
