import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Search } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import CreateRaceModal from "@/components/modals/create-race-modal";

interface RacesPageProps {
  currentWorldId?: number | null;
}

export default function RacesPage({ currentWorldId }: RacesPageProps) {
  const t = useTranslation();
  const [isCreateRaceModalOpen, setIsCreateRaceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: races = [], refetch: refetchRaces } = useQuery<any[]>({
    queryKey: ["/api/worlds", currentWorldId, "races"],
    enabled: !!currentWorldId,
  });

  const filteredRaces = races.filter(
    (race) =>
      race.name?.uk?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.name?.en?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fantasy font-bold text-fantasy-gold-400 flex items-center">
            <Users className="mr-3 h-8 w-8" />
            Раси
          </h1>
          <p className="text-gray-400 mt-1">
            Створюйте та керуйте расами вашого світу
          </p>
        </div>
        <Button
          onClick={() => setIsCreateRaceModalOpen(true)}
          className="fantasy-button"
          disabled={!currentWorldId}
        >
          <Plus className="mr-2 h-4 w-4" />
          Додати расу
        </Button>
      </div>

      {/* Пошук */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Пошук рас..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 fantasy-input"
        />
      </div>

      {/* Список рас */}
      {filteredRaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaces.map((race) => (
            <Card
              key={race.id}
              className="fantasy-border bg-black/20 backdrop-blur-sm fantasy-card-hover"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-fantasy-purple-300">
                    {race.name?.uk || race.name?.en || "Без назви"}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {race.population || "Невідомо"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {race.description?.uk ||
                    race.description?.en ||
                    "Опис відсутній"}
                </p>
                <div className="space-y-2">
                  {race.characteristics && (
                    <div>
                      <span className="text-xs text-gray-500">
                        Особливості:
                      </span>
                      <p className="text-sm text-gray-300">
                        {race.characteristics}
                      </p>
                    </div>
                  )}
                  {race.origin && (
                    <div>
                      <span className="text-xs text-gray-500">Походження:</span>
                      <p className="text-sm text-gray-300">{race.origin}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            {searchQuery ? "Раси не знайдено" : "Поки що немає рас"}
          </h3>
          <p className="text-gray-400 mb-4">
            {searchQuery
              ? "Спробуйте змінити пошуковий запит"
              : "Створіть першу расу для вашого світу"}
          </p>
          {!searchQuery && currentWorldId && (
            <Button
              onClick={() => setIsCreateRaceModalOpen(true)}
              className="fantasy-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Додати першу расу
            </Button>
          )}
        </div>
      )}

      {/* Модалка створення раси */}
      <CreateRaceModal
        isOpen={isCreateRaceModalOpen}
        onClose={() => setIsCreateRaceModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await fetch(`/api/worlds/${currentWorldId}/races`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            refetchRaces();
            setIsCreateRaceModalOpen(false);
          } catch (error) {
            console.error("Error creating race:", error);
          }
        }}
      />
    </div>
  );
}
