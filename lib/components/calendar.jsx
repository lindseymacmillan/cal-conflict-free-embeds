import { useIcal, useSlot } from '../context';
import { useEffect, useState } from 'react';
import ICAL from 'ical.js';
import ReactCalendar from 'react-calendar'
import {createUseStyles} from 'react-jss'
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const useStyles = createUseStyles({
    container: {
        border: '1px solid rgb(209, 213, 219)',
        display: 'grid',
        gridTemplateColumns: 'calc(420px - 12px) calc(340px - 12px)',
        width: '760px',
        backgroundColor: 'white',
        padding: '24px',
        fontFamily: 'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
        borderRadius: '6px',
        gap: '24px',
        '@media (max-width: 1024px)': {
            gridTemplateColumns: 'calc(396px - 12px) calc(240px - 12px)',
            width: '636px'
        },
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'calc(100% - 12px)',
            width: '100%',
            minHeight: '100%',
        }
    },
    timeSlots: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    timeSlot: {
        border: '1px solid rgb(209, 213, 219)',
        fontFamily: 'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
        borderRadius: '6px',
        padding: '12px',
        backgroundColor: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        color: 'rgb(56, 66, 82)',
        '&:hover': {
            borderColor: 'rgb(41,41,41)',
        },
        '&:disabled': {
            pointerEvents: 'none',
            cursor: 'not-allowed',
            color: 'rgb(209, 213, 219)',
        }
    },
    calendar: {
      backgroundColor: 'white',
      '& .react-calendar__month-view__weekdays__weekday': {
        textAlign: 'center',
        fontFamily: 'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',        textTransform: 'uppercase',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        paddingBottom: '12px',
        '& abbr': {
            textDecoration: 'none',
        }
      },
    },
    tile: {
        aspectRatio: '1/1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '60px',
        background: 'none',
        borderRadius: '6px',
        pointerEvents: 'none',
        border: '2px solid white',
        transform: 'scale(0.9)',
    },
    today: {
        fontWeight: 'bold',
    },
    past: {
        color: 'rgb(229, 231, 235)!important',
        backgroundColor: 'white!important',
        borderColor: 'white!important',
        pointerEvents: 'none',
    },
    available: {
        pointerEvents: 'auto',
        background: 'rgb(229, 231, 235)',
        cursor: 'pointer',
        border: '2px solid rgb(229, 231, 235)',
        '&:hover': {
            border: '2px solid white',
        }
    },
    selected: {
        background: 'rgb(41,41,41)',
        border: '2px solid rgb(41,41,41)',
        color: 'white',
    }
});

const Calendar = () => {
    const classes = useStyles()
    const ical = useIcal();
    const [slot, setSlot] = useSlot();
    const [viewStart, setViewStart] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [viewEnd, setViewEnd] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 0);
    });
    const [bookings, setBookings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const timeSlots = {
        'morning': { start: 8, end: 11, label: 'Morning (8-11am)' },
        'late-morning': { start: 11, end: 14, label: 'Late Morning (11am-2pm)' },
        'afternoon': { start: 14, end: 17, label: 'Afternoon (2-5pm)' },
        'evening': { start: 18, end: 21, label: 'Evening (6-9pm)' }
    }

    const getFirstAvailableDateThisMonth = () => {
        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        for (let i = 0; i < 31; i++) {
            if (hasAnyAvailableTimeSlots(date)) {
                return date;
            }
            date.setDate(date.getDate() + 1);
        }
        return null;
    }

    const isTimeSlotAvailable = (slot, date) => {
        // Check if the date is in the past
        if (date < new Date() && date.toDateString() !== new Date().toDateString()) {
            return false;
        }
        const {start, end} = timeSlots[slot];
        const startOfTimeslot = new Date(date.getFullYear(), date.getMonth(), date.getDate(), start);
        const endOfTimeslot = new Date(date.getFullYear(), date.getMonth(), date.getDate(), end);
        const bookingsForDate = bookings.filter(booking => {
            return booking.startDate < endOfTimeslot && booking.endDate > startOfTimeslot;
        });
        return bookingsForDate.length > 0 ? false : true;
    }

    const hasAnyAvailableTimeSlots = (date) => {
        return Object.keys(timeSlots).some(slot => isTimeSlotAvailable(slot, date));
    }

    useEffect(() => {
        // Use the ical data to gather the events for the current view start and end
        const fetchIcal = async () => {
            const response = await fetch(`https://corsproxy.io/?key=0cca3590&url=${ical}`, {
                method: "GET",
                cache: "no-store",
                mode: "cors"
            });
            const data = await response.text();
            const jcalData = ICAL.parse(data);
            // Create an ICAL Component
            const component = new ICAL.Component(jcalData);
            
            // Get all VEVENT components
            const vevents = component.getAllSubcomponents('vevent');

            const newBookings = [];
            
            // Extract data from each VEVENT
            vevents.forEach(vevent => {
                // Create an ICAL Event
                const event = new ICAL.Event(vevent);
                
                const summary = event.summary;
                const startDate = event.startDate.toJSDate();
                const endDate = event.endDate.toJSDate();

                if (startDate < viewStart || endDate > viewEnd) {
                    return;
                }

                const booking = { summary, startDate, endDate };
                newBookings.push(booking);
            });

            setBookings(newBookings);
        }
        fetchIcal();
    }, [ical, viewStart, viewEnd]);

    useEffect(() => {
        const firstAvailableDate = getFirstAvailableDateThisMonth();
        if (firstAvailableDate && firstAvailableDate.toDateString() !== selectedDate.toDateString()) {
            setSelectedDate(firstAvailableDate);
        }
    }, [bookings]);

    return (
        <div className={classes.container}>
            <div>
                <div style={{fontFamily: 'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
                    <span style={{flex: 1}}>
                        <b>{selectedDate.toLocaleDateString('en-US', {month: 'long'})}</b> {selectedDate.toLocaleDateString('en-US', {year: 'numeric'})}
                    </span>
                    <button style={{background: 'none', border: 'none'}} onClick={() => {
                        // Set the selected date to the first day of the previous month
                        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
                        // Set the start and end of the view to the previous month
                        setViewStart(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
                        setViewEnd(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 0));
                    }}><FaChevronLeft/></button>
                    <button style={{background: 'none', border: 'none'}} onClick={() => {
                        // Set the selected date to the first day of the next month
                        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
                        // Set the start and end of the view to the next month
                        setViewStart(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
                        setViewEnd(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 2, 0));
                    }}><FaChevronRight/></button>
                </div>
                <ReactCalendar 
                    calendarType="gregory"
                    showNavigation={false}
                    showNeighboringMonth={false}
                    className={classes.calendar} 
                    onChange={(val) => setSelectedDate(val)}
                    value={selectedDate}
                    activeStartDate={viewStart}
                    tileClassName={({date, view}) => {
                        let tileClass = `${classes.tile}`;
                        if (view === 'month' && date.toDateString() === new Date().toDateString()) {
                            tileClass += ` ${classes.today}`;
                        }
                        if (hasAnyAvailableTimeSlots(date) && date >= new Date()) {
                            tileClass += ` ${classes.available}`;
                        }
                        if (date.toDateString() === selectedDate.toDateString()) {
                            tileClass += ` ${classes.selected}`;
                        }
                        if (date < new Date() && date.toDateString() !== new Date().toDateString()) {
                            tileClass += ` ${classes.past}`;
                        }
                        return tileClass;
                    }}
                />
            </div>
            <div>
                <div style={{fontFamily: 'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"', display: 'flex', alignItems: 'center', marginBottom: '16px'}}>
                    <span>
                        <b>{selectedDate.toLocaleDateString('en-US', {weekday: 'short'})}</b> {selectedDate.toLocaleDateString('en-US', {day: 'numeric'})}
                    </span>
                </div>
                <div className={classes.timeSlots}>
                    {Object.keys(timeSlots).map(slot => {
                        const {start, end, label} = timeSlots[slot];
                        const available = isTimeSlotAvailable(slot, selectedDate);
                        const handleClick = () => {
                            const year = selectedDate.getFullYear();
                            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                            const day = String(selectedDate.getDate()).padStart(2, '0');
                            // Add 6 hours to the start time to get time in UTC
                            const startTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), start);
                            const hour = String(startTime.getUTCHours()).padStart(2, '0');
                            const newSlot = `${year}-${month}-${day}T${hour}:00:00.000Z`;
                            console.log('newSlot', newSlot);
                            setSlot(newSlot);
                        };
                        return <button key={slot} className={classes.timeSlot} onClick={() => handleClick()} disabled={!available}>{label}</button>
                    })}
                </div>
            </div>
        </div>
    );
}

export default Calendar;