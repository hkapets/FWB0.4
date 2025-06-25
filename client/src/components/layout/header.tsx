import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Crown, Search, Wand2, TrendingUp } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { AudioControls } from "./audio-controls";
import { LanguageSwitcher } from "./language-switcher";
import AIAssistantModal from "@/components/ai/ai-assistant-modal";
import WorldAnalyticsModal from "@/components/analytics/world-analytics-modal";

interface HeaderProps {
  currentWorldId: number | null;
}

export default function Header({ currentWorldId }: HeaderProps) {
  const [location] = useLocation();
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  const worldId = currentWorldId || 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const performSearch = async (query: string) => {
    try {
      const response = await fetch(`/api/search/global?q=${encodeURIComponent(query)}&worldId=${worldId}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-purple-900/90 to-purple-800/90 backdrop-blur-sm border-b border-purple-600/50 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Logo and navigation */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:text-yellow-200 transition-colors">
            <Crown className="w-6 h-6 text-yellow-200" />
            <span className="text-xl font-fantasy text-yellow-200">
              Fantasy World Builder
            </span>
          </Link>
        </div>

        {/* Center - AI Tools and Search */}
        <div className="flex-1 flex items-center justify-center gap-4">
          {/* AI Tools (only show when not on dashboard) */}
          {location !== '/' && location !== '/create-world' && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIModal(true)}
                className="text-purple-200 hover:text-purple-100 hover:bg-purple-900/20"
              >
                <Wand2 className="w-4 h-4 mr-1" />
                AI Асистент
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalyticsModal(true)}
                className="text-purple-200 hover:text-purple-100 hover:bg-purple-900/20"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Аналітика
              </Button>
            </div>
          )}

          {/* Search */}
          <div className="max-w-md">
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Пошук по світу..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setIsSearchOpen(true)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2 bg-gray-900 border-gray-600">
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.slice(0, 8).map((result, index) => (
                      <div key={index} className="p-2 hover:bg-gray-800 rounded cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                          <span className="text-white font-medium">{result.name}</span>
                        </div>
                        {result.description && (
                          <p className="text-gray-400 text-sm mt-1 truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <p className="text-gray-400 text-sm p-2">Результатів не знайдено</p>
                ) : (
                  <p className="text-gray-400 text-sm p-2">Почніть вводити для пошуку</p>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Right side - Audio controls and settings */}
        <div className="flex items-center gap-2">
          <AudioControls />
          <LanguageSwitcher />
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        worldId={worldId}
      />

      {/* Analytics Modal */}
      <WorldAnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        worldId={worldId}
      />
    </header>
  );
}