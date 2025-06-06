import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EMVReferencePage from "@/pages/EMVReferencePage";
import EMVSettingsPage from "@/pages/EMVSettingsPage";
import EMVHistoryPage from "@/pages/EMVHistoryPage";
import EMVBulkCalculationPage from "@/pages/EMVBulkCalculationPage";
import EMVChangeLogPage from "@/pages/EMVChangeLogPage";
import EMVInsightsPage from "@/pages/EMVInsightsPage";
import EMVBenchmarkPage from "@/pages/EMVBenchmarkPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reference" component={EMVReferencePage} />
      <Route path="/settings" component={EMVSettingsPage} />
      <Route path="/history" component={EMVHistoryPage} />
      <Route path="/bulk" component={EMVBulkCalculationPage} />
      <Route path="/changelog" component={EMVChangeLogPage} />
      <Route path="/insights" component={EMVInsightsPage} />
      <Route path="/benchmarks" component={EMVBenchmarkPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
