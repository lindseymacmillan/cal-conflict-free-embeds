import Context from './context';
import Modal from './components/modal';
import { useState } from 'react';

const App = ({cal, ical}) => {
    const [slot, setSlot] = useState(null);
    return (
        <Context.Provider value={{cal, ical, slot, setSlot}}>
            <Modal />
        </Context.Provider>
    );
}

export default App;