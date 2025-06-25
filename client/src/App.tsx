import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Dashboard from "@/pages/dashboard";
import CreateWorld from "@/pages/create-world";
import Characters from "@/pages/characters";
import Lore from "@/pages/lore";
import WorldMap from "@/pages/world-map";
import Relations from "@/pages/relations";
import Timeline from "@/pages/timeline";
import Notes from "@/pages/notes";
import Scenarios from "@/pages/scenarios";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { ExpandableSidebar } from "@/components/layout/expandable-sidebar";
// Підрозділи лору
import Geography from "@/pages/lore/geography";
import Bestiary from "@/pages/lore/bestiary";
import Magic from "@/pages/lore/magic";
import Artifacts from "@/pages/lore/artifacts";
import Events from "@/pages/lore/events";
import Races from "@/pages/lore/races";
import Writing from "@/pages/lore/writing";
import Politics from "@/pages/lore/politics";
import History from "@/pages/lore/history";
import Mythology from "@/pages/lore/mythology";
import Religion from "@/pages/lore/religion";
import { AudioProvider } from "@/components/audio-provider";


function App() {
  const [currentWorldId, setCurrentWorldId] = useState<number | null>(null);

  return (
    <AudioProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800">
            <Header currentWorldId={currentWorldId} />
            <div className="flex h-screen pt-16">
              {currentWorldId !== null && (
                <ExpandableSidebar currentWorldId={currentWorldId} />
              )}
              <main
                className={`overflow-y-auto scroll-fantasy ${
                  currentWorldId !== null ? "flex-1" : "w-full"
                }`}
              >
                <Switch>
                  <Route
                    path="/"
                    component={() => (
                      <Dashboard
                        currentWorldId={currentWorldId}
                        setCurrentWorldId={setCurrentWorldId}
                        trackAction={trackAction}
                      />
                    )}
                  />
                  <Route
                    path="/dashboard"
                    component={() => (
                      <Dashboard
                        currentWorldId={currentWorldId}
                        setCurrentWorldId={setCurrentWorldId}
                      />
                    )}
                  />
                  <Route path="/create-world" component={CreateWorld} />
                  <Route path="/characters" component={Characters} />
                  <Route path="/lore" component={Lore} />
                  <Route path="/lore/geography" component={Geography} />
                  <Route path="/lore/bestiary" component={Bestiary} />
                  <Route path="/lore/magic" component={Magic} />
                  <Route path="/lore/artifacts" component={Artifacts} />
                  <Route path="/lore/events" component={Events} />
                  <Route
                    path="/lore/races"
                    component={() => <Races currentWorldId={currentWorldId} />}
                  />
                  <Route
                    path="/lore/writing"
                    component={() => (
                      <Writing currentWorldId={currentWorldId} />
                    )}
                  />
                  <Route
                    path="/lore/politics"
                    component={() => (
                      <Politics currentWorldId={currentWorldId} />
                    )}
                  />
                  <Route
                    path="/lore/history"
                    component={() => (
                      <History currentWorldId={currentWorldId} />
                    )}
                  />
                  <Route path="/lore/mythology" component={Mythology} />
                  <Route path="/lore/religion" component={Religion} />
                  <Route
                    path="/world-map"
                    component={() => (
                      <WorldMap currentWorldId={currentWorldId} />
                    )}
                  />
                  <Route path="/relations" component={Relations} />
                  <Route path="/timeline" component={Timeline} />
                  <Route path="/notes" component={Notes} />
                  <Route path="/scenarios" component={Scenarios} />
                  <Route path="/settings" component={Settings} />
                  <Route component={NotFound} />
                </Switch>
              </main>
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AudioProvider>
  );
}

export default App;
