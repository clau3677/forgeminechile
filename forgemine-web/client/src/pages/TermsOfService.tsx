import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Términos de Servicio"
        description="Términos y condiciones de uso del sitio web y servicios de FORGEMINE CHILE SpA, especialistas en reparación de baldes mineros en Chile."
        url="/terminos-de-servicio"
        noindex={false}
      />
      <Header />

      <main className="container py-20 max-w-4xl">
        <h1 className="font-display text-4xl font-bold mb-4">Términos de Servicio</h1>
        <p className="text-muted-foreground mb-10 text-sm">Última actualización: marzo de 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar el sitio web <strong className="text-foreground">www.forgeminechile.com</strong>, usted acepta
              quedar vinculado por estos Términos de Servicio. Si no está de acuerdo con alguno de estos términos, le
              solicitamos que no utilice el sitio.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">2. Identificación de la empresa</h2>
            <p>
              <strong className="text-foreground">FORGEMINE CHILE SpA</strong>, con domicilio en Santiago de Chile, es la
              titular y responsable del sitio web. Contacto:{" "}
              <a href="mailto:contacto@forgeminechile.com" className="text-primary hover:underline">contacto@forgeminechile.com</a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">3. Uso del sitio</h2>
            <p>El sitio web está destinado exclusivamente a:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Informar sobre los servicios de reparación, blindaje y reconstrucción de baldes mineros</li>
              <li>Facilitar el contacto y solicitud de cotizaciones</li>
              <li>Publicar contenido técnico relacionado con la industria minera</li>
            </ul>
            <p className="mt-3">
              Queda prohibido utilizar el sitio para fines ilícitos, difamatorios, fraudulentos o que puedan dañar los
              derechos de terceros.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Servicios y cotizaciones</h2>
            <p>
              Las solicitudes de cotización enviadas a través del formulario no constituyen un contrato vinculante. Un contrato
              de servicio se formalizará únicamente mediante la aceptación escrita por ambas partes de una propuesta comercial
              formal emitida por FORGEMINE CHILE SpA.
            </p>
            <p className="mt-3">
              Los precios, plazos y condiciones indicados en cualquier cotización tienen una vigencia de <strong className="text-foreground">30 días</strong> desde
              su emisión, salvo indicación expresa en contrario.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Propiedad intelectual</h2>
            <p>
              Todos los contenidos del sitio (textos, imágenes, logotipos, diseño, código fuente) son propiedad de
              FORGEMINE CHILE SpA o de sus licenciantes y están protegidos por las leyes de propiedad intelectual vigentes
              en Chile. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Limitación de responsabilidad</h2>
            <p>
              FORGEMINE CHILE SpA no garantiza la disponibilidad ininterrumpida del sitio y no será responsable por daños
              derivados de:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Interrupciones técnicas o fallos del servicio de hosting</li>
              <li>Uso indebido del sitio por parte de terceros</li>
              <li>Inexactitudes en la información proporcionada por el usuario en formularios</li>
              <li>Contenido de sitios web externos enlazados desde este sitio</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Legislación aplicable</h2>
            <p>
              Estos términos se rigen por la legislación vigente en la <strong className="text-foreground">República de Chile</strong>.
              Cualquier controversia derivada del uso del sitio se someterá a los tribunales competentes de Santiago de Chile.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Modificaciones</h2>
            <p>
              FORGEMINE CHILE SpA se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones
              entrarán en vigor desde su publicación en este sitio. Se recomienda revisar periódicamente esta página.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
