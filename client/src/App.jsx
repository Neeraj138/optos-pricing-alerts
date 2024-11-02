import PriceAlertUI from "./components/PriceAlertUI";
import { ThemeProvider } from "./components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen p-8">
          <div className="max-w-md mx-auto">
            <PriceAlertUI />
          </div>
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
