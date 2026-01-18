'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditBadgePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    nameEs: '',
    nameEn: '',
    nameFr: '',
    nameDe: '',
    descriptionEs: '',
    descriptionEn: '',
    descriptionFr: '',
    descriptionDe: '',
    icon: '🏅',
    category: '',
    rarity: 'COMMON',
    requirementType: 'visits_count',
    requirementValue: '1',
    requirementCategory: '',
    pointsReward: '10',
    xpReward: '50',
    isActive: true,
  });

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const res = await fetch(`/api/admin/badges/${id}`);
        if (res.ok) {
          const data = await res.json();
          const badge = data.badge;
          
          setFormData({
            nameEs: badge.nameEs || '',
            nameEn: badge.nameEn || '',
            nameFr: badge.nameFr || '',
            nameDe: badge.nameDe || '',
            descriptionEs: badge.descriptionEs || '',
            descriptionEn: badge.descriptionEn || '',
            descriptionFr: badge.descriptionFr || '',
            descriptionDe: badge.descriptionDe || '',
            icon: badge.icon || '🏅',
            category: badge.category || '',
            rarity: badge.rarity || 'COMMON',
            requirementType: badge.requirement?.type || 'visits_count',
            requirementValue: badge.requirement?.value?.toString() || '1',
            requirementCategory: badge.requirement?.category || '',
            pointsReward: badge.pointsReward?.toString() || '10',
            xpReward: badge.xpReward?.toString() || '50',
            isActive: badge.isActive !== undefined ? badge.isActive : true,
          });
        } else {
          alert('❌ Error al cargar el badge');
          router.push('/admin/badges');
        }
      } catch (error) {
        console.error('Error fetching badge:', error);
        alert('❌ Error al cargar el badge');
        router.push('/admin/badges');
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      fetchBadge();
    }
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requirement: any = {
        type: formData.requirementType,
        value: parseInt(formData.requirementValue),
      };

      if (formData.requirementCategory) {
        requirement.category = formData.requirementCategory;
      }

      const res = await fetch(`/api/admin/badges/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category: formData.category || null,
          requirement,
          pointsReward: parseInt(formData.pointsReward),
          xpReward: parseInt(formData.xpReward),
        }),
      });

      if (res.ok) {
        alert('✅ Badge actualizado exitosamente');
        router.push('/admin/badges');
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating badge:', error);
      alert('❌ Error al actualizar badge');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando badge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">✏️ Editar Badge</h1>
        <p className="text-gray-600 mt-1">
          Modifica los datos del badge
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Estado */}
        <div className="border-b pb-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Badge activo (los usuarios pueden obtenerlo)
            </span>
          </label>
        </div>

        {/* Información básica - Similar a la página new */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📝 Información Básica</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre (Español) *
              </label>
              <input
                type="text"
                required
                value={formData.nameEs}
                onChange={(e) => setFormData({ ...formData, nameEs: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre (Inglés)
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Descripciones */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📄 Descripciones</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (Español) *
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionEs}
              onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Visual */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🎨 Visual</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icono *
              </label>
              <input
                type="text"
                required
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-3xl text-center"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rareza *
              </label>
              <select
                required
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="COMMON">Común</option>
                <option value="RARE">Raro</option>
                <option value="EPIC">Épico</option>
                <option value="LEGENDARY">Legendario</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Ninguna</option>
                <option value="MONUMENT">Monumento</option>
                <option value="MUSEUM">Museo</option>
                <option value="VIEWPOINT">Mirador</option>
                <option value="RESTAURANT">Restaurante</option>
                <option value="BEACH">Playa</option>
                <option value="PARK">Parque</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requisitos */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🎯 Requisitos</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                required
                value={formData.requirementType}
                onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="visits_count">Número de visitas</option>
                <option value="points_earned">Puntos ganados</option>
                <option value="level_reached">Nivel alcanzado</option>
                <option value="category_visits">Visitas por categoría</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.requirementValue}
                onChange={(e) => setFormData({ ...formData, requirementValue: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría Específica
              </label>
              <select
                value={formData.requirementCategory}
                onChange={(e) => setFormData({ ...formData, requirementCategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                disabled={formData.requirementType !== 'category_visits'}
              >
                <option value="">Cualquiera</option>
                <option value="MONUMENT">Monumento</option>
                <option value="MUSEUM">Museo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recompensas */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🎁 Recompensas</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puntos *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.pointsReward}
                onChange={(e) => setFormData({ ...formData, pointsReward: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experiencia (XP) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.xpReward}
                onChange={(e) => setFormData({ ...formData, xpReward: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-semibold disabled:opacity-50"
          >
            {loading ? 'Guardando...' : '💾 Guardar Cambios'}
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
    </div>
  );
}
