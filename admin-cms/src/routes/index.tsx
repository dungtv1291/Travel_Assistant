import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

// Auth
import { LoginPage } from '@/pages/LoginPage';

// Dashboard
import { DashboardPage } from '@/pages/DashboardPage';

// Destinations
import { DestinationsPage } from '@/pages/DestinationsPage';
import { DestinationCreatePage } from '@/pages/DestinationCreatePage';
import { DestinationEditPage } from '@/pages/DestinationEditPage';
import { PlacesPage } from '@/pages/PlacesPage';
import { PlaceCreatePage } from '@/pages/PlaceCreatePage';
import { PlaceEditPage } from '@/pages/PlaceEditPage';
import { DestinationTipsPage } from '@/pages/DestinationTipsPage';
import { DestinationTipCreatePage } from '@/pages/DestinationTipCreatePage';
import { DestinationTipEditPage } from '@/pages/DestinationTipEditPage';
import { EssentialAppsPage } from '@/pages/EssentialAppsPage';
import { EssentialAppCreatePage } from '@/pages/EssentialAppCreatePage';
import { EssentialAppEditPage } from '@/pages/EssentialAppEditPage';

// Hotels
import { HotelsPage } from '@/pages/HotelsPage';
import { HotelCreatePage } from '@/pages/HotelCreatePage';
import { HotelEditPage } from '@/pages/HotelEditPage';
import { HotelRoomsPage } from '@/pages/HotelRoomsPage';
import { HotelRoomCreatePage } from '@/pages/HotelRoomCreatePage';
import { HotelRoomEditPage } from '@/pages/HotelRoomEditPage';
import { HotelAmenitiesPage } from '@/pages/HotelAmenitiesPage';
import { HotelAmenityCreatePage } from '@/pages/HotelAmenityCreatePage';
import { HotelAmenityEditPage } from '@/pages/HotelAmenityEditPage';
import { HotelReviewsPage } from '@/pages/HotelReviewsPage';
import { HotelReviewCreatePage } from '@/pages/HotelReviewCreatePage';
import { HotelReviewEditPage } from '@/pages/HotelReviewEditPage';

// Transport
import { TransportsPage } from '@/pages/TransportsPage';
import { TransportCreatePage } from '@/pages/TransportCreatePage';
import { TransportEditPage } from '@/pages/TransportEditPage';
import { TransportDurationOptionsPage } from '@/pages/TransportDurationOptionsPage';
import { TransportDurationOptionCreatePage } from '@/pages/TransportDurationOptionCreatePage';
import { TransportDurationOptionEditPage } from '@/pages/TransportDurationOptionEditPage';
import { TransportPickupOptionsPage } from '@/pages/TransportPickupOptionsPage';
import { TransportPickupOptionCreatePage } from '@/pages/TransportPickupOptionCreatePage';
import { TransportPickupOptionEditPage } from '@/pages/TransportPickupOptionEditPage';

// Bookings
import { BookingsPage } from '@/pages/BookingsPage';
import { BookingDetailPage } from '@/pages/BookingDetailPage';
import { ItinerariesPage } from '@/pages/ItinerariesPage';
import { ItineraryDetailPage } from '@/pages/ItineraryDetailPage';
import { FavoritesPage } from '@/pages/FavoritesPage';

// Management
import { UsersPage } from '@/pages/UsersPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AiLogsPage } from '@/pages/AiLogsPage';
import { MediaUploadsPage } from '@/pages/MediaUploadsPage';
import { MediaUploadCreatePage } from '@/pages/MediaUploadCreatePage';

// 404
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  // Admin routes (auth-gated via AdminLayout)
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },

      // Destinations
      { path: '/destinations', element: <DestinationsPage /> },
      { path: '/destinations/new', element: <DestinationCreatePage /> },
      { path: '/destinations/:id/edit', element: <DestinationEditPage /> },

      // Places
      { path: '/places', element: <PlacesPage /> },
      { path: '/places/new', element: <PlaceCreatePage /> },
      { path: '/places/:id/edit', element: <PlaceEditPage /> },

      // Destination Tips
      { path: '/destination-tips', element: <DestinationTipsPage /> },
      { path: '/destination-tips/new', element: <DestinationTipCreatePage /> },
      { path: '/destination-tips/:id/edit', element: <DestinationTipEditPage /> },

      // Essential Apps
      { path: '/essential-apps', element: <EssentialAppsPage /> },
      { path: '/essential-apps/new', element: <EssentialAppCreatePage /> },
      { path: '/essential-apps/:id/edit', element: <EssentialAppEditPage /> },

      // Hotels
      { path: '/hotels', element: <HotelsPage /> },
      { path: '/hotels/new', element: <HotelCreatePage /> },
      { path: '/hotels/:id/edit', element: <HotelEditPage /> },

      // Hotel Rooms
      { path: '/hotel-rooms', element: <HotelRoomsPage /> },
      { path: '/hotel-rooms/new', element: <HotelRoomCreatePage /> },
      { path: '/hotel-rooms/:id/edit', element: <HotelRoomEditPage /> },

      // Hotel Amenities
      { path: '/hotel-amenities', element: <HotelAmenitiesPage /> },
      { path: '/hotel-amenities/new', element: <HotelAmenityCreatePage /> },
      { path: '/hotel-amenities/:id/edit', element: <HotelAmenityEditPage /> },

      // Hotel Reviews
      { path: '/hotel-reviews', element: <HotelReviewsPage /> },
      { path: '/hotel-reviews/new', element: <HotelReviewCreatePage /> },
      { path: '/hotel-reviews/:id/edit', element: <HotelReviewEditPage /> },

      // Transports
      { path: '/transports', element: <TransportsPage /> },
      { path: '/transports/new', element: <TransportCreatePage /> },
      { path: '/transports/:id/edit', element: <TransportEditPage /> },

      // Transport Duration Options
      { path: '/transport-duration-options', element: <TransportDurationOptionsPage /> },
      { path: '/transport-duration-options/new', element: <TransportDurationOptionCreatePage /> },
      { path: '/transport-duration-options/:id/edit', element: <TransportDurationOptionEditPage /> },

      // Transport Pickup Options
      { path: '/transport-pickup-options', element: <TransportPickupOptionsPage /> },
      { path: '/transport-pickup-options/new', element: <TransportPickupOptionCreatePage /> },
      { path: '/transport-pickup-options/:id/edit', element: <TransportPickupOptionEditPage /> },

      // Bookings
      { path: '/bookings', element: <BookingsPage /> },
      { path: '/bookings/:id', element: <BookingDetailPage /> },

      // Itineraries (read-only)
      { path: '/itineraries', element: <ItinerariesPage /> },
      { path: '/itineraries/:id', element: <ItineraryDetailPage /> },

      // Favorites (read-only)
      { path: '/favorites', element: <FavoritesPage /> },

      // Management
      { path: '/users', element: <UsersPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/media-uploads', element: <MediaUploadsPage /> },
      { path: '/media-uploads/new', element: <MediaUploadCreatePage /> },
      { path: '/ai-logs', element: <AiLogsPage /> },
    ],
  },
  // 404
  { path: '*', element: <NotFoundPage /> },
]);

