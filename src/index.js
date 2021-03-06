import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { config } from './utils/constants';
import { initContract, initLoggedIn } from './utils/init';

if (
    typeof window.ethereum !== 'undefined' &&
    window.ethereum.selectedAddress &&
    window.ethereum.isConnected() &&
    Number(window.chainId) !== config.chainId
) {
    initContract()
        .then(() => {
            ReactDOM.render(
                <App />,
                document.querySelector('#root')
            )
        })
        .catch(console.error);
} else if (typeof window.ethereum === 'undefined') {
    ReactDOM.render(
        <App />,
        document.querySelector('#root')
    )
} else {
    initLoggedIn()
        .then(() => {
            ReactDOM.render(
                <App />,
                document.querySelector('#root')
            )
        });
}
