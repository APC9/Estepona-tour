import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/pois
 * Obtener todos los POIs disponibles según el tier del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const premiumOnly = searchParams.get('premium') === 'true';
    // const language = (searchParams.get('lang') || 'es') as 'es' | 'en' | 'fr' | 'de'; // TODO: usar para filtrar contenido

    // Construir filtros (language se usará más adelante si es necesario)
    const where: Record<string, unknown> = {
      isActive: true,
      ...(premiumOnly && { premiumOnly: true }),
    };

    if (category) {
      where.category = category;
    }

    // Si el usuario no es premium, excluir POIs premium
    if (!session || session.user.tier === 'FREE') {
      where.premiumOnly = false;
    }

    // Obtener POIs
    const pois = await prisma.pOI.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formatear respuesta según idioma
    const formattedPOIs = pois.map((poi) => ({
      id: poi.id,
      nfcUid: poi.nfcUid,
      slug: poi.slug,
      category: poi.category,
      lat: poi.lat,
      lng: poi.lng,
      address: poi.address,
      name: {
        es: poi.nameEs,
        en: poi.nameEn,
        fr: poi.nameFr,
        de: poi.nameDe,
      },
      description: {
        es: poi.descEs,
        en: poi.descEn,
        fr: poi.descFr,
        de: poi.descDe,
      },
      images: poi.images,
      audioGuide: {
        es: poi.audioGuideEs,
        en: poi.audioGuideEn,
        fr: poi.audioGuideFr,
        de: poi.audioGuideDe,
      },
      videoUrl: poi.videoUrl,
      externalLink: poi.externalLink,
      points: poi.points,
      xpReward: poi.xpReward,
      premiumOnly: poi.premiumOnly,
      difficulty: poi.difficulty,
      duration: poi.duration,
      accessibility: poi.accessibility,
    }));

    return NextResponse.json({
      success: true,
      pois: formattedPOIs,
      count: formattedPOIs.length,
    });
  } catch (error) {
    console.error('Error fetching POIs:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener POIs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pois
 * Crear un nuevo POI (solo admin)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // TODO: Verificar que el usuario es admin
    // Por ahora, cualquier usuario autenticado puede crear (cambiar en producción)

    const data = await request.json();

    const poi = await prisma.pOI.create({
      data: {
        nfcUid: data.nfcUid,
        slug: data.slug,
        category: data.category,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
        nameEs: data.name.es,
        nameEn: data.name.en,
        nameFr: data.name.fr,
        nameDe: data.name.de,
        nameIt: data.name.it || data.name.en, // Fallback a inglés si no existe italiano
        descEs: data.description.es,
        descEn: data.description.en,
        descFr: data.description.fr,
        descDe: data.description.de,
        descIt: data.description.it || data.description.en, // Fallback a inglés
        images: data.images || [],
        audioGuideEs: data.audioGuide?.es,
        audioGuideEn: data.audioGuide?.en,
        audioGuideFr: data.audioGuide?.fr,
        audioGuideDe: data.audioGuide?.de,
        audioGuideIt: data.audioGuide?.it,
        videoUrl: data.videoUrl,
        points: data.points || 10,
        xpReward: data.xpReward || 50,
        premiumOnly: data.premiumOnly || false,
        difficulty: data.difficulty || 'EASY',
        duration: data.duration || 15,
        accessibility: data.accessibility ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      poi,
    });
  } catch (error) {
    console.error('Error creating POI:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear POI' },
      { status: 500 }
    );
  }
}
