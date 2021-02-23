import * as PoolFactory from '../abis/PoolFactory.json';

export const config = {
    networkId: 42,
    poolFactoryAbi: PoolFactory.default,
    poolFactoryAddress: "0xD14463c6E95010589D5c0Aaf1Ea5b008eaE34F8B",
}

export const IS_ETH = typeof window.ethereum !== 'undefined';
export const defaultInterestRateStrategyAddress = "0x3661Accb2DB08d1B8cF8D6752cF8115F58daB0AC";
export const defaultPriceOracle = "0x0aBA1CF5272e54F241DF3Ff66ADF348F9591348C";
export const MAX_APPROVE_AMOUNT = 999999;
export const etherscanLink = "https://kovan.etherscan.io";
