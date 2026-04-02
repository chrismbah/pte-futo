import AppRoutes from "./routes";
import ErrorBoundary from "./pages/error/error-boundry/ErrorBoundary";
import { CustomToaster } from "./components/toast/CustomToaster";
import AppProvider from "./provider";
import { AIChatbot } from "./components/chatbot/AIChatbot";
import PWAInstallPrompt from "./components/pwa/PWAInstallPrompt";

export default function App() {
  return (
    <>
      <ErrorBoundary>
        <AppProvider>
          <AppRoutes />
          <CustomToaster />
          <AIChatbot />
          <PWAInstallPrompt />
        </AppProvider>
      </ErrorBoundary>
    </>
  );
}
