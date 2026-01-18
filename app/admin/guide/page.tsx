export default function AdminGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-2">📖 Guía del Administrador</h1>
        <p className="text-primary-100">
          Manual completo para administrar la aplicación Estepona Tours
        </p>
      </div>

      {/* Acceso al Panel */}
      <Section
        icon="🔐"
        title="1. Acceso al Panel Administrativo"
        content={
          <div className="space-y-4">
            <p>
              Para acceder al panel administrativo, tu cuenta debe tener
              permisos de administrador. El administrador principal se configura
              en la variable de entorno <code>NEXT_PUBLIC_ADMIN_EMAIL</code>.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="font-mono text-sm">
                NEXT_PUBLIC_ADMIN_EMAIL=tu-email@ejemplo.com
              </p>
            </div>
            <p>
              Una vez configurado, inicia sesión con tu cuenta de Google y
              accede a <strong>/admin</strong>
            </p>
          </div>
        }
      />

      {/* Gestión de POIs */}
      <Section
        icon="📍"
        title="2. Gestión de POIs y Comercios"
        content={
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Añadir un Nuevo POI</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Ve a <strong>POIs/Comercios</strong> en el menú lateral</li>
              <li>Haz clic en <strong>➕ Añadir POI</strong></li>
              <li>
                Completa el formulario:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>
                    <strong>Nombre:</strong> El nombre del lugar
                  </li>
                  <li>
                    <strong>Descripción:</strong> Información atractiva del lugar
                  </li>
                  <li>
                    <strong>Tipo:</strong> Restaurante, monumento, playa, etc.
                  </li>
                  <li>
                    <strong>Ubicación:</strong> Latitud y longitud (puedes usar
                    tu ubicación actual)
                  </li>
                  <li>
                    <strong>Imagen:</strong> URL de una imagen del lugar (opcional)
                  </li>
                </ul>
              </li>
              <li>Haz clic en <strong>✅ Crear POI</strong></li>
            </ol>

            <h3 className="font-semibold text-lg mt-6">Editar un POI</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>En la lista de POIs, haz clic en <strong>✏️ Editar</strong></li>
              <li>Modifica los campos necesarios</li>
              <li>Guarda los cambios</li>
            </ol>

            <h3 className="font-semibold text-lg mt-6">Eliminar un POI</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                ⚠️ <strong>Precaución:</strong> Al eliminar un POI, se eliminarán
                también todas las visitas asociadas. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        }
      />

      {/* Analytics */}
      <Section
        icon="📈"
        title="3. Analytics y Estadísticas"
        content={
          <div className="space-y-4">
            <p>
              El panel de Analytics te proporciona información valiosa sobre el
              uso de la aplicación:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                title="Total Visitas"
                description="Número total de escaneos de códigos NFC en el período seleccionado"
              />
              <InfoCard
                title="Usuarios Únicos"
                description="Cantidad de usuarios diferentes que han escaneado POIs"
              />
              <InfoCard
                title="Promedio por Usuario"
                description="Cuántos POIs visita cada usuario en promedio"
              />
              <InfoCard
                title="Promedio por POI"
                description="Cuántas veces es visitado cada POI en promedio"
              />
            </div>

            <h3 className="font-semibold text-lg mt-6">Gráficos Disponibles</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Visitas en el Tiempo:</strong> Gráfico de línea que
                muestra la evolución de visitas día a día
              </li>
              <li>
                <strong>POIs por Tipo:</strong> Gráfico de barras con la
                distribución de POIs por categoría
              </li>
              <li>
                <strong>Top Usuarios:</strong> Gráfico circular con los 5
                usuarios más activos
              </li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800">
                💡 <strong>Tip:</strong> Puedes cambiar el período de análisis
                (7, 30, 90 días o 1 año) usando el selector en la esquina superior
                derecha.
              </p>
            </div>
          </div>
        }
      />

      {/* Dashboard */}
      <Section
        icon="📊"
        title="4. Dashboard Principal"
        content={
          <div className="space-y-4">
            <p>
              El Dashboard te ofrece una vista rápida del estado general de la
              aplicación:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Tarjetas de Estadísticas:</strong> Resumen de métricas
                clave
              </li>
              <li>
                <strong>POIs Más Visitados:</strong> Ranking de los lugares más
                populares
              </li>
              <li>
                <strong>Escaneos Recientes:</strong> Últimas 10 actividades de
                usuarios
              </li>
              <li>
                <strong>Acciones Rápidas:</strong> Atajos a las funciones más
                usadas
              </li>
            </ul>
          </div>
        }
      />

      {/* Mejores Prácticas */}
      <Section
        icon="✨"
        title="5. Mejores Prácticas"
        content={
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Al Crear POIs:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Usa nombres descriptivos y atractivos</li>
              <li>
                Escribe descripciones que inviten a los usuarios a visitar el
                lugar
              </li>
              <li>Verifica que las coordenadas sean precisas</li>
              <li>
                Añade imágenes de buena calidad para mejorar la experiencia
              </li>
              <li>Mantén actualizada la información de los comercios</li>
            </ul>

            <h3 className="font-semibold text-lg mt-6">Para Analytics:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Revisa las estadísticas semanalmente</li>
              <li>
                Identifica POIs con pocas visitas y considera mejorar su
                descripción
              </li>
              <li>Usa los datos para planificar nuevos POIs en áreas populares</li>
              <li>Monitorea usuarios activos para detectar patrones</li>
            </ul>

            <h3 className="font-semibold text-lg mt-6">Seguridad:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>No compartas tus credenciales de administrador</li>
              <li>Revisa periódicamente la lista de POIs activos</li>
              <li>Mantén backup de la base de datos regularmente</li>
            </ul>
          </div>
        }
      />

      {/* Solución de Problemas */}
      <Section
        icon="🔧"
        title="6. Solución de Problemas"
        content={
          <div className="space-y-4">
            <ProblemSolution
              problem="No puedo acceder al panel de administración"
              solution="Verifica que tu email esté configurado en NEXT_PUBLIC_ADMIN_EMAIL o que tu cuenta tenga tier='ADMIN' en la base de datos."
            />
            <ProblemSolution
              problem="Los gráficos no cargan"
              solution="Asegúrate de que haya datos de visitas en el período seleccionado. Si es una instalación nueva, puede que no haya suficientes datos."
            />
            <ProblemSolution
              problem="No aparecen los POIs en el mapa"
              solution="Verifica que las coordenadas estén correctas y dentro del rango de Estepona (latitud ~36.42, longitud ~-5.14)."
            />
            <ProblemSolution
              problem="Error al crear POI"
              solution="Asegúrate de completar todos los campos obligatorios (nombre, descripción, latitud, longitud, tipo)."
            />
          </div>
        }
      />

      {/* Soporte */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">💬 ¿Necesitas Ayuda?</h2>
        <p className="mb-4">
          Si tienes problemas o preguntas que no están cubiertas en esta guía,
          contacta al equipo de soporte técnico.
        </p>
        <div className="flex space-x-4">
          <a
            href="mailto:soporte@estepona-tours.com"
            className="px-6 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50"
          >
            📧 Email Soporte
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

function ProblemSolution({
  problem,
  solution,
}: {
  problem: string;
  solution: string;
}) {
  return (
    <div className="border-l-4 border-yellow-500 pl-4 py-2">
      <p className="font-semibold text-gray-800">❓ {problem}</p>
      <p className="text-gray-600 mt-1">
        <strong>Solución:</strong> {solution}
      </p>
    </div>
  );
}
