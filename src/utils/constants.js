import * as PoolFactory from '../abis/PoolFactory.json';
import * as TokenFaucet from '../abis/TokenFaucet.json';

export const config = {
    networkId: 42,
    poolFactoryAbi: PoolFactory.default,
    poolFactoryAddress: "0x18dd16C1f9FDa7de43deeEBF68eDD71aF941F785",
    tokenFaucetAbi: TokenFaucet.default,
    tokenFaucetAddress: "0x39D2B451A8a39E814F89D3662cF3fa87FaFAC087",
}

export const IS_ETH = typeof window.ethereum !== 'undefined';
export const defaultInterestRateStrategyAddress = "0x3661Accb2DB08d1B8cF8D6752cF8115F58daB0AC";
export const MAX_APPROVE_AMOUNT = 999999;
export const etherscanLink = "https://kovan.etherscan.io";
