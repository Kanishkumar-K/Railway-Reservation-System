'use strict';

const getPrice = (distance, coachType, userAge) => {
    if (distance <= 0) {
        throw new Error(
            'Invalid distance. Distance must be greater than 0. \
            Heyy Admin, Please update distance properly!'
        );
    }

    const perKm = 0.8;
    const serviceCharges = 50;

    const multiplier = {
        general: 1,
        sleeper: 2,
        ac: 3,
    };

    if (!multiplier[coachType]) {
        throw new Error(`Oops.. Invalid coach type: ${coachType} :(`);
    }

    let price = distance * perKm * multiplier[coachType] + serviceCharges;

    if (userAge && userAge >= 60) {
        price *= 0.75;
    }

    if (userAge && userAge <= 5) {
        price *= 0.5;
    }

    return price;
};

module.exports = getPrice;
