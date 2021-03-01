export const getNetworkName = (chainId) => {
    chainId = Number(chainId);

    if (chainId === 1) {
        return "Mainnet";
    } else if (chainId === 3) {
        return "Ropsten";
    } else if (chainId === 4) {
        return "Rinkeby";
    } else if (chainId === 42) {
        return "Kovan";
    } else {
        return "Unknown";
    }
};
