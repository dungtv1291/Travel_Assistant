import { useState, useEffect, useCallback } from 'react';
import { Settings, Plus, Save, X, Edit3, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime, truncate } from '@/utils';
import { 
  appSettingsService, 
  updateSettingValue, 
  createSetting,
  KNOWN_SETTING_KEYS
} from '@/services/app-settings.service';
import type { AppSetting, PaginatedResponse } from '@/types';

interface EditingRow {
  id: number;
  value: string;
}

interface NewSetting {
  setting_key: string;
  setting_value: string;
  description: string;
}

export function SettingsPage() {
  const [data, setData] = useState<PaginatedResponse<AppSetting>>({ items: [], total: 0, page: 1, limit: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSetting, setNewSetting] = useState<NewSetting>({
    setting_key: '',
    setting_value: '',
    description: ''
  });

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await appSettingsService.list({ limit: 100 }); // Most apps won't have many settings
      setData(result);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle starting inline edit
  const handleEdit = (setting: AppSetting) => {
    setEditingRow({
      id: setting.id,
      value: setting.setting_value ?? ''
    });
  };

  // Handle saving inline edit
  const handleSave = async (settingId: number) => {
    if (!editingRow || editingRow.id !== settingId) return;

    try {
      setSavingId(settingId);
      const updatedSetting = await updateSettingValue(settingId, editingRow.value || null);
      
      // Update the local data
      setData(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === settingId ? updatedSetting : item
        )
      }));
      
      setEditingRow(null);
    } catch (err) {
      console.error('Failed to save setting:', err);
      setError('Failed to save setting. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  // Handle canceling inline edit
  const handleCancel = () => {
    setEditingRow(null);
  };

  // Handle creating new setting
  const handleCreateSetting = async () => {
    if (!newSetting.setting_key.trim() || !newSetting.setting_value.trim()) {
      setError('Key and value are required.');
      return;
    }

    try {
      const created = await createSetting({
        setting_key: newSetting.setting_key.trim(),
        setting_value: newSetting.setting_value.trim(),
        description: newSetting.description.trim() || undefined
      });

      // Add to local data
      setData(prev => ({
        ...prev,
        items: [...prev.items, created],
        total: prev.total + 1
      }));

      // Reset form
      setNewSetting({ setting_key: '', setting_value: '', description: '' });
      setShowNewForm(false);
      setError(null);
    } catch (err) {
      console.error('Failed to create setting:', err);
      setError('Failed to create setting. Please check if the key already exists.');
    }
  };

  // Handle deleting setting
  const handleDelete = async (settingId: number) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;

    try {
      await appSettingsService.delete(settingId);
      
      // Remove from local data
      setData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== settingId),
        total: prev.total - 1
      }));
    } catch (err) {
      console.error('Failed to delete setting:', err);
      setError('Failed to delete setting. Please try again.');
    }
  };

  const columns: Column<AppSetting>[] = [
    {
      key: 'setting_key',
      header: 'Key',
      width: '200px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <code className="text-xs font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
            {row.setting_key}
          </code>
          {KNOWN_SETTING_KEYS.includes(row.setting_key as any) && (
            <Badge variant="info" className="text-xs">Known</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'setting_value',
      header: 'Value',
      render: (row) => {
        const isEditing = editingRow?.id === row.id;
        const isSaving = savingId === row.id;
        
        if (isEditing) {
          return (
            <div className="flex items-center gap-2">
              <Input
                value={editingRow.value}
                onChange={(e) => setEditingRow(prev => prev ? { ...prev, value: e.target.value } : null)}
                className="flex-1"
                disabled={isSaving}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSave(row.id)}
                disabled={isSaving}
                className="px-2"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-between group">
            <span className="text-sm text-slate-800 font-mono">
              {row.setting_value ?? <span className="text-slate-400 italic">null</span>}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row)}
              className="px-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="text-sm text-slate-600">
          {row.description ? truncate(row.description, 60) : <span className="italic">No description</span>}
        </span>
      ),
    },
    {
      key: 'updated_at',
      header: 'Last updated',
      width: '150px',
      render: (row) => <span className="text-sm text-slate-500">{formatDateTime(row.updated_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(row.id)}
          className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="App Settings"
        subtitle="Key-value configuration for app meta information"
        actions={
          <Button 
            size="sm" 
            onClick={() => setShowNewForm(!showNewForm)}
            disabled={showNewForm}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Setting
          </Button>
        }
      />

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => setError(null)}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* New Setting Form */}
      {showNewForm && (
        <div className="p-4 border rounded-lg bg-slate-50">
          <h3 className="font-medium mb-4">Add New Setting</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Key</label>
              <Select
                value={newSetting.setting_key}
                onChange={(e) => setNewSetting(prev => ({ ...prev, setting_key: e.target.value }))}
              >
                <option value="">Select or type custom key</option>
                {KNOWN_SETTING_KEYS.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </Select>
              <Input
                placeholder="Or enter custom key"
                value={newSetting.setting_key}
                onChange={(e) => setNewSetting(prev => ({ ...prev, setting_key: e.target.value }))}
                className="mt-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
              <Input
                placeholder="Setting value"
                value={newSetting.setting_value}
                onChange={(e) => setNewSetting(prev => ({ ...prev, setting_value: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <Input
                placeholder="Optional description"
                value={newSetting.description}
                onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreateSetting}>
              Create Setting
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => {
                setShowNewForm(false);
                setNewSetting({ setting_key: '', setting_value: '', description: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Settings Table */}
      {data.items.length === 0 && !loading ? (
        <EmptyState
          icon={Settings}
          title="No settings configured"
          description="Add your first app setting using the button above."
        />
      ) : (
        <Table
          columns={columns}
          data={data.items}
          rowKey={(r) => r.id}
          loading={loading}
          emptyMessage="No settings found."
        />
      )}
    </div>
  );
}
