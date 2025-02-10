import App from './app';
import React from 'react';
import { createRoot } from 'react-dom/client';
import preset from 'jss-preset-default';
import { create } from 'jss';


const triggerEls = document.querySelectorAll('[data-cal][data-ical]');
for (const el of triggerEls) {
  el.addEventListener('click', () => {
    // Create a container for the modal
    const modalContainer = document.createElement('div');
    modalContainer.setAttribute('id', 'cal-conflict-free-embeds');
    document.body.appendChild(modalContainer);

    // Create Shadow DOM
    const shadowRoot = modalContainer.attachShadow({ mode: 'open' });
    const shadowContainer = document.createElement('div');
    shadowRoot.appendChild(shadowContainer);

    const styleNode = document.createElement('span')
    shadowRoot.appendChild(styleNode)

    const jss = create({
      // insertionPoint can be an Element or a selector string. 
      // If it’s a string, JSS will look for a node in `document`, so pass the actual node:
      insertionPoint: styleNode,
      plugins: [...preset().plugins],
    })

    const cal = el.getAttribute('data-cal');
    const ical = el.getAttribute('data-ical');

    const root = createRoot(shadowContainer);
    root.render(<App cal={cal} ical={ical} jss={jss} />);
  });
}