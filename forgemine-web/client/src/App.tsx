import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import TrackingPixels from "./components/TrackingPixels";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ReparacionBaldesPalas from "./pages/ReparacionBaldesPalas";
import BlindajeBaldes from "./pages/BlindajeBaldes";
import AdminDashboard from "./pages/AdminDashboard";
import CostParameters from "./pages/CostParameters";
import QuotationGenerator from "./pages/QuotationGenerator";
import QuotationsList from "./pages/QuotationsList";
import EditQuotation from "./pages/EditQuotation";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Promo from "./pages/Promo";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AdminBrandSettings from "./pages/AdminBrandSettings";
import AdminLogin from "./pages/AdminLogin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/reparacion-baldes-palas-hidraulicas"} component={ReparacionBaldesPalas} />
      <Route path={"/blindaje-baldes-mineros"} component={BlindajeBaldes} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogArticle} />
      <Route path={"/promo"} component={Promo} />
      <Route path={"/politica-de-privacidad"} component={PrivacyPolicy} />
      <Route path={"/terminos-de-servicio"} component={TermsOfService} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/login"} component={AdminLogin} />
      <Route path={"/admin/costos"} component={CostParameters} />
      <Route path={"/admin/parametros-costos"} component={CostParameters} />
      <Route path={"/admin/cotizaciones"} component={QuotationsList} />
      <Route path={"/admin/cotizaciones/nueva"} component={QuotationGenerator} />
      <Route path={"/admin/cotizaciones/editar/:id"} component={EditQuotation} />
      <Route path={"/admin/configuracion"} component={AdminBrandSettings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <TrackingPixels />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
