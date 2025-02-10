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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflowY: 'scroll',
    },
});

const Modal = () => {
    const [slot, setSlot] = useSlot();
    const classes = useStyles();
    return (
        <div className={classes.modal}>
            {slot === null ? <Calendar /> : <CalEmbed />}
        </div>
    );
}

export default Modal;