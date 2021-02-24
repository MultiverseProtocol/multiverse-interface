import { BigNumber } from "bignumber.js";

const add = async (value, decimals) => {
    return new BigNumber(value)
        .times(new BigNumber(10)
            .exponentiatedBy(new BigNumber(decimals)));
}

const remove = async (value, decimals) => {
    return new BigNumber(value)
        .dividedBy(new BigNumber(10)
            .exponentiatedBy(new BigNumber(decimals)));
}

export const precision = {
    add,
    remove,
};
