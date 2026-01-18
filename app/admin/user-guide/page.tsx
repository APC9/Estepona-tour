export default function UserGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-2">📱 Guía del Usuario</h1>
        <p className="text-blue-100">
          Aprende a usar Estepona Tours y descubre la ciudad
        </p>
      </div>

      {/* Introducción */}
      <Section
        icon="🎮"
        title="¿Qué es Estepona Tours?"
        content={
          <div className="space-y-4">
            <p className="text-lg">
              Estepona Tours es una aplicación interactiva que convierte tu
              visita a Estepona en una experiencia gamificada. Escanea códigos
              NFC en puntos de interés, gana puntos, desbloquea badges y
              compite con otros usuarios.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <FeatureCard
                icon="📍"
                title="Explora"
                description="Descubre lugares increíbles en Estepona"
              />
              <FeatureCard
                icon="📱"
                title="Escanea"
                description="Usa tu teléfono para escanear códigos NFC"
              />
              <FeatureCard
                icon="🏆"
                title="Gana"
                description="Acumula puntos y desbloquea recompensas"
              />
            </div>
          </div>
        }
      />

      {/* Primeros Pasos */}
      <Section
        icon="🚀"
        title="Primeros Pasos"
        content={
          <div className="space-y-4">
            <Step
              number={1}
              title="Crea tu cuenta"
              description="Inicia sesión con tu cuenta de Google para empezar a jugar"
            />
            <Step
              number={2}
              title="Explora el mapa"
              description="Ve al mapa para descubrir todos los puntos de interés disponibles"
            />
            <Step
              number={3}
              title="Activa la ubicación"
              description="Permite que la app acceda a tu ubicación para ver dónde estás en el mapa"
            />
            <Step
              number={4}
              title="Visita un POI"
              description="Dirígete a un punto de interés y escanea el código NFC"
            />
          </div>
        }
      />

      {/* Cómo Escanear */}
      <Section
        icon="📱"
        title="Cómo Escanear Códigos NFC"
        content={
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                ℹ️ <strong>Nota:</strong> Tu dispositivo debe tener NFC
                habilitado. La mayoría de smartphones modernos lo tienen.
              </p>
            </div>

            <h3 className="font-semibold text-lg mt-6">Pasos para Escanear:</h3>
            <ol className="list-decimal list-inside space-y-3">
              <li>
                Asegúrate de que el NFC esté activado en tu teléfono:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>
                    <strong>Android:</strong> Configuración → Conexiones → NFC
                  </li>
                  <li>
                    <strong>iPhone:</strong> NFC está siempre activo (iPhone 7+)
                  </li>
                </ul>
              </li>
              <li>Ve a la sección <strong>Scanner</strong> en la app</li>
              <li>
                Acerca la parte superior de tu teléfono al código NFC (etiqueta
                circular)
              </li>
              <li>
                Espera la vibración o sonido de confirmación
              </li>
              <li>
                ¡Listo! Los puntos se añadirán automáticamente a tu cuenta
              </li>
            </ol>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800">
                💡 <strong>Tip:</strong> Si el escaneo no funciona, intenta mover
                el teléfono lentamente alrededor de la etiqueta NFC. La antena
                NFC suele estar en la parte superior trasera del dispositivo.
              </p>
            </div>
          </div>
        }
      />

      {/* Sistema de Puntos */}
      <Section
        icon="⭐"
        title="Sistema de Puntos y Recompensas"
        content={
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Gana Puntos:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Primera visita a un POI:</strong> 100 puntos
              </li>
              <li>
                <strong>Visita diaria:</strong> 10 puntos por día de visita
              </li>
              <li>
                <strong>Completar desafíos:</strong> Puntos variables según el
                desafío
              </li>
              <li>
                <strong>Desbloquear badges:</strong> Puntos bonus por logros
              </li>
            </ul>

            <h3 className="font-semibold text-lg mt-6">Badges (Insignias):</h3>
            <p>
              Los badges son recompensas especiales que obtienes al cumplir
              ciertos objetivos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <BadgeCard
                icon="🌟"
                name="Explorador Novato"
                requirement="Visita 5 POIs diferentes"
              />
              <BadgeCard
                icon="🗺️"
                name="Cartógrafo"
                requirement="Visita 20 POIs diferentes"
              />
              <BadgeCard
                icon="🏅"
                name="Maestro Turista"
                requirement="Visita 50 POIs diferentes"
              />
              <BadgeCard
                icon="🔥"
                name="Racha Semanal"
                requirement="Visita POIs 7 días seguidos"
              />
            </div>
          </div>
        }
      />

      {/* Usar el Mapa */}
      <Section
        icon="🗺️"
        title="Usar el Mapa Interactivo"
        content={
          <div className="space-y-4">
            <p>El mapa es tu herramienta principal para explorar Estepona:</p>

            <h3 className="font-semibold text-lg">Elementos del Mapa:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>📍 Marcadores Rojos:</strong> Puntos de interés que
                puedes visitar
              </li>
              <li>
                <strong>🔵 Punto Azul Pulsante:</strong> Tu ubicación actual
              </li>
              <li>
                <strong>Círculo Verde:</strong> Radio de 50m alrededor de ti
                (área de escaneo)
              </li>
            </ul>

            <h3 className="font-semibold text-lg mt-6">Interactuar con POIs:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Haz clic en cualquier marcador rojo</li>
              <li>Se abrirá una ventana con información del lugar</li>
              <li>
                Verás:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>Nombre y descripción del lugar</li>
                  <li>Tipo de POI (restaurante, monumento, etc.)</li>
                  <li>Distancia desde tu ubicación</li>
                  <li>Botones para obtener direcciones</li>
                </ul>
              </li>
            </ol>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-green-800">
                ✅ <strong>Tip:</strong> Mantén la geolocalización activada para
                que el mapa te muestre siempre dónde estás y qué POIs tienes cerca.
              </p>
            </div>
          </div>
        }
      />

      {/* Perfil y Progreso */}
      <Section
        icon="👤"
        title="Tu Perfil y Progreso"
        content={
          <div className="space-y-4">
            <p>
              En tu perfil puedes ver toda tu información y estadísticas:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                title="Nivel"
                description="Tu nivel actual basado en los puntos acumulados"
              />
              <InfoCard
                title="Puntos Totales"
                description="Suma total de todos los puntos ganados"
              />
              <InfoCard
                title="POIs Visitados"
                description="Número de lugares que has explorado"
              />
              <InfoCard
                title="Badges"
                description="Insignias que has desbloqueado"
              />
            </div>

            <h3 className="font-semibold text-lg mt-6">Niveles:</h3>
            <div className="space-y-2">
              <LevelCard level="Turista" points="0-500" color="bg-gray-200" />
              <LevelCard level="Explorador" points="501-1500" color="bg-blue-200" />
              <LevelCard level="Aventurero" points="1501-3000" color="bg-purple-200" />
              <LevelCard level="Maestro" points="3001+" color="bg-yellow-200" />
            </div>
          </div>
        }
      />

      {/* Consejos */}
      <Section
        icon="💡"
        title="Consejos y Trucos"
        content={
          <div className="space-y-3">
            <Tip
              text="Visita POIs en diferentes horarios para descubrir cómo cambian (algunos lugares son mejores de día, otros de noche)"
            />
            <Tip
              text="Comparte tu progreso con amigos y competid por ver quién consigue más puntos"
            />
            <Tip
              text="Lee las descripciones de los POIs antes de visitarlos para aprender sobre su historia"
            />
            <Tip
              text="Activa las notificaciones para recibir alertas sobre POIs cercanos"
            />
            <Tip
              text="Visita la aplicación diariamente para mantener tu racha activa"
            />
            <Tip
              text="Explora zonas menos visitadas para descubrir gemas escondidas"
            />
          </div>
        }
      />

      {/* FAQ */}
      <Section
        icon="❓"
        title="Preguntas Frecuentes"
        content={
          <div className="space-y-4">
            <FAQ
              question="¿Necesito internet para usar la app?"
              answer="Sí, necesitas conexión a internet para cargar el mapa y sincronizar tu progreso. Sin embargo, una vez cargado el mapa, puedes escanear POIs sin conexión y se sincronizarán cuando vuelvas a tener internet."
            />
            <FAQ
              question="¿Puedo visitar el mismo POI varias veces?"
              answer="Sí, pero solo ganarás puntos completos la primera vez. Visitas posteriores el mismo día no dan puntos adicionales, pero visitar en días diferentes sí suma puntos."
            />
            <FAQ
              question="Mi teléfono no escanea el código NFC"
              answer="Asegúrate de que: 1) Tu teléfono tenga NFC y esté activado, 2) Estés cerca del código (menos de 5cm), 3) No tengas una funda metálica que bloquee la señal."
            />
            <FAQ
              question="¿Cómo subo de nivel?"
              answer="Acumula puntos visitando POIs. Cada 500 puntos aproximadamente subirás de nivel. Los niveles desbloquean badges especiales y reconocimientos."
            />
            <FAQ
              question="¿Puedo usar la app en otras ciudades?"
              answer="Esta versión está específicamente diseñada para Estepona. Si viajas a otras ciudades, consulta si tienen su propia versión de la app."
            />
          </div>
        }
      />

      {/* Soporte */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">🆘 ¿Necesitas Ayuda?</h2>
        <p className="mb-4">
          Si tienes problemas técnicos o preguntas que no están en esta guía,
          estamos aquí para ayudarte.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="mailto:ayuda@estepona-tours.com"
            className="px-6 py-3 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-50"
          >
            📧 Contactar Soporte
          </a>
          <a
            href="/admin/guide"
            className="px-6 py-3 bg-purple-800 text-white rounded-lg font-semibold hover:bg-purple-900"
          >
            📖 Guía Completa
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  content,
}: {
  icon: string;
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <span className="mr-3 text-3xl">{icon}</span>
        {title}
      </h2>
      <div className="text-gray-700">{content}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function BadgeCard({
  icon,
  name,
  requirement,
}: {
  icon: string;
  name: string;
  requirement: string;
}) {
  return (
    <div className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="font-bold">{name}</h4>
      <p className="text-sm text-gray-600 mt-1">{requirement}</p>
    </div>
  );
}

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function LevelCard({
  level,
  points,
  color,
}: {
  level: string;
  points: string;
  color: string;
}) {
  return (
    <div className={`${color} p-3 rounded-lg flex justify-between items-center`}>
      <span className="font-semibold">{level}</span>
      <span className="text-sm text-gray-600">{points} puntos</span>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-start space-x-3 bg-green-50 p-3 rounded-lg">
      <span className="text-xl">💡</span>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-l-4 border-blue-500 pl-4 py-2">
      <p className="font-semibold text-gray-800 mb-1">{question}</p>
      <p className="text-gray-600 text-sm">{answer}</p>
    </div>
  );
}
