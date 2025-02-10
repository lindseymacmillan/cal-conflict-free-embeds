import App from './app';
import React from 'react';
import { createRoot } from 'react-dom/client';

const triggerEls = document.querySelectorAll('[data-cal][data-ical]');
for (const el of triggerEls) {
  el.addEventListener('click', () => {
    // Create a container for the modal
    const modalContainer = document.createElement('div');
    document.body.appendChild(modalContainer);

    const cal = el.getAttribute('data-cal');
    const ical = el.getAttribute('data-ical');

    // Render the Modal component
    const root = createRoot(modalContainer);
    root.render(<App cal={cal} ical={ical} />);
  });
}