export interface CarApiResponse {
  id: string;
  title: string;
  ad_description: string;
  price_cents: number;
  currency_code: string;
  status: string;
  make: string;
  model: string;
  previous_price_cents?: number | null;
  financed_price_cents?: number | null;
  monthly_installments_cents?: number | null;
  registration_date: string;
  odometer: {
    value: number;
    unit: string;
  };
  fuel: string;
  transmission: string;
  body_type: string;
  color: string;
  num_doors: number;
  num_seats: number;
  engine_size: number | null;
  engine_size_unit?: string;
  engine_power: number;
  photo_urls: string[];
  created_at: string;
  updated_at: string;
  days_in_stock: number;
  country_details?: {
    country_code: string;
    environmental_badge: string;
  };
}

export interface PaginatedCarsApiResponse {
  items: CarApiResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export type CarsApiResponse = CarApiResponse[];

export interface Vehicle {
  id: string;
  images: string[];
  brand: string;
  model: string;
  year: number;
  price: number;
  financedPrice?: number;
  mileage: number;
  mileageUnit: string;
  fuel: string;
  transmission: string;
  type: string;
  status: string;
  description?: string;
  color?: string;
  doors?: number;
  seats?: number;
  engineSize?: number | null;
  engineSizeUnit?: string;
  enginePower?: number;
  createdAt: string;
  updatedAt: string;
  environmentalBadge?: string;
}

// Default fallback profile ID
const DEFAULT_PROFILE_ID = '30f6c1b4-198d-4222-9ff4-f1e078c5be08';

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Extract profile ID from subdomain if domain is infinitsite.com
 * Returns the profile ID if valid UUID, otherwise returns default
 */
const getProfileIdFromSubdomain = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE_ID;
  }

  const hostname = window.location.hostname;

  if (!hostname.endsWith('.infinitsite.com')) {
    return DEFAULT_PROFILE_ID;
  }

  const subdomain = hostname.replace('.infinitsite.com', '');

  if (UUID_REGEX.test(subdomain)) {
    console.log('Using profile ID from subdomain:', subdomain);
    return subdomain;
  }

  console.log('Subdomain is not a valid UUID, using default profile ID');
  return DEFAULT_PROFILE_ID;
};

// Get the profile ID (either from subdomain or default)
export const PROFILE_ID = getProfileIdFromSubdomain();

// API endpoints using the dynamic profile ID
const API_BASE_URL = 'https://multipost-public.app.infinit.cc';
const API_URL = `${API_BASE_URL}/api/public/inventory/profiles/${PROFILE_ID}`;
export const CONTACT_FORM_API_URL = `${API_BASE_URL}/api/interactions/contact-form`;
export const GOOGLE_REVIEWS_API_URL = `${API_BASE_URL}/api/public/dealers/by-profile/${PROFILE_ID}/google-reviews`;

// Google Place ID for this dealer (source of the reviews above)
export const GOOGLE_PLACE_ID = 'ChIJlYyVEHiNQQ0R4fcdCdaq-ik';

export interface GoogleReview {
  author: string;
  photoUri?: string;
  authorUri?: string;
  rating: number;
  relativeTime?: string;
  reviewUri?: string;
}

export interface GoogleReviewsData {
  rating: number;
  count: number;
  reviews: GoogleReview[];
}

export const fetchGoogleReviews = async (): Promise<GoogleReviewsData> => {
  const response = await fetch(GOOGLE_REVIEWS_API_URL, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Google reviews API call failed with status: ${response.status}`);
  }

  const json = await response.json();
  const data = json?.result?.data ?? {};
  const sample: any[] = Array.isArray(data.google_reviews_sample) ? data.google_reviews_sample : [];

  return {
    rating: Number(data.google_rating) || 0,
    count: Number(data.google_review_count) || 0,
    reviews: sample.map((r) => ({
      author: r?.authorAttribution?.displayName || 'Google',
      photoUri: r?.authorAttribution?.photoUri,
      authorUri: r?.authorAttribution?.uri,
      rating: Number(r?.rating) || 0,
      relativeTime: r?.relativePublishTimeDescription,
      reviewUri: r?.googleMapsUri,
    })),
  };
};

export interface CompanyInfo {
  vehiclesInStock: number;
  googleRating: number;
  reviewCount: number;
}

/**
 * Aggregate real dealership figures from the public endpoints (live inventory
 * count + real Google rating/review count). There is no dedicated company-info
 * endpoint, so we compose verifiable numbers instead of inventing metrics.
 */
export const fetchCompanyInfo = async (): Promise<CompanyInfo> => {
  const [inventory, reviews] = await Promise.all([
    fetch(`${API_URL}?page=1`, { headers: { accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : { total: 0 }))
      .catch(() => ({ total: 0 })),
    fetchGoogleReviews().catch(() => ({ rating: 0, count: 0, reviews: [] })),
  ]);

  return {
    vehiclesInStock: Number(inventory?.total) || 0,
    googleRating: reviews.rating || 0,
    reviewCount: reviews.count || 0,
  };
};

const fetchCarsPage = async (page: number): Promise<PaginatedCarsApiResponse> => {
  const response = await fetch(`${API_URL}?page=${page}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'cache-control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  return response.json();
};

/**
 * Server-side paginated fetch. Builds a query string from the given params,
 * skipping empty/undefined values, and returns a single page of results.
 * Used for infinite-scroll dropdowns/listings so we never load every car at once.
 */
export const fetchCarsPaginated = async (
  params: { page?: number; size?: number; search?: string } = {}
): Promise<PaginatedCarsApiResponse> => {
  const url = new URL(API_URL);
  Object.entries({ page: 1, size: 30, ...params }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'cache-control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }

  return response.json();
};

// The inventory API is capped at 50 items per page, so fetch every page and
// merge them — otherwise vehicles beyond the first page are unreachable.
export const fetchCars = async (): Promise<PaginatedCarsApiResponse> => {
  const first = await fetchCarsPage(1);
  const items = [...(first.items ?? [])];

  const totalPages = first.pages || 1;
  for (let page = 2; page <= totalPages; page++) {
    const next = await fetchCarsPage(page);
    if (!next.items?.length) break;
    items.push(...next.items);
  }

  return { ...first, items, total: first.total ?? items.length };
};

export const transformApiCarToVehicle = (apiCar: CarApiResponse): Vehicle => {
  const registrationYear = apiCar.registration_date
    ? new Date(apiCar.registration_date).getFullYear()
    : new Date().getFullYear();

  const badgeValue = apiCar.country_details?.environmental_badge;

  return {
    id: apiCar.id,
    images: apiCar.photo_urls?.length > 0 ? apiCar.photo_urls : ['/placeholder.svg'],
    brand: apiCar.make || 'Unknown',
    model: apiCar.model || 'Unknown',
    year: registrationYear,
    price: apiCar.price_cents ? apiCar.price_cents / 100 : 0,
    financedPrice: apiCar.financed_price_cents ? apiCar.financed_price_cents / 100 : undefined,
    mileage: apiCar.odometer?.value || 0,
    mileageUnit: apiCar.odometer?.unit || 'km',
    fuel: apiCar.fuel || 'Unknown',
    transmission: apiCar.transmission || 'Unknown',
    type: apiCar.body_type || 'Unknown',
    status: apiCar.status || 'Published',
    description: apiCar.ad_description,
    color: apiCar.color,
    doors: apiCar.num_doors,
    seats: apiCar.num_seats,
    engineSize: apiCar.engine_size,
    engineSizeUnit: apiCar.engine_size_unit || 'cc',
    enginePower: apiCar.engine_power,
    createdAt: apiCar.created_at,
    updatedAt: apiCar.updated_at,
    environmentalBadge: badgeValue
  };
};
