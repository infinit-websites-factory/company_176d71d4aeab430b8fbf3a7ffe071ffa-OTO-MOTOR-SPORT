import type { VercelRequest, VercelResponse } from '@vercel/node';

const CARS_API_URL = 'https://multipost-public.app.infinit.cc/api/public/inventory/profiles/30f6c1b4-198d-4222-9ff4-f1e078c5be08';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  mileageUnit: string;
  fuel: string;
  transmission: string;
  images: string[];
}

async function fetchVehicleData(id: string): Promise<Vehicle | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(CARS_API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[PREVIEW] API returned status: ${response.status}`);
      return null;
    }

    const carsResponse = await response.json();
    const cars = carsResponse.items || carsResponse; // Support both new paginated format and old format
    const apiCar = cars.find((car: any) => car.id === id);

    if (!apiCar) {
      return null;
    }

    const fuelTranslations: Record<string, string> = {
      'Diesel': 'Diésel',
      'Petrol': 'Gasolina',
      'Hybrid': 'Híbrido',
      'Electric': 'Eléctrico',
      'Electricity': 'Eléctrico',
      'Hydrogen': 'Hidrógeno',
      'Biofuels': 'Biocombustibles',
      'CNG': 'GNC',
      'LPG': 'GLP',
      'Other': 'Otro',
    };

    const transmissionTranslations: Record<string, string> = {
      'Automatic': 'Automático',
      'Manual': 'Manual',
    };

    // Parse registration year from registration_date
    const registrationYear = apiCar.registration_date
      ? new Date(apiCar.registration_date).getFullYear()
      : new Date().getFullYear();

    const vehicle = {
      id: apiCar.id,
      brand: apiCar.make || 'Unknown',
      model: apiCar.model || 'Unknown',
      year: registrationYear,
      price: apiCar.price_cents ? apiCar.price_cents / 100 : 0,
      mileage: apiCar.odometer?.value || 0,
      mileageUnit: apiCar.odometer?.unit || 'km',
      fuel: fuelTranslations[apiCar.fuel] || apiCar.fuel || 'Desconocido',
      transmission: transmissionTranslations[apiCar.transmission] || apiCar.transmission || 'Desconocido',
      images: apiCar.photo_urls?.length > 0 ? apiCar.photo_urls : [],
    };

    console.log('[PREVIEW] Transformed vehicle:', JSON.stringify(vehicle, null, 2));
    return vehicle;
  } catch (error) {
    console.error('[PREVIEW] Error fetching vehicle data:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    const userAgent = req.headers['user-agent'] || '';
    const path = req.url || '';

    console.log(`[PREVIEW] Request from: ${userAgent}`);
    console.log(`[PREVIEW] Path: ${path}`);

    if (!id || typeof id !== 'string') {
      console.log('[PREVIEW] No ID provided');
      return res.status(400).send('<h1>Error</h1><p>Vehicle ID is required. Format: /api/preview?id=VEHICLE_ID</p>');
    }

    console.log(`[PREVIEW] Request for vehicle ${id}`);
    console.log(`[PREVIEW] Starting to fetch vehicle data...`);

    const vehicle = await fetchVehicleData(id);

    if (!vehicle) {
      console.log(`[PREVIEW] Vehicle ${id} not found in API response`);
      return res.status(404).send('<h1>Vehicle not found</h1><p>Redirecting...</p><script>setTimeout(() => window.location.href = "/buy", 2000)</script>');
    }

    console.log(`[PREVIEW] Found vehicle: ${vehicle.brand} ${vehicle.model}`);

    const formattedPrice = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(vehicle.price || 0);

    const mileageText = vehicle.mileage ? `${vehicle.mileage.toLocaleString('es-ES')} ${vehicle.mileageUnit}` : 'Consultar';

    // Build title parts, filtering out undefined/empty values
    const titleParts = [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean);
    const pageTitle = `${titleParts.join(' ')} - ${formattedPrice} | OTO MOTOR`;

    // Build description parts
    const descParts = [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean);
    const pageDescription = `${descParts.join(' ')} - ${mileageText}, ${vehicle.fuel}, ${vehicle.transmission}. Vehículo de alta gama disponible en OTO MOTOR Brunete, Madrid.`;

    const pageUrl = `https://otomotor.infinit.cc/buy/${id}`;
    let carImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : 'https://otomotor.infinit.cc/placeholder.svg';

    // Use Vercel Image Optimization to resize images for WhatsApp compatibility (max 600KB recommended)
    // Resize to 1600px width to ensure file size stays under 600KB
    if (carImage && carImage.includes('alxproduction.blob.core.windows.net')) {
      const encodedUrl = encodeURIComponent(carImage);
      carImage = `https://otomotor.infinit.cc/_vercel/image?url=${encodedUrl}&w=1600&q=80`;
    }

    // Serve static HTML with meta tags for previews (only bots reach this function now)
    const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="https://otomotor.infinit.cc/favicon.png" />
    <link rel="shortcut icon" type="image/png" href="https://otomotor.infinit.cc/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDescription}" />

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDescription}" />
    <meta property="og:image" content="${carImage}" />
    <meta property="og:image:secure_url" content="${carImage}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${titleParts.join(' ')}" />
    <meta property="og:site_name" content="OTO MOTOR" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDescription}" />
    <meta name="twitter:image" content="${carImage}" />

    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 50px auto;
        padding: 20px;
        background: #f5f5f5;
      }
      .card {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      img {
        max-width: 100%;
        border-radius: 4px;
        margin: 20px 0;
      }
      h1 { color: #333; margin: 0 0 10px 0; }
      .price { color: #e63946; font-size: 24px; font-weight: bold; margin: 15px 0; }
      .specs { color: #666; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${titleParts.join(' ')}</h1>
      <div class="price">${formattedPrice}</div>
      <img src="${carImage}" alt="${vehicle.brand} ${vehicle.model}" />
      <div class="specs">
        <p><strong>Kilometraje:</strong> ${mileageText}</p>
        <p><strong>Combustible:</strong> ${vehicle.fuel || 'N/A'}</p>
        <p><strong>Transmisión:</strong> ${vehicle.transmission || 'N/A'}</p>
      </div>
    </div>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

    console.log(`[PREVIEW] Sending preview for ${vehicle.brand} ${vehicle.model}`);
    return res.status(200).send(html);
  } catch (error) {
    console.error('[PREVIEW] Error in handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[PREVIEW] Error details:', errorMessage, errorStack);
    return res.status(500).send(`<h1>Error loading preview</h1><p>${errorMessage}</p><pre style="background:#f5f5f5;padding:10px;overflow:auto;">${errorStack}</pre>`);
  }
}
