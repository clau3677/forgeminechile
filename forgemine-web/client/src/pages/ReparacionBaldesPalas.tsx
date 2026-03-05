import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Wrench, 
  Shield, 
  CheckCircle, 
  Phone, 
  ArrowRight,
  Award,
  Clock,
  MapPin
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { trackConversion } from "@/lib/tracking";
import { useEffect } from "react";

export default function ReparacionBaldesPalas() {
  useEffect(() => {
    trackConversion({
      event_name: 'service_page_view',
      event_category: 'services',
      event_label: 'reparacion_baldes_palas',
    });
  }, []);

  const equipos = [
    { marca: "Komatsu", modelos: ["PC5500", "PC7000", "PC8000"], color: "from-yellow-500 to-yellow-600" },
    { marca: "Caterpillar", modelos: ["6040", "6060", "6090"], color: "from-yellow-600 to-amber-600" },
    { marca: "Liebherr", modelos: ["R9400", "R9800", "R996B"], color: "from-amber-500 to-orange-500" },
    { marca: "Hitachi", modelos: ["EX5600", "EX8000"], color: "from-orange-500 to-red-500" },
  ];

  const servicios = [
    {
      titulo: "Reparación de Fisuras Estructurales",
      descripcion: "Reparación especializada de fisuras y grietas en baldes de palas hidráulicas utilizando soldadura certificada AWS D1.1. Incluye ensayos no destructivos (END) para garantizar la integridad estructural.",
      icono: Wrench,
    },
    {
      titulo: "Cambio de Labios y Dientes GET",
      descripcion: "Reemplazo de labios de balde y dientes GET (Ground Engaging Tools) con materiales de alta resistencia. Recuperación geométrica de alojamientos y pestillos.",
      icono: Shield,
    },
    {
      titulo: "Relleno de Alojamientos",
      descripcion: "Relleno y recuperación de alojamientos guía, ojos de balde y bujes de amortiguadores. Ingeniería inversa para componentes descontinuados.",
      icono: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <SEOHead
        title="Reparación de Baldes para Palas Hidráulicas"
        description="Reparación de baldes para palas hidráulicas Komatsu PC5500, PC7000, CAT 6060, Liebherr R9800. Soldadura AWS D1.1 certificada. Servicio en Chile."
        url="/reparacion-baldes-palas-hidraulicas"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600 rounded-full filter blur-[120px]" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20">
              Servicio Especializado en Minería
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-oswald">
              REPARACIÓN DE BALDES PARA{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                PALAS HIDRÁULICAS
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Reparación integral de baldes para palas hidráulicas en Chile. Soldadores certificados AWS D1.1, 
              ensayos no destructivos y garantía de <strong>disponibilidad operacional</strong>. 
              Servicio en Santiago, Antofagasta, Calama y Copiapó.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold">
                <Phone className="mr-2 h-5 w-5" />
                Solicitar Cotización
              </Button>
              <Button size="lg" variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                Ver Proyectos Realizados
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Equipos Compatibles */}
      <section className="py-16 bg-gray-900/50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-oswald">
            EQUIPOS QUE <span className="text-amber-500">REPARAMOS</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Reparación de baldes para las principales marcas de palas hidráulicas utilizadas en la minería chilena
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipos.map((equipo, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-amber-500/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${equipo.color} flex items-center justify-center mb-4`}>
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{equipo.marca}</h3>
                  <ul className="space-y-2">
                    {equipo.modelos.map((modelo, idx) => (
                      <li key={idx} className="text-gray-400 flex items-center">
                        <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                        {modelo}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios Detallados */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-oswald">
            SERVICIOS DE <span className="text-amber-500">REPARACIÓN INTEGRAL</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Soluciones completas para mantención y recuperación de componentes mineros
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {servicios.map((servicio, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-amber-500/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center mb-6">
                    <servicio.icono className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{servicio.titulo}</h3>
                  <p className="text-gray-400">{servicio.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certificaciones y Ubicaciones */}
      <section className="py-16 bg-gray-900/50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Certificaciones */}
            <div>
              <h2 className="text-2xl font-bold mb-6 font-oswald flex items-center">
                <Award className="h-6 w-6 text-amber-500 mr-3" />
                CERTIFICACIONES
              </h2>
              <div className="space-y-4">
                {[
                  { cert: "AWS D1.1", desc: "Soldadura estructural certificada" },
                  { cert: "ISO 9001:2015", desc: "Sistema de gestión de calidad" },
                  { cert: "ISO 3834-2", desc: "Requisitos de calidad para soldadura" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <CheckCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">{item.cert}</span>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Ubicaciones */}
            <div>
              <h2 className="text-2xl font-bold mb-6 font-oswald flex items-center">
                <MapPin className="h-6 w-6 text-amber-500 mr-3" />
                COBERTURA EN CHILE
              </h2>
              <div className="space-y-4">
                {[
                  { ciudad: "Santiago", desc: "Sede principal - Región Metropolitana" },
                  { ciudad: "Antofagasta", desc: "Servicio en La Negra y zona industrial" },
                  { ciudad: "Calama", desc: "Cobertura para Chuquicamata y El Abra" },
                  { ciudad: "Copiapó", desc: "Servicio en Región de Atacama" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <MapPin className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">{item.ciudad}</span>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-2xl p-8 md:p-12 border border-amber-500/30 text-center">
            <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4 font-oswald">
              ¿NECESITA REPARAR UN BALDE DE PALA HIDRÁULICA?
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Garantizamos la <strong className="text-amber-400">disponibilidad operacional</strong> de su flota. 
              Servicio de emergencia 24/7 disponible. Cotización sin compromiso.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold">
              <Phone className="mr-2 h-5 w-5" />
              Llamar Ahora: +56 9 9277 9872
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
