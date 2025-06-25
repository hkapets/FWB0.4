import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  MapPin, 
  Crown, 
  Sparkles, 
  ScrollText,
  BookOpen,
  Globe,
  Wand2,
  Scroll,
  Clock,
  FileText,
  Drama,
  Share2,
  Settings,
  Church,
  Shield,
  Package,
  StickyNote,
  Sword
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface SidebarSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: SidebarSection[];
}

export function ExpandableSidebar({ currentWorldId }: { currentWorldId: number | null }) {
  const t = useTranslation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    lore: true, // Start with lore expanded
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sidebarSections: SidebarSection[] = [
    {
      id: "lore",
      label: "Лор",
      icon: <BookOpen className="w-4 h-4" />,
      children: [
        {
          id: "geography",
          label: "Географія",
          icon: <Globe className="w-4 h-4" />,
          href: "/lore/geography"
        },
        {
          id: "bestiary",
          label: "Бестіарій",
          icon: <Crown className="w-4 h-4" />,
          href: "/lore/bestiary"
        },
        {
          id: "artifacts",
          label: "Артефакти",
          icon: <Sparkles className="w-4 h-4" />,
          href: "/lore/artifacts"
        },
        {
          id: "mythology",
          label: "Міфологія",
          icon: <Crown className="w-4 h-4" />,
          href: "/lore/mythology"
        },
        {
          id: "religion",
          label: "Релігія",
          icon: <Church className="w-4 h-4" />,
          href: "/lore/religion"
        },
        {
          id: "races",
          label: "Раси",
          icon: <Users className="w-4 h-4" />,
          href: "/lore/races"
        },
        {
          id: "magic",
          label: "Магія",
          icon: <Sparkles className="w-4 h-4" />,
          href: "/lore/magic"
        },
        {
          id: "writing",
          label: "Писемність і літочислення",
          icon: <Scroll className="w-4 h-4" />,
          href: "/lore/writing"
        },
        {
          id: "politics",
          label: "Політика",
          icon: <Shield className="w-4 h-4" />,
          href: "/lore/politics"
        },
        {
          id: "history",
          label: "Історія",
          icon: <ScrollText className="w-4 h-4" />,
          href: "/lore/history"
        }
      ]
    },
    {
      id: "characters",
      label: "Персонажі",
      icon: <Users className="w-4 h-4" />,
      href: "/characters"
    },
    {
      id: "world-map",
      label: "Карта світу",
      icon: <MapPin className="w-4 h-4" />,
      href: "/world-map"
    },
    {
      id: "timeline",
      label: "Хронологія",
      icon: <Clock className="w-4 h-4" />,
      href: "/timeline"
    },
    {
      id: "notes",
      label: "Нотатки",
      icon: <FileText className="w-4 h-4" />,
      href: "/notes"
    },
    {
      id: "scenarios",
      label: "Сценарії",
      icon: <Drama className="w-4 h-4" />,
      href: "/scenarios"
    },
    {
      id: "relations",
      label: "Зв'язки",
      icon: <Share2 className="w-4 h-4" />,
      href: "/relations"
    },
    {
      id: "settings",
      label: "Налаштування",
      icon: <Settings className="w-4 h-4" />,
      href: "/settings"
    }
  ];

  const renderSection = (section: SidebarSection, level = 0) => {
    const isExpanded = expandedSections[section.id];
    const hasChildren = section.children && section.children.length > 0;

    return (
      <div key={section.id} className="space-y-1">
        {hasChildren ? (
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal text-gray-300 hover:text-yellow-200 hover:bg-purple-800/50",
              level > 0 && "ml-4 text-sm"
            )}
            onClick={() => toggleSection(section.id)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {section.icon}
                <span>{section.label}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </Button>
        ) : (
          <Link href={section.href || "#"}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-left font-normal text-gray-300 hover:text-yellow-200 hover:bg-purple-800/50",
                level > 0 && "ml-4 text-sm"
              )}
            >
              <div className="flex items-center gap-2">
                {section.icon}
                <span>{section.label}</span>
              </div>
            </Button>
          </Link>
        )}

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {section.children!.map((child) => renderSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!currentWorldId) return null;

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-purple-900 border-r border-yellow-600/20 p-4 space-y-2">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-yellow-200 mb-2">Навігація</h2>
        <div className="h-px bg-gradient-to-r from-yellow-600/50 to-transparent"></div>
      </div>

      <div className="space-y-1">
        {sidebarSections.map((section) => renderSection(section))}
      </div>
    </div>
  );
}