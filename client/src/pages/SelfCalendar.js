import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

import axios from 'axios';
import { auth } from '../firebase';

import "./calendar.css";

export default function SelfCalendar({ selectedDog }) {
    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          if (user) {
            fetchUserData();
          } else {
          }
        });
        return () => unsubscribe();
    }, []);

    // Filter events when selectedDog changes
    useEffect(() => {
        if (selectedDog) {
            // Filter events to only show the selected dog's appointments
            const filteredEvents = allEvents.filter(event => 
                event.extendedProps.dogID === selectedDog
            );
            setEvents(filteredEvents);
        } else {
            // If no dog is selected, show all events
            setEvents(allEvents);
        }
    }, [selectedDog, allEvents]);

    const fetchUserData = async () => {
        try {
            // Fetch data concurrently
            const [appointmentsResponse, dogsResponse, trainersResponse] = await Promise.all([
                axios.get(`/api/appointments?owner=${auth.currentUser.uid}`),
                axios.get(`http://localhost:4999/api/dogs?ownerID=${auth.currentUser.uid}`),
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
                        balanceDue: appointment.balanceDue,
                        dogID: appointment.dog // Store dogId for filtering
                    }
                };
            });

            setAllEvents(fetchedEvents); // Store all events
            setEvents(fetchedEvents);    // Initially display all events
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

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
        </div>
    );
}