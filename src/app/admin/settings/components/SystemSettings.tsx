"use client";

import { useState } from "react";
import Button from "@/components/Button";
import TextField from "@/components/Forms/TextField";
import CustomSelect from "@/components/Forms/CustomSelect";
import TextArea from "@/components/Forms/TextArea";
import {
  CogIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

/**
 * Component for managing system-wide settings
 */
export default function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: "Budget Before Broke Admin",
    supportEmail: "support@budgetbeforebroke.com",
    defaultPageSize: "50",
    sessionTimeout: "30",
    enableRegistration: true,
    enableEmailNotifications: true,
    maintenanceMode: false,
    maxFileUploadSize: "10",
    timeZone: "UTC",
    dateFormat: "MM/DD/YYYY",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    // This would typically save to a settings table or configuration file
    console.log("Saving settings:", settings);
    alert(
      "Settings saved successfully! (This is a demo - actual implementation would save to database)",
    );
  };

  const handleResetToDefaults = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all settings to their default values?",
    );
    if (confirmed) {
      setSettings({
        siteName: "Budget Before Broke Admin",
        supportEmail: "support@budgetbeforebroke.com",
        defaultPageSize: "50",
        sessionTimeout: "30",
        enableRegistration: true,
        enableEmailNotifications: true,
        maintenanceMode: false,
        maxFileUploadSize: "10",
        timeZone: "UTC",
        dateFormat: "MM/DD/YYYY",
      });
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* General Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CogIcon className="h-5 w-5" />
          General Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="Site Name"
            value={settings.siteName}
            onChange={(value) => handleSettingChange("siteName", value)}
            placeholder="Enter site name"
          />

          <TextField
            label="Support Email"
            type="email"
            value={settings.supportEmail}
            onChange={(value) => handleSettingChange("supportEmail", value)}
            placeholder="Enter support email"
          />

          <CustomSelect
            label="Default Page Size"
            options={[
              { value: "25", label: "25 items" },
              { value: "50", label: "50 items" },
              { value: "100", label: "100 items" },
            ]}
            value={settings.defaultPageSize}
            onChange={(value) => handleSettingChange("defaultPageSize", value)}
          />

          <TextField
            label="Session Timeout (days)"
            type="number"
            value={settings.sessionTimeout}
            onChange={(value) => handleSettingChange("sessionTimeout", value)}
            placeholder="30"
          />

          <CustomSelect
            label="Time Zone"
            options={[
              { value: "UTC", label: "UTC" },
              { value: "America/New_York", label: "Eastern Time" },
              { value: "America/Chicago", label: "Central Time" },
              { value: "America/Denver", label: "Mountain Time" },
              { value: "America/Los_Angeles", label: "Pacific Time" },
            ]}
            value={settings.timeZone}
            onChange={(value) => handleSettingChange("timeZone", value)}
          />

          <CustomSelect
            label="Date Format"
            options={[
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
            ]}
            value={settings.dateFormat}
            onChange={(value) => handleSettingChange("dateFormat", value)}
          />
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Feature Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              User Registration
            </label>
            <CustomSelect
              options={[
                { value: true, label: "Enabled" },
                { value: false, label: "Disabled" },
              ]}
              value={settings.enableRegistration}
              onChange={(value) =>
                handleSettingChange("enableRegistration", value)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Email Notifications
            </label>
            <CustomSelect
              options={[
                { value: true, label: "Enabled" },
                { value: false, label: "Disabled" },
              ]}
              value={settings.enableEmailNotifications}
              onChange={(value) =>
                handleSettingChange("enableEmailNotifications", value)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Maintenance Mode
            </label>
            <CustomSelect
              options={[
                { value: false, label: "Disabled" },
                { value: true, label: "Enabled" },
              ]}
              value={settings.maintenanceMode}
              onChange={(value) =>
                handleSettingChange("maintenanceMode", value)
              }
            />
            {settings.maintenanceMode && (
              <p className="text-sm text-yellow-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="h-4 w-4" />
                Site will be in maintenance mode for regular users
              </p>
            )}
          </div>

          <TextField
            label="Max File Upload Size (MB)"
            type="number"
            value={settings.maxFileUploadSize}
            onChange={(value) =>
              handleSettingChange("maxFileUploadSize", value)
            }
            placeholder="10"
          />
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5" />
          System Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700">
              Admin Panel Version
            </label>
            <p className="text-gray-900">1.0.0</p>
          </div>
          <div>
            <label className="block font-medium text-gray-700">
              Database Status
            </label>
            <p className="text-green-600 flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4" />
              Connected
            </p>
          </div>
          <div>
            <label className="block font-medium text-gray-700">
              Last Backup
            </label>
            <p className="text-gray-900">Never (Configure backups)</p>
          </div>
          <div>
            <label className="block font-medium text-gray-700">
              Total Users
            </label>
            <p className="text-gray-900">Loading...</p>
          </div>
          <div>
            <label className="block font-medium text-gray-700">
              Total Tables
            </label>
            <p className="text-gray-900">24</p>
          </div>
          <div>
            <label className="block font-medium text-gray-700">
              Server Uptime
            </label>
            <p className="text-gray-900">Unknown</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <Button
          onClick={handleSaveSettings}
          className="flex items-center gap-2"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Save Settings
        </Button>

        <Button onClick={handleResetToDefaults} variant="outline">
          Reset to Defaults
        </Button>

        <div className="flex-1"></div>

        <Button
          variant="destructive"
          onClick={() => alert("This would trigger a system cache clear")}
        >
          Clear System Cache
        </Button>
      </div>

      {/* Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Configuration Note
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                These settings control system-wide behavior. Some changes may
                require a server restart to take effect. Always test changes in
                a development environment first.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
