import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types/trip.types';
import { mockItineraries } from '../mock/itineraries';

interface TripsStore {
  savedTrips: Trip[];
  favorites: string[]; // destination ids
  recentSearches: string[];

  saveTrip: (trip: Trip) => void;
  removeTrip: (id: string) => void;
  toggleFavorite: (destinationId: string) => void;
  isFavorite: (destinationId: string) => boolean;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useTripsStore = create<TripsStore>()(
  persist(
    (set, get) => ({
  savedTrips: mockItineraries,
  favorites: ['dest-1', 'dest-3'],
  recentSearches: ['다낭', '호이안', '하롱베이'],

  saveTrip: (trip) =>
    set(state => ({ savedTrips: [trip, ...state.savedTrips] })),

  removeTrip: (id) =>
    set(state => ({ savedTrips: state.savedTrips.filter(t => t.id !== id) })),

  toggleFavorite: (destinationId) =>
    set(state => ({
      favorites: state.favorites.includes(destinationId)
        ? state.favorites.filter(id => id !== destinationId)
        : [...state.favorites, destinationId],
    })),

  isFavorite: (destinationId) => get().favorites.includes(destinationId),

  addRecentSearch: (query) =>
    set(state => ({
      recentSearches: [query, ...state.recentSearches.filter(s => s !== query)].slice(0, 10),
    })),

  clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: '@vt_trips',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedTrips: state.savedTrips,
        favorites: state.favorites,
        recentSearches: state.recentSearches,
      }),
    }
  )
);
