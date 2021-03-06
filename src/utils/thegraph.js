import axios from 'axios';
const thegraphApi = "https://api.thegraph.com/subgraphs/name//princesinha19/multiverse";

const fetchLendingPools = () => {
    return new Promise((resolve, reject) => {
        axios.post
            (`${thegraphApi}`,
                {
                    "query": `{
                        pools(
                            orderBy: createdAt,
                            orderDirection: asc
                        ) {
                            address
                            reserves {
                                assetName
                                assetSymbol
                            }
                            creator 
                            status 
                            createdAt
                        }
                    }`
                }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then((res) => {
                resolve(res.data.data.pools);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const fetchPoolInfo = (poolAddress) => {
    return new Promise((resolve, reject) => {
        axios.post
            (`${thegraphApi}`,
                {
                    "query": `
                        query ($lendingPool: String!) {
                            pools(where: {
                                address: $lendingPool
                            }
                        ){
                            address
                            reserves(
                                orderBy: availableLiquidity,
                                orderDirection: desc,
                            ) {
                                asset
                                availableLiquidity
                                totalBorrow
                                liquidityRate
                                borrowRate
                                isBorrowingEnabled
                                isActive
                                assetDecimals
                                ltv
                                liquidationThreshold
                                liquidationBonus
                                assetName
                                assetSymbol
                            }
                            status
                            creator
                            createdAt
                        }
                        
                    }`,
                    variables: {
                        lendingPool: poolAddress
                    }
                }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then((res) => {
                resolve(res.data.data.pools[0]);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const fetchUserReserves = (userAddress) => {
    return new Promise((resolve, reject) => {
        axios.post
            (`${thegraphApi}`,
                {
                    "query": `
                        query ($address: String!) { 
                            userReserves(where: {
                                user: $address
                            }
                        ){
                            totalDeposits
                            totalBorrows
                            reserve {
                                asset
                                assetName
                                assetSymbol
                                assetDecimals
                            }
                            pool {
                                address
                            }
                        }
                    }`,
                    variables: {
                        address: userAddress.toLowerCase(),
                    }
                }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then((res) => {
                resolve(res.data.data.userReserves)
            })
            .catch((error) => {
                reject(error);
            });
    });
}

const fetchUserPools = (userAddress) => {
    return new Promise((resolve, reject) => {
        axios.post
            (`${thegraphApi}`,
                {
                    "query": `
                        query ($address: String!) { 
                            userPools(where: {
                                user: $address
                            }
                        ){
                            pool {
                                address
                            }
                            healthFactor
                        }
                    }`,
                    variables: {
                        address: userAddress.toLowerCase(),
                    }
                }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then((res) => {
                resolve(res.data.data.userPools)
            })
            .catch((error) => {
                reject(error);
            });
    });
}

const fetchUserTransactions = (userAddress) => {
    return new Promise((resolve, reject) => {
        axios.post
            (`${thegraphApi}`,
                {
                    "query": `
                        query (
                            $address: String!
                        ) { 
                            transactions(
                                orderBy: timestamp,
                                orderDirection: desc,
                                where: {
                                user: $address
                            }
                        ){
                            id
                            action
                            amount
                            reserve {
                                asset
                                assetName
                                assetSymbol
                            }
                            pool {
                                address
                            }
                            timestamp
                        }
                    }`,
                    variables: {
                        address: userAddress.toLowerCase(),
                    }
                }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then((res) => {
                resolve(res.data.data.transactions)
            })
            .catch((error) => {
                reject(error);
            });
    });
}

export const thegraph = {
    fetchLendingPools,
    fetchPoolInfo,
    fetchUserReserves,
    fetchUserTransactions,
    fetchUserPools,
};
