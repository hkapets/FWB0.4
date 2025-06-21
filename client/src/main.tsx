import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "virtual:uno.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.ts";
import { AudioProvider } from "./components/audio-provider.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import "./lib/i18n.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
