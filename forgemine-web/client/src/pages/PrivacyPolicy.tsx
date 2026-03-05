import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Política de Privacidad"
        description="Política de privacidad de FORGEMINE CHILE SpA. Conoce cómo recopilamos, usamos y protegemos tus datos personales conforme a la Ley 19.628 de Chile."
        url="/politica-de-privacidad"
        noindex={false}
      />
      <Header />

      <main className="container py-20 max-w-4xl">
        <h1 className="font-display text-4xl font-bold mb-4">Política de Privacidad</h1>
        <p className="text-muted-foreground mb-10 text-sm">Última actualización: marzo de 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Responsable del tratamiento</h2>
            <p>
              <strong className="text-foreground">FORGEMINE CHILE SpA</strong>, RUT por confirmar, con domicilio en Santiago de Chile
              (en adelante, "FORGEMINE", "nosotros" o "la empresa"), es la entidad responsable del tratamiento de los datos
              personales recopilados a través del sitio web <strong className="text-foreground">www.forgeminechile.com</strong>.
            </p>
            <p className="mt-2">Contacto: <a href="mailto:contacto@forgeminechile.com" className="text-primary hover:underline">contacto@forgeminechile.com</a></p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">2. Marco legal</h2>
            <p>
              El tratamiento de datos personales se rige por la <strong className="text-foreground">Ley N° 19.628 sobre Protección de la Vida Privada</strong> de Chile
              y sus modificaciones vigentes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">3. Datos que recopilamos</h2>
            <p>A través del formulario de cotización y contacto recopilamos:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Nombre de empresa</li>
              <li>Mensaje o descripción del servicio requerido</li>
            </ul>
            <p className="mt-3">
              Adicionalmente, podemos recopilar automáticamente datos técnicos de navegación (dirección IP, tipo de navegador,
              páginas visitadas) con fines estadísticos y de mejora del servicio.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Finalidad del tratamiento</h2>
            <p>Los datos recopilados se utilizan exclusivamente para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Responder consultas y enviar cotizaciones de servicios</li>
              <li>Gestionar la relación comercial con clientes</li>
              <li>Mejorar la experiencia de usuario en el sitio web</li>
              <li>Enviar comunicaciones comerciales relevantes (solo con consentimiento previo)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Compartición de datos</h2>
            <p>
              FORGEMINE no vende, arrienda ni cede datos personales a terceros. Solo podrá compartirlos con:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Proveedores tecnológicos necesarios para operar el sitio (alojamiento web, analytics), bajo acuerdos de confidencialidad</li>
              <li>Autoridades competentes, cuando la ley lo exija</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Conservación de datos</h2>
            <p>
              Los datos personales se conservan durante el tiempo necesario para cumplir la finalidad para la que fueron
              recopilados y, posteriormente, durante los plazos legales aplicables.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Derechos del titular</h2>
            <p>Conforme a la Ley N° 19.628, usted tiene derecho a:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-foreground">Acceso:</strong> conocer qué datos tenemos sobre usted</li>
              <li><strong className="text-foreground">Rectificación:</strong> corregir datos inexactos o incompletos</li>
              <li><strong className="text-foreground">Cancelación:</strong> solicitar la eliminación de sus datos</li>
              <li><strong className="text-foreground">Oposición:</strong> oponerse al tratamiento de sus datos</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, envíe una solicitud a{" "}
              <a href="mailto:contacto@forgeminechile.com" className="text-primary hover:underline">contacto@forgeminechile.com</a>,
              indicando su nombre completo y el derecho que desea ejercer.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Seguridad</h2>
            <p>
              Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales frente a accesos
              no autorizados, pérdida, destrucción o divulgación no permitida.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">9. Cookies</h2>
            <p>
              El sitio puede utilizar cookies técnicas y analíticas para mejorar el funcionamiento del sitio web y analizar
              el tráfico. Puede gestionar las cookies desde la configuración de su navegador.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">10. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de actualizar esta política en cualquier momento. La versión vigente estará siempre
              disponible en esta página con la fecha de última actualización.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
