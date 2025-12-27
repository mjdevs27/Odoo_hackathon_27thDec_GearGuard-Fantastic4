import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import DashboardNavbar from '../../components/DashboardNavbar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup the localizer
const localizer = momentLocalizer(moment);

interface MaintenanceEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    priority: string;
    stage: string;
    equipment: string;
    technician: string;
}

const MaintenanceCalendarPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<MaintenanceEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState<typeof Views[keyof typeof Views]>(Views.WEEK);

    // Fetch calendar events from API
    useEffect(() => {
        const fetchCalendarEvents = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/dashboard/calendar');
                const formattedEvents = res.data.map((event: any) => ({
                    id: event.id,
                    title: event.title,
                    start: new Date(event.start),
                    end: new Date(event.end),
                    priority: event.priority,
                    stage: event.stage,
                    equipment: event.equipment,
                    technician: event.technician
                }));
                setEvents(formattedEvents);
            } catch (error) {
                console.error('Error fetching calendar events:', error);
                setEvents([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCalendarEvents();
    }, []);

    // Event style based on priority
    const eventStyleGetter = useCallback((event: MaintenanceEvent) => {
        let backgroundColor = '#3b82f6';
        let borderColor = '#2563eb';

        switch (event.priority) {
            case 'URGENT':
                backgroundColor = '#ef4444';
                borderColor = '#dc2626';
                break;
            case 'HIGH':
                backgroundColor = '#f97316';
                borderColor = '#ea580c';
                break;
            case 'MEDIUM':
                backgroundColor = '#eab308';
                borderColor = '#ca8a04';
                break;
            case 'LOW':
                backgroundColor = '#22c55e';
                borderColor = '#16a34a';
                break;
        }

        return {
            style: {
                backgroundColor,
                borderColor,
                borderWidth: '2px',
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500'
            }
        };
    }, []);

    // Handle event click
    const handleSelectEvent = useCallback((event: MaintenanceEvent) => {
        navigate(`/dashboard/request/${event.id}`);
    }, [navigate]);

    // Handle navigation
    const handleNavigate = useCallback((date: Date) => {
        setCurrentDate(date);
    }, []);

    // Handle view change
    const handleViewChange = useCallback((view: typeof Views[keyof typeof Views]) => {
        setCurrentView(view);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <DashboardNavbar />

            {/* Main Content */}
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-slate-900">Maintenance Calendar</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        View and manage scheduled maintenance requests • {events.length} scheduled events
                    </p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                        <span className="text-xs text-slate-600">Urgent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-orange-500"></div>
                        <span className="text-xs text-slate-600">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-yellow-500"></div>
                        <span className="text-xs text-slate-600">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                        <span className="text-xs text-slate-600">Low</span>
                    </div>
                </div>

                {/* Calendar Container */}
                <div className="bg-white border border-slate-200 rounded-lg p-4" style={{ height: 'calc(100vh - 280px)' }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                        defaultView={Views.WEEK}
                        view={currentView}
                        date={currentDate}
                        onNavigate={handleNavigate}
                        onView={handleViewChange}
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventStyleGetter}
                        popup
                        selectable
                        toolbar={true}
                        formats={{
                            timeGutterFormat: 'HH:mm',
                            eventTimeRangeFormat: ({ start, end }) =>
                                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
                            agendaTimeRangeFormat: ({ start, end }) =>
                                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
                        }}
                        components={{
                            event: ({ event }) => (
                                <div className="px-1 py-0.5 truncate">
                                    <span className="font-medium">{event.title}</span>
                                    {event.technician && (
                                        <span className="ml-1 opacity-75">• {event.technician}</span>
                                    )}
                                </div>
                            )
                        }}
                    />
                </div>
            </div>

            {/* Custom CSS for calendar */}
            <style>{`
                .rbc-calendar { font-family: inherit; }
                .rbc-header { padding: 12px 8px; font-weight: 500; font-size: 13px; color: #475569; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; }
                .rbc-today { background-color: #eff6ff; }
                .rbc-off-range-bg { background-color: #fafafa; }
                .rbc-toolbar { padding: 8px 0; margin-bottom: 16px; }
                .rbc-toolbar button { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; color: #475569; border: 1px solid #e2e8f0; background: white; cursor: pointer; transition: all 0.15s; }
                .rbc-toolbar button:hover { background-color: #f1f5f9; }
                .rbc-toolbar button.rbc-active { background-color: #3b82f6; color: white; border-color: #3b82f6; }
                .rbc-toolbar-label { font-size: 16px; font-weight: 600; color: #1e293b; }
                .rbc-time-slot { font-size: 11px; color: #64748b; }
                .rbc-current-time-indicator { background-color: #ef4444; height: 2px; }
                .rbc-current-time-indicator::before { content: ''; position: absolute; left: -6px; top: -4px; width: 10px; height: 10px; border-radius: 50%; background-color: #ef4444; }
                .rbc-event { padding: 2px 6px; }
                .rbc-event:focus { outline: none; }
                .rbc-day-slot .rbc-event { border: none; }
            `}</style>
        </div>
    );
};

export default MaintenanceCalendarPage;
