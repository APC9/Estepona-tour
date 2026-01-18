'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NewPOIPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameEs: '',
    nameEn: '',
    nameFr: '',
    nameDe: '',
    nameIt: '',
    descEs: '',
    descEn: '',
    descFr: '',
    descDe: '',
    descIt: '',
    latitude: '',
    longitude: '',
    type: 'restaurant',
    address: '',
    imageUrl: '',
    externalLink: '',
    points: '10',
    xpReward: '50',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/pois', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          points: parseInt(formData.points) || 10,
          xpReward: parseInt(formData.xpReward) || 50,
        }),
      });

      if (res.ok) {
        alert('✅ POI creado exitosamente');
        router.push('/admin/pois');
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating POI:', error);
      alert('❌ Error al crear POI');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
          alert('✅ Ubicación obtenida');
        },
        (error) => {
          alert('❌ Error obteniendo ubicación: ' + error.message);
        }
      );
    } else {
      alert('❌ Geolocalización no disponible');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">➕ Añadir Nuevo POI</h1>
        <p className="text-gray-600 mt-1">
          Crea un nuevo punto de interés o comercio
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Nombres Multi-idioma */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Nombre del POI (Multi-idioma) *
          </label>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              🇪🇸 Español
            </label>
            <input
              type="text"
              required
              value={formData.nameEs}
              onChange={(e) => setFormData({ ...formData, nameEs: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nombre en Español"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              🇬🇧 English
            </label>
            <input
              type="text"
              required
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Name in English"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              🇫🇷 Français
            </label>
            <input
              type="text"
              required
              value={formData.nameFr}
              onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nom en Français"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              🇩🇪 Deutsch
            </label>
            <input
              type="text"
              required
              value={formData.nameDe}
              onChange={(e) => setFormData({ ...formData, nameDe: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Name auf Deutsch"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              🇮🇹 Italiano
            </label>
            <input
              type="text"
              required
              value={formData.nameIt}
              onChange={(e) => setFormData({ ...formData, nameIt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nome in Italiano"
            />
          </div>
        </div>

        {/* Descripciones Multi-idioma */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Descripción (Multi-idioma) *
          </label>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              🇪🇸 Español
            </label>
            <textarea
              required
              rows={3}
              value={formData.descEs}
              onChange={(e) => setFormData({ ...formData, descEs: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Descripción en Español"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              🇬🇧 English
            </label>
            <textarea
              required
              rows={3}
              value={formData.descEn}
              onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Description in English"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              🇫🇷 Français
            </label>
            <textarea
              required
              rows={3}
              value={formData.descFr}
              onChange={(e) => setFormData({ ...formData, descFr: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Description en Français"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              🇩🇪 Deutsch
            </label>
            <textarea
              required
              rows={3}
              value={formData.descDe}
              onChange={(e) => setFormData({ ...formData, descDe: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Beschreibung auf Deutsch"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              🇮🇹 Italiano
            </label>
            <textarea
              required
              rows={3}
              value={formData.descIt}
              onChange={(e) => setFormData({ ...formData, descIt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Descrizione in Italiano"
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de POI *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="restaurant">🍽️ Restaurante</option>
            <option value="monument">🏛️ Monumento</option>
            <option value="beach">🏖️ Playa</option>
            <option value="museum">🖼️ Museo</option>
            <option value="park">🌳 Parque</option>
            <option value="shop">🛍️ Tienda</option>
            <option value="viewpoint">👁️ Mirador</option>
            <option value="bar">🍺 Bar</option>
            <option value="nightclub">💃 Discoteca</option>
            <option value="port">⚓ Puerto</option>
            <option value="entertainment">🎪 Diversión</option>
            <option value="historic">🏰 Histórico</option>
            <option value="culture">🎭 Cultura</option>
            <option value="nature">🌿 Naturaleza</option>
            <option value="other">📍 Otro</option>
          </select>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              { value: 'restaurant', img: '/restaurantes.png', label: 'Restaurante' },
              { value: 'monument', img: '/monumentos.png', label: 'Monumento' },
              { value: 'beach', img: '/playas.png', label: 'Playa' },
              { value: 'museum', img: '/museo.png', label: 'Museo' },
              { value: 'park', img: '/parque.png', label: 'Parque' },
              { value: 'shop', img: '/shopping.svg', label: 'Tienda' },
              { value: 'viewpoint', img: '/mirador.png', label: 'Mirador' },
              { value: 'bar', img: '/bar.png', label: 'Bar' },
              { value: 'nightclub', img: '/discotecas.png', label: 'Discoteca' },
              { value: 'port', img: '/puerto.svg', label: 'Puerto' },
              { value: 'entertainment', img: '/diversion.svg', label: 'Diversión' },
              { value: 'culture', img: '/mural.png', label: 'Cultura' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: item.value })}
                className={`p-3 border-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 ${
                  formData.type === item.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Image
                  src={item.img}
                  alt={item.label}
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="text-xs text-gray-600">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Calle Principal 123, Estepona"
          />
        </div>

        {/* Gamificación */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💎 Puntos *
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              required
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="10"
            />
            <p className="text-xs text-gray-500 mt-1">Puntos que otorga al visitar</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⭐ Experiencia (XP) *
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              required
              value={formData.xpReward}
              onChange={(e) => setFormData({ ...formData, xpReward: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="50"
            />
            <p className="text-xs text-gray-500 mt-1">XP que otorga para subir de nivel</p>
          </div>
        </div>

        {/* Ubicación */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitud *
            </label>
            <input
              type="number"
              step="any"
              required
              value={formData.latitude}
              onChange={(e) =>
                setFormData({ ...formData, latitude: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="36.4273"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitud *
            </label>
            <input
              type="number"
              step="any"
              required
              value={formData.longitude}
              onChange={(e) =>
                setFormData({ ...formData, longitude: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="-5.1448"
            />
          </div>
        </div>

        {/* Botón ubicación actual */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          📍 Usar Mi Ubicación Actual
        </button>

        {/* URL Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL de Imagen
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          {formData.imageUrl && (
            <div className="mt-2">
              <Image
                src={formData.imageUrl}
                alt="Preview"
                width={800}
                height={400}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Enlace Externo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔗 Enlace Externo (Opcional)
          </label>
          <input
            type="url"
            value={formData.externalLink || ''}
            onChange={(e) =>
              setFormData({ ...formData, externalLink: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://ejemplo.com/menu.pdf"
          />
          <p className="mt-1 text-xs text-gray-500">
            Por ejemplo: menú de restaurante, página web, horarios, etc.
          </p>
        </div>

        {/* Botones */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : '✅ Crear POI'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
          >
            ❌ Cancelar
          </button>
        </div>
      </form>

      {/* Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Consejos</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Puedes usar tu ubicación actual si estás en el lugar</li>
          <li>• Las coordenadas de Estepona están alrededor de 36.42, -5.14</li>
          <li>• La imagen es opcional pero mejora la experiencia</li>
          <li>• Asegúrate de que la descripción sea atractiva</li>
        </ul>
      </div>
    </div>
  );
}
