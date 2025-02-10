import { createContext, useContext } from 'react';

const Context = createContext();

export const useSlot = () => {
    return [
        useContext(Context).slot,
        useContext(Context).setSlot
    ]
}

export const useCal = () => {
    return useContext(Context).cal;
}

export const useIcal = () => {
    return useContext(Context).ical;
}

export default Context;