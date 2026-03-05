import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Shield, 
  CheckCircle, 
  Phone, 
  ArrowRight,
  Layers,
  Target,
  Zap
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { trackConversion } from "@/lib/tracking";
import { useEffect } from "react";

export default function BlindajeBaldes() {
  useEffect(() => {
    trackConversion({
      event_name: 'service_page_view',
      event_category: 'services',
      event_label: 'blindaje_baldes',
    });
  }, []);

  const componentes = [
    {
      nombre: "Flejes de Piso Interior",
      descripcion: "Planchas de acero 450 Brinell para protección del piso del balde. Espesor 20-25mm según aplicación.",
      especificacion: "12 piezas estándar para PC7000",
      icono: Layers,
    },
    {
      nombre: "Flejes Laterales",
      descripcion: "Blindaje lateral con acero de alta dureza para proteger las paredes del balde contra abrasión.",
      especificacion: "8 piezas estándar para PC7000",
      icono: Shield,
    },
    {
      nombre: "Wear Buttons (Laminite)",
      descripcion: "Botones de desgaste de 90mm y 40mm de diámetro. Protección puntual en zonas de alto impacto.",
      especificacion: "24 unidades 90mm + 36 unidades 40mm",
      icono: Target,
    },
    {
      nombre: "Heel Shrouds",
      descripcion: "Protectores de esquinas en acero 500 Brinell. Protección crítica para las esquinas inferiores del balde.",
      especificacion: "4 unidades por balde",
      icono: Zap,
    },
  ];

  const beneficios = [
    "Extensión de vida útil del balde hasta 40%",
    "Reducción de tiempos de parada no programada",
    "Mayor disponibilidad operacional de la flota",
    "Disminución de costos de mantención a largo plazo",
    "Protección contra abrasión y alto impacto",
    "Materiales certificados de alta dureza",
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <SEOHead
        title="Blindaje de Baldes Mineros | Flejes 450 Brinell"
        description="Blindaje de baldes mineros con flejes 450 Brinell, Wear Buttons Laminite y Heel Shrouds. Kit Heavy Duty para PC7000 y PC5500. Servicio en Chile."
        url="/blindaje-baldes-mineros"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-10 w-72 h-72 bg-amber-500 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-600 rounded-full filter blur-[120px]" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20">
              Protección Heavy Duty
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-oswald">
              BLINDAJE DE{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                BALDES MINEROS
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Instalación de blindaje heavy duty para baldes mineros en Chile. 
              Flejes de acero 450-500 Brinell, wear buttons Laminite y heel shrouds. 
              Maximice la <strong>vida útil</strong> de sus componentes y garantice la <strong>continuidad operacional</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold">
                <Phone className="mr-2 h-5 w-5" />
                Cotizar Blindaje
              </Button>
              <Button size="lg" variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                Descargar Especificaciones
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Componentes de Blindaje */}
      <section className="py-16 bg-gray-900/50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-oswald">
            COMPONENTES DE <span className="text-amber-500">BLINDAJE</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Kit completo de blindaje heavy duty según boletines PSG 25-003 y PSG 25-004 para baldes PC7000
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {componentes.map((comp, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-amber-500/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <comp.icono className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{comp.nombre}</h3>
                      <p className="text-gray-400 mb-3">{comp.descripcion}</p>
                      <span className="inline-block px-3 py-1 text-sm text-amber-400 bg-amber-500/10 rounded-full">
                        {comp.especificacion}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Especificaciones Técnicas */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-oswald">
                ESPECIFICACIONES <span className="text-amber-500">TÉCNICAS</span>
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">Material de Flejes</h4>
                  <p className="text-gray-400">Acero de alta dureza 450-500 Brinell (HB400/HB500). Resistencia a la abrasión y alto impacto.</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">Wear Buttons</h4>
                  <p className="text-gray-400">Laminite de carburo de tungsteno. Diámetros 90mm y 40mm. Dureza superior a 60 HRC.</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">Proceso de Instalación</h4>
                  <p className="text-gray-400">Soldadura certificada AWS D1.1. Precalentamiento según Tabla 7 del manual AH08507D. Ensayos no destructivos post-soldadura.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold mb-6 font-oswald text-center">
                KIT BLINDAJE <span className="text-amber-500">PC7000 HD</span>
              </h3>
              <table className="w-full">
                <tbody className="divide-y divide-gray-700">
                  <tr>
                    <td className="py-3 text-gray-400">Flejes piso interior</td>
                    <td className="py-3 text-white text-right font-semibold">12 piezas</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-400">Flejes laterales</td>
                    <td className="py-3 text-white text-right font-semibold">8 piezas</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-400">Wear Buttons 90mm</td>
                    <td className="py-3 text-white text-right font-semibold">24 unidades</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-400">Wear Buttons 40mm</td>
                    <td className="py-3 text-white text-right font-semibold">36 unidades</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-400">Heel Shrouds</td>
                    <td className="py-3 text-white text-right font-semibold">4 unidades</td>
                  </tr>
                  <tr className="border-t-2 border-amber-500/50">
                    <td className="py-3 text-amber-400 font-semibold">Peso total kit</td>
                    <td className="py-3 text-amber-400 text-right font-bold">~1,568 kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 bg-gray-900/50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-oswald">
            BENEFICIOS DEL <span className="text-amber-500">BLINDAJE</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <span className="text-gray-300">{beneficio}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-2xl p-8 md:p-12 border border-amber-500/30 text-center">
            <Shield className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4 font-oswald">
              PROTEJA SU INVERSIÓN CON BLINDAJE PROFESIONAL
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Extienda la vida útil de sus baldes mineros. Servicio disponible en Santiago, Antofagasta, Calama y Copiapó.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold">
              <Phone className="mr-2 h-5 w-5" />
              Solicitar Cotización de Blindaje
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
