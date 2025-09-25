export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  description: string;
  image: string;
  images: string[];
  price?: number;
  budget: 'low' | 'medium' | 'high';
  type: 'beach' | 'mountain' | 'city' | 'countryside' | 'culture' | 'nature';
  activities: Activity[];
  coordinates: {
    lat: number;
    lng: number;
  };
  bestTimeToVisit: string[];
  duration: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: string;
  price?: number;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  favorites: string[]; // ID delle destinazioni
  itinerary: ItineraryItem[];
}

export interface ItineraryItem {
  id: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  notes?: string;
  addedAt: string;
}

export type FilterType = {
  continent: string;
  budget: string;
  type: string;
  search: string;
};

export type SortType = 'name' | 'popularity';