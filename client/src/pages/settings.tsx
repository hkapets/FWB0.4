import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Volume2,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveMinutes, setAutoSaveMinutes] = useState(5);

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your world data is being prepared for download.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import Feature",
      description: "Data import functionality coming soon.",
    });
  };

  const handleResetData = () => {
    toast({
      title: "Reset Confirmation",
      description: "This action would permanently delete all world data.",
      variant: "destructive",
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-fantasy font-bold text-yellow-200 mb-2 flex items-center">
            <SettingsIcon className="mr-3" />
            Settings
          </h1>
          <p className="text-lg text-gray-300">
            Customize your Fantasy World Builder experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card className="fantasy-border">
            <CardHeader>
              <CardTitle className="text-yellow-200 font-fantasy">Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-gray-400">Use dark theme for the interface</p>
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Fantasy Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-600 cursor-pointer">
                    <div className="w-full h-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded mb-2"></div>
                    <p className="text-xs text-center">Purple (Active)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-900/30 border border-green-600 cursor-pointer opacity-50">
                    <div className="w-full h-4 bg-gradient-to-r from-green-600 to-green-800 rounded mb-2"></div>
                    <p className="text-xs text-center">Forest</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-600 cursor-pointer opacity-50">
                    <div className="w-full h-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded mb-2"></div>
                    <p className="text-xs text-center">Ocean</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio & Notifications */}
          <Card className="fantasy-border">
            <CardHeader>
              <CardTitle className="text-yellow-200 font-fantasy">Audio & Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-4 w-4" />
                  <div>
                    <Label>Sound Effects</Label>
                    <p className="text-sm text-gray-400">Enable UI sound effects</p>
                  </div>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-4 w-4" />
                  <div>
                    <Label>Notifications</Label>
                    <p className="text-sm text-gray-400">Show system notifications</p>
                  </div>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Auto-Save Settings */}
          <Card className="fantasy-border">
            <CardHeader>
              <CardTitle className="text-yellow-200 font-fantasy">Auto-Save</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Auto-Save</Label>
                  <p className="text-sm text-gray-400">Automatically save your work</p>
                </div>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>

              {autoSave && (
                <div className="space-y-2">
                  <Label htmlFor="autosave-interval">Save Interval (minutes)</Label>
                  <Input
                    id="autosave-interval"
                    type="number"
                    min="1"
                    max="60"
                    value={autoSaveMinutes}
                    onChange={(e) => setAutoSaveMinutes(parseInt(e.target.value) || 5)}
                    className="fantasy-input"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="fantasy-border">
            <CardHeader>
              <CardTitle className="text-yellow-200 font-fantasy">Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full fantasy-button"
                onClick={handleExportData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export All Worlds
              </Button>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleImportData}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Worlds
              </Button>

              <Separator />

              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleResetData}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Reset All Data
              </Button>
              <p className="text-xs text-gray-500">
                This will permanently delete all your worlds, characters, and locations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Save Settings */}
        <div className="mt-8 flex justify-end">
          <Button 
            className="fantasy-button px-8 py-3"
            onClick={handleSaveSettings}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>

        {/* About Section */}
        <Card className="fantasy-border mt-6">
          <CardHeader>
            <CardTitle className="text-yellow-200 font-fantasy">About Fantasy World Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-yellow-300 mb-2">Version Information</h3>
                <p className="text-sm text-gray-400">Version 1.0.0</p>
                <p className="text-sm text-gray-400">Built with React & Express</p>
                <p className="text-sm text-gray-400">Last Updated: December 2024</p>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-300 mb-2">Features</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• World Creation & Management</li>
                  <li>• Character & Location System</li>
                  <li>• Creature Database</li>
                  <li>• Interactive World Map</li>
                  <li>• Data Export & Import</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
