import React, { useEffect, useState } from "react";
import Deposit from "../Deposit";
import Borrow from "../Borrow";
import Repay from "../Repay";
import Withdraw from "../Withdraw";
import history from "../Utils/history";
import Loading from "../Utils/Loading";
import AlertModal from "../Utils/AlertModal";
import SuccessModal from "../Utils/SuccessModal";
import { thegraph } from "../../utils/thegraph";
import { Link } from "react-router-dom";
import { precision } from "../../utils/precision";
import { config } from "../../utils/constants";
import MetaMaskError from "../Utils/MetaMaskError";
import * as LendingPool from "../../abis/LendingPool.json";
import {Card,CardDeck, Table, Button} from "react-bootstrap";

export default function Dashboard() {
    let routes;
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState({ reserves: [], pools: [] });
    const [showMetamaskError, setShowMetamaskError] = useState(false);
    const [errorModal, setErrorModal] = useState({ msg: "", open: false });
    const [successModal, setSuccessModal] = useState({ msg: "", open: false });
    const [selectedData, setSelectedData] = useState({ pool: "", asset: "" });
    const [repayModalOpen, setRepayModalOpen] = useState(false);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [depositModalOpen, setDepositModalOpen] = useState(false);
    const [borrowModalOpen, setBorrowModalOpen] = useState(false);

    const fetchContractData = async () => {
        try {
            const pools = await thegraph.fetchUserPools(
                window.userAddress
            );

            const reserves = await thegraph.fetchUserReserves(
                window.userAddress
            );

            for (let i = 0; i < reserves.length; i++) {
                const contractInstance = new window.web3.eth.Contract(
                    LendingPool.default,
                    reserves[i].pool.address,
                    { from: window.userAddress }
                );

                const depositBalance = await contractInstance.methods
                    .getUserDeposit(
                        window.userAddress,
                        reserves[i].reserve.asset
                    ).call();

                const borrowBalance = await contractInstance.methods
                    .getUserBorrow(
                        window.userAddress,
                        reserves[i].reserve.asset
                    ).call();

                reserves[i].depositBalance = Number(
                    await precision.remove(
                        depositBalance,
                        reserves[i].reserve.assetDecimals
                    ));
                reserves[i].borrowBalance = Number(
                    await precision.remove(
                        borrowBalance,
                        reserves[i].reserve.assetDecimals
                    ));
            }

            setState({ pools, reserves });
            setLoading(false);

        } catch (error) {
            setErrorModal({
                open: true,
                msg: error.message,
            });
        }
    };

    const handleDeposit = (pool, asset) => {
        setSelectedData({ pool, asset });
        setDepositModalOpen(true);
    }

    const handleBorrow = (pool, asset) => {
        setSelectedData({ pool, asset });
        setBorrowModalOpen(true);
    }

    const handleWithdraw = (pool, asset) => {
        setSelectedData({ pool, asset });
        setWithdrawModalOpen(true);
    }

    const handleRepay = (pool, asset) => {
        setSelectedData({ pool, asset });
        setRepayModalOpen(true);
    }

    useEffect(() => {
        if (typeof window.ethereum === 'undefined' ||
            !window.ethereum.isConnected() ||
            !window.ethereum.selectedAddress ||
            Number(window.chainId) !== config.networkId
        ) {
            setLoading(false);
            setShowMetamaskError(true);
        }

        if (typeof window.ethereum !== 'undefined' &&
            window.ethereum.selectedAddress &&
            window.ethereum.isConnected() &&
            Number(window.chainId) === config.networkId
        ) {
            fetchContractData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        routes = <Loading />;
    } else {
        routes = (
            <div>
                {showMetamaskError ?
                    <AlertModal
                        open={showMetamaskError}
                        toggle={() => {
                            setShowMetamaskError(false);
                            history.push('/');
                        }}
                    >
                        <MetaMaskError />
                    </AlertModal>
                    :
                    <CardDeck>
                        {/* <Card className="hidden-card"></Card> */}

                        <Card className="mx-auto view-pool-card">
                            <Card.Body style={{ fontWeight: "bold" }}>
                                <p className="view-pool-header">
                                    <u>Your Reserves</u>
                                </p>

                                <div style={{ textAlign: "right" }}>
                                    <Link
                                        style={{ color: "green" }}
                                        to={`/tx/${window.userAddress}`}
                                    >
                                        View Transactions
                                    </Link>
                                </div>

                                <Table
                                    style={{
                                        marginTop: "30px",
                                        textAlign: "center"
                                    }}
                                    striped bordered hover
                                    responsive
                                >
                                    <thead>
                                        <tr>
                                            <th>Pool</th>
                                            <th>Asset</th>
                                            <th>Deposited Balance</th>
                                            <th>Borrowed Balance</th>
                                            <th>Health Factor</th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {state.reserves.map((reserve, index) => (
                                            <tr key={`reserve-row-${index}`}>
                                                <td><Link to={`/pool/${reserve.pool.address}`}>
                                                    {reserve.pool.address}
                                                </Link></td>
                                                <td>
                                                    {reserve.reserve.assetName} (
                                                    {reserve.reserve.assetSymbol}
                                                )</td>
                                                <td>{reserve.depositBalance}</td>
                                                <td>{reserve.borrowBalance}</td>
                                                <td>{
                                                    state.pools.map((element) => {
                                                        if (
                                                            element.pool.address.toLowerCase() ===
                                                            reserve.pool.address.toLowerCase()
                                                        ) {
                                                            return Number(
                                                                element.healthFactor
                                                            ).toFixed(2);
                                                        } else {
                                                            return null
                                                        }
                                                    })
                                                }</td>
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => handleDeposit(
                                                            reserve.pool.address,
                                                            reserve.reserve.asset,
                                                        )}
                                                    >
                                                        Deposit
                                                    </Button>
                                                </td>
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        variant="info"
                                                        onClick={() => handleBorrow(
                                                            reserve.pool.address,
                                                            reserve.reserve.asset,
                                                        )}
                                                    >
                                                        Borrow
                                                    </Button>
                                                </td>
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleRepay(
                                                            reserve.pool.address,
                                                            reserve.reserve.asset,
                                                        )}
                                                    >
                                                        Repay
                                                    </Button>
                                                </td>
                                                <td>
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => handleWithdraw(
                                                            reserve.pool.address,
                                                            reserve.reserve.asset,
                                                        )}
                                                    >
                                                        Withdraw
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>

                        {/* <Card className="hidden-card"></Card> */}
                    </CardDeck>
                }

                <AlertModal
                    open={errorModal.open}
                    toggle={() => setErrorModal({
                        ...errorModal, open: false
                    })}
                >
                    {errorModal.msg}
                </AlertModal>

                <SuccessModal
                    open={successModal.open}
                    toggle={() => setSuccessModal({
                        ...successModal, open: false
                    })}
                >
                    {successModal.msg}
                </SuccessModal>

                {depositModalOpen ?
                    <Deposit
                        asset={selectedData.asset}
                        poolAddress={selectedData.pool}
                        onCancel={() => setDepositModalOpen(false)}
                        onConfirm={() => {
                            setDepositModalOpen(false);
                            fetchContractData();
                        }}

                    />
                    : null
                }

                {borrowModalOpen ?
                    <Borrow
                        asset={selectedData.asset}
                        poolAddress={selectedData.pool}
                        onCancel={() => setBorrowModalOpen(false)}
                        onConfirm={() => {
                            setBorrowModalOpen(false);
                            fetchContractData();
                        }}
                    />
                    : null
                }

                {repayModalOpen ?
                    <Repay
                        asset={selectedData.asset}
                        poolAddress={selectedData.pool}
                        onCancel={() => setRepayModalOpen(false)}
                        onConfirm={() => {
                            setRepayModalOpen(false);
                            fetchContractData();
                        }}
                    />
                    : null
                }

                {withdrawModalOpen ?
                    <Withdraw
                        asset={selectedData.asset}
                        poolAddress={selectedData.pool}
                        onCancel={() => setWithdrawModalOpen(false)}
                        onConfirm={() => {
                            setWithdrawModalOpen(false);
                            fetchContractData();
                        }}
                    />
                    : null
                }
            </div >
        );
    }

    return routes;
}
