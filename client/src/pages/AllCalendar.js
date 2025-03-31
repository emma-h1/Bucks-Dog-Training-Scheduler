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

import "./calendar.css";

export default function AllCalendar() {
    const [events, setEvents] = useState([]);
    const [openInfo, setOpenInfo] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch data concurrently
                const [appointmentsResponse, dogsResponse, trainersResponse] = await Promise.all([
                    axios.get('/api/appointments'),
                    axios.get('http://localhost:4999/api/dogs'),
                    axios.get('http://localhost:4999/api/trainers')
                ]);

                const dogs = dogsResponse.data;
                const trainers = trainersResponse.data;

                // Map appointments with resolved names
                const fetchedEvents = appointmentsResponse.data.map(appointment => {
                    // Find dog and trainer names
                    const dog = dogs.find(d => d.id === appointment.dog);
                    const trainer = trainers.find(t => t.id === appointment.trainer);

                    return {
                        id: appointment.id,
                        title: `Trainer: ${trainer ? `${trainer.firstName} ${trainer.lastName}` : 'Unknown Trainer'} - Dog: ${dog ? dog.name : 'Unknown Dog'}`,
                        start: new Date(appointment.startTime),
                        end: new Date(appointment.endTime),
                        extendedProps: {
                            owner: appointment.owner,
                            location: appointment.location,
                            purpose: appointment.purpose,
                            balanceDue: appointment.balanceDue
                        }
                    };
                });

                setEvents(fetchedEvents);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchAllData();
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
                events={events}
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