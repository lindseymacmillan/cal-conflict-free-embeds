import { useCal, useIcal, useSlot } from '../context';
import Calendar from './calendar';
import CalEmbed from './calembed';
import {createUseStyles} from 'react-jss'

const useStyles = createUseStyles({
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'flex-start',
        'overflow-y': 'scroll',
        'z-index': 1000,
    },
    bg: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        top: 0,
        left: 0,
        zIndex: -1,
    }
});

const Modal = () => {
    const [slot, setSlot] = useSlot();
    const classes = useStyles();

    const handleClose = () => {
        // Destroy the react app itself (removing the shadow DOM node it is attached to)
        // and then remove the shadow DOM node
        const root = document.getElementById('cal-conflict-free-embeds');
        root.remove();
    }
    return (
        <div className={classes.modal}>
            {slot === null ? <Calendar /> : <CalEmbed />}
            <div className={classes.bg} onClick={() => handleClose()}></div>
        </div>
    );
}

export default Modal;