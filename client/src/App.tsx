import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Dashboard from "@/pages/dashboard";
import Locations from "@/pages/locations";
import Characters from "@/pages/characters";
import Creatures from "@/pages/creatures";
import WorldMap from "@/pages/world-map";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/locations" component={Locations} />
      <Route path="/characters" component={Characters} />
      <Route path="/creatures" component={Creatures} />
      <Route path="/world-map" component={WorldMap} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentWorldId, setCurrentWorldId] = useState<number | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800">
          <Header currentWorldId={currentWorldId} />
          <div className="flex h-screen pt-16">
            <Sidebar currentWorldId={currentWorldId} setCurrentWorldId={setCurrentWorldId} />
            <main className="flex-1 overflow-y-auto scroll-fantasy">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
