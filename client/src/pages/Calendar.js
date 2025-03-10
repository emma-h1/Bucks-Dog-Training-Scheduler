import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from '@fullcalendar/list';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { auth } from '../firebase'

export default function Calendar() {
    // Variables for adding event
    const [title, setTitle] = useState("")
    const [event, setEvent] = useState({})


    // Add event popup
    const [open, setOpen] = useState(false);

    // Delete event popup
    const [openDelete, setOpenDelete] = useState(false);

    // Info popup
    const [openInfo, setOpenInfo] = useState(false);

    const handleClickOpen = (arg) => {
        // Open popup
        setOpen(true);
        console.log(arg)
        setEvent(arg)
        console.log(event)
    };

    // Close add popup
    const handleClose = () => {
        setOpen(false);
    };

    // Clode delete popup
    const handleCloseDelete = () => {
        setOpenDelete(false);
    };

    const handleCloseInfo = () => {
        setOpenInfo(false);
    };



    const handleDateClick = (arg) => {
        handleClickOpen(arg)
    }


    const handleEventClick = (arg) => {
        setOpenDelete(true)
        setEvent(arg)
    }


    return (
        <div className="m-3 p-4 bg-white">
            <FullCalendar
                headerToolbar={{
                    center: 'dayGridMonth,timeGridWeek,timeGridDay',
                    end: 'listWeek today prev,next'
                }}
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
                initialView="dayGridMonth"
                dateClick={handleDateClick}

                weekends={true}
                editable
                eventClick={handleEventClick}
                slotMinTime="06:00:00"
                slotMaxTime="18:00:00"
                height="750px"
                nowIndicator={true}
            />
            <div>
                <Dialog open={openInfo}>
                    <DialogTitle>Info</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            You don't own this event!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseInfo}>Ok</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    )
}