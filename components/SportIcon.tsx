import React from 'react';
import { Sport } from '../types';
import BasketballIcon from './icons/BasketballIcon';
import SoccerIcon from './icons/SoccerIcon';
import VolleyballIcon from './icons/VolleyballIcon';

const SportIcon: React.FC<{ sport: Sport, className?: string }> = ({ sport, className }) => {
    switch (sport) {
        case Sport.Basketball: return <BasketballIcon className={className} />;
        case Sport.Soccer: return <SoccerIcon className={className} />;
        case Sport.Volleyball: return <VolleyballIcon className={className} />;
        default: return null;
    }
};

export default SportIcon;
