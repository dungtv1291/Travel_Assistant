import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, DollarSign, 
  AlertTriangle, Lightbulb, ArrowLeft, Eye, Bookmark
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';

import { Badge } from '@/components/ui/Badge';

import { formatDate, formatCurrency } from '@/utils';
import { 
  getItineraryDetail, 
  getDayTimelineItems, 
  getDayWarnings, 
  getDaySmartTips 
} from '@/services/itineraries.service';
import type { 
  ItineraryDetail, 
  ItineraryDay, 
  ItineraryTimelineItem, 
  ItineraryWarning, 
  ItinerarySmartTip 
} from '@/types';

interface DayDetail extends ItineraryDay {
  timeline: ItineraryTimelineItem[];
  warnings: ItineraryWarning[];
  smartTips: ItinerarySmartTip[];
}

export function ItineraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [itinerary, setItinerary] = useState<ItineraryDetail | null>(null);
  const [dayDetails, setDayDetails] = useState<DayDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDays, setLoadingDays] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadItinerary() {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        
        // Load basic itinerary detail
        const detail = await getItineraryDetail(parseInt(id));
        setItinerary(detail);

        // Load detailed day information
        setLoadingDays(true);
        const enrichedDays = await Promise.all(
          detail.days_data.map(async (day) => {
            const [timeline, warnings, smartTips] = await Promise.all([
              getDayTimelineItems(day.id).catch(() => []),
              getDayWarnings(day.id).catch(() => []),
              getDaySmartTips(day.id).catch(() => [])
            ]);

            return {
              ...day,
              timeline: timeline.sort((a, b) => a.sort_order - b.sort_order),
              warnings: warnings.sort((a, b) => a.sort_order - b.sort_order),
              smartTips: smartTips.sort((a, b) => a.order_no - b.order_no)
            };
          })
        );

        setDayDetails(enrichedDays);
      } catch (err) {
        console.error('Failed to load itinerary:', err);
        setError('Failed to load itinerary details. Please try again.');
      } finally {
        setLoading(false);
        setLoadingDays(false);
      }
    }

    loadItinerary();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div>
        <PageHeader
          title={`Itinerary #${id}`}
          subtitle="Itinerary not found or failed to load"
          actions={
            <Link to="/itineraries">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to list
              </Button>
            </Link>
          }
        />
        <div className="p-8 text-center border rounded-lg bg-white">
          <p className="text-slate-600">{error || 'Itinerary not found'}</p>
          {error && (
            <Button 
              variant="danger" 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={itinerary.title}
        subtitle={`Public ID: ${itinerary.public_id}`}
        actions={
          <Link to="/itineraries">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to list
            </Button>
          </Link>
        }
      />

      {/* Summary Section */}
      <div className="p-6 border rounded-lg bg-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Itinerary Summary
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">User ID:</span>
                  <span className="font-medium">#{itinerary.user_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Destination:</span>
                  <span className="font-medium">#{itinerary.destination_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Duration:</span>
                  <span className="font-medium">{itinerary.nights}N/{itinerary.days}D</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Start Date:</span>
                  <span className="font-medium">{itinerary.start_date || 'Not set'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-2">Preferences</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">{itinerary.traveler_type}</Badge>
                <Badge variant="neutral">{itinerary.budget_level}</Badge>
                <Badge variant="neutral">{itinerary.pace}</Badge>
              </div>
            </div>
          </div>

          {/* Interests & Styles */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Travel Styles</h3>
              <div className="flex flex-wrap gap-1">
                {itinerary.travel_styles.map((style, idx) => (
                  <Badge key={idx} variant="neutral">{style}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-1">
                {itinerary.interests.map((interest, idx) => (
                  <Badge key={idx} variant="neutral">{interest}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Settings</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Language:</span>
                  <span className="font-medium uppercase">{itinerary.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Currency:</span>
                  <span className="font-medium">{itinerary.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost & Status */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Cost Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Activities:</span>
                  <span className="font-medium">{itinerary.total_activities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Estimated Cost:</span>
                  <span className="font-medium">
                    {formatCurrency(itinerary.estimated_cost_amount, itinerary.estimated_cost_currency)}
                  </span>
                </div>
                {itinerary.budget_label && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Budget Label:</span>
                    <span className="font-medium">{itinerary.budget_label}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-2">Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Generated by:</span>
                  <Badge variant={itinerary.generated_by === 'ai' ? 'info' : 'neutral'}>
                    {itinerary.generated_by}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Saved:</span>
                  <div className="flex items-center">
                    <Bookmark 
                      className={`w-4 h-4 ${itinerary.is_saved ? 'text-yellow-500 fill-current' : 'text-slate-300'}`}
                    />
                    <span className="ml-1 text-sm">{itinerary.is_saved ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Created:</span>
                  <span className="font-medium">{formatDate(itinerary.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day-by-Day Details */}
      <div className="p-6 border rounded-lg bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Daily Itinerary ({itinerary.days} days)
          </h2>
          {loadingDays && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
        </div>

        <div className="space-y-6">
          {dayDetails.map((day) => (
            <div key={day.id} className="p-4 bg-slate-50 border rounded-lg">
              {/* Day Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-lg">
                    Day {day.day_number}: {day.title}
                  </h3>
                  <div className="text-sm text-slate-600 flex items-center gap-4">
                    {day.date_value && (
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(day.date_value)}
                      </span>
                    )}
                    {day.activity_count > 0 && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {day.activity_count} activities
                      </span>
                    )}
                    {day.estimated_cost_amount > 0 && (
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatCurrency(day.estimated_cost_amount, day.estimated_cost_currency)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Weather Info */}
                {day.weather_condition_label && (
                  <div className="text-right text-sm">
                    <div className="text-slate-600">{day.weather_condition_label}</div>
                    {day.weather_temperature_c && (
                      <div className="font-medium">{day.weather_temperature_c}°C</div>
                    )}
                  </div>
                )}
              </div>

              {/* Timeline Items */}
              {day.timeline.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-slate-900">Timeline</h4>
                  <div className="space-y-3">
                    {day.timeline.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                        <div className="flex-shrink-0 w-16 text-sm text-slate-600 font-mono">
                          {item.start_time}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium truncate">{item.title}</h5>
                            <Badge variant="neutral">{item.item_type}</Badge>
                            {item.booking_required && (
                              <Badge variant="warning">Booking Required</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {item.duration_minutes > 0 && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {item.duration_label || `${item.duration_minutes}min`}
                              </span>
                            )}
                            {item.location_name && (
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {item.location_name}
                              </span>
                            )}
                            {item.estimated_cost_amount && (
                              <span className="flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {item.estimated_cost_display || 
                                 formatCurrency(item.estimated_cost_amount, item.estimated_cost_currency || 'KRW')}
                              </span>
                            )}
                          </div>
                          {item.tip_text && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                              💡 {item.tip_text}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {day.warnings.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-slate-900 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1 text-amber-500" />
                    Warnings
                  </h4>
                  <div className="space-y-2">
                    {day.warnings.map((warning) => (
                      <div key={warning.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            {warning.title && (
                              <div className="font-medium text-amber-800 mb-1">{warning.title}</div>
                            )}
                            <div className="text-sm text-amber-700">{warning.text}</div>
                            {warning.count_value && (
                              <div className="text-xs text-amber-600 mt-1">
                                Count: {warning.count_value}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Tips */}
              {day.smartTips.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-slate-900 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-1 text-green-500" />
                    Smart Tips
                  </h4>
                  <div className="grid gap-2">
                    {day.smartTips.map((tip) => (
                      <div key={tip.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start">
                          <span className="text-green-600 font-medium mr-2">#{tip.order_no}</span>
                          <div className="text-sm text-green-700">{tip.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
