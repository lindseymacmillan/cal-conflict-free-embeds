import Context from './context';
import Modal from './components/modal';
import { useState } from 'react';
import { JssProvider } from 'react-jss';

const App = ({cal, ical, jss}) => {
    const [slot, setSlot] = useState(null);
    return (
        <JssProvider jss={jss}>
            <Context.Provider value={{cal, ical, slot, setSlot}}>
                <Modal />
            </Context.Provider>
        </JssProvider>
    );
}

export default App;