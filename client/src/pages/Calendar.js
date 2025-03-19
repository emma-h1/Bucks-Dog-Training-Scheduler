import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import axios from 'axios';

import "./calendar.css"; // Import CSS for event styling

export default function Calendar() {
    // State to store fetched events
    const [events, setEvents] = useState([]);
    const [openInfo, setOpenInfo] = useState(false);

    useEffect(() => {
        // Fetch appointments from the backend
        const fetchAppointments = async () => {
            try {
                const response = await axios.get('/api/appointments');
                const fetchedEvents = response.data.map(appointment => ({
                    id: appointment.id,
                    title: `Trainer: ${appointment.trainer} - Dog: ${appointment.dog}`, 
                    start: new Date(appointment.startTime), // Convert to Date
                    end: new Date(appointment.endTime), // Convert to Date
                    extendedProps: {
                        owner: appointment.owner,
                        location: appointment.location,
                        purpose: appointment.purpose,
                        balanceDue: appointment.balanceDue
                    }
                }));
                setEvents(fetchedEvents);
            } catch (error) {
                console.error("Error fetching appointments:", error);
            }
        };

        fetchAppointments();
    }, []);

    return (
        <div className="m-3 p-4 bg-white">
            <FullCalendar
                headerToolbar={{
                    center: 'dayGridMonth,timeGridWeek,timeGridDay',
                    end: 'listWeek today prev,next'
                }}
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
                initialView="dayGridMonth"
                events={events} // Use fetched events
                slotMinTime="06:00:00"
                slotMaxTime="18:00:00"
                height="750px"
                nowIndicator={true}
                eventContent={(arg) => (
                    <div className="fc-event-content">
                        <div>{arg.event.title}</div>
                    </div>
                )}
                
                
            />
            <Dialog open={openInfo}>
                <DialogTitle>Info</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You don't own this event!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenInfo(false)}>Ok</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
