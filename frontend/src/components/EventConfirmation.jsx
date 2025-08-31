import React from 'react';

const EventConfirmation = ({ event, onBack, onConfirm, isLoading }) => {
    console.log("Event data in confirmation:", event); // Debug log
    
    const formatDate = (dateString) => {
        try {
            if (!dateString) return "Invalid date";
            
            // Parse the date string from backend
            const date = new Date(dateString);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.error("Invalid date:", dateString);
                return "Invalid date";
            }
            
            // Format for display: "September 2, 2025, 1:00 PM"
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            console.error('Date formatting error:', e, dateString);
            return "Invalid date";
        }
    };

    // Safe extraction of event properties with fallbacks
    const eventTitle = event?.title || "Untitled Event";
    const eventStart = event?.start || "";
    const eventDuration = event?.duration_minutes || event?.duration || 60;
    const eventDescription = event?.description || "";

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6">Event Confirmation</h2>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-4">Event Details</h3>
                <div className="space-y-3">
                    <div className="flex items-center">
                        <strong className="w-24">Title:</strong>
                        <span>{eventTitle}</span>
                    </div>
                    <div className="flex items-center">
                        <strong className="w-24">Date & Time:</strong>
                        <span>{formatDate(eventStart)}</span>
                    </div>
                    <div className="flex items-center">
                        <strong className="w-24">Duration:</strong>
                        <span>{eventDuration} minutes</span>
                    </div>
                    {eventDescription && (
                        <div className="flex items-start">
                            <strong className="w-24">Description:</strong>
                            <span>{eventDescription}</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex justify-between">
                <button
                    onClick={onBack}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                    Back to Recording
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Creating Event...' : 'Confirm Event'}
                </button>
            </div>
        </div>
    );
};

export default EventConfirmation;