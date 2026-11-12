import {useState} from 'react';
import PortfolioFooter from './components/PortfolioFooter.jsx';
import Terminal from './components/Terminal/Terminal.jsx';
import './components/styles/terminal.css';
import useAudioUnlock from './hooks/useAudioUnlock.js';

const App = () => {
    const soundEnabled = true;
    const [showFooter, setShowFooter] = useState(false);
    const [footerScrollRequest, setFooterScrollRequest] = useState(0);

    useAudioUnlock();

    const showContactFooter = () => {
        setShowFooter(true);
        setFooterScrollRequest((count) => count + 1);
    };

    return (
        <div className="App-container">
            <Terminal sonido={soundEnabled} onContact={showContactFooter}/>
            {showFooter && (
                <PortfolioFooter scrollRequest={footerScrollRequest}/>
            )}
        </div>
    );
};
export default App;