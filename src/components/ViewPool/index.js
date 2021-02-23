import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../Utils/Loading";
import AlertModal from "../Utils/AlertModal";
import SuccessModal from "../Utils/SuccessModal";
import { thegraph } from "../../utils/thegraph";
import {
    Card,
    Row,
    Col,
    CardDeck,
    Table,
    Button
} from "react-bootstrap";
import Deposit from "../Deposit";
import Borrow from "../Borrow";
import { time } from "../../utils/time";
import { etherscanLink } from "../../utils/constants";

export default function ViewPool() {
    let routes;
    const { poolAddress } = useParams();
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState({
        reserves: [],
        status: "",
        creator: "",
        createdAt: ""
    });
    const [successModal, setSuccessModal] = useState({
        msg: "",
        open: false
    });
    const [errorModal, setErrorModal] = useState({
        msg: "",
        open: false
    });
    const [selectedAsset, setSelectedAsset] = useState("");
    const [depositModalOpen, setDepositModalOpen] = useState(false);
    const [borrowModalOpen, setBorrowModalOpen] = useState(false);
    // const testTokenAddr = "0x5E72A6994B2F8b10501cd1d599859f626dAdE5d0";

    const fetchContractData = async () => {
        try {
            const result = await thegraph.fetchPoolInfo(
                poolAddress
            );

            setState({
                reserves: result.reserves,
                status: result.status,
                creator: result.creator,
                createdAt: Number(result.createdAt)
            });

            setLoading(false);
        } catch (error) {
            setErrorModal({
                open: true,
                msg: error.message,
            });
        }
    };

    const handleDeposit = (asset) => {
        setSelectedAsset(asset);
        setDepositModalOpen(true);
    }

    const handleBorrow = (asset) => {
        setSelectedAsset(asset);
        setBorrowModalOpen(true);
    }

    useEffect(() => {
        fetchContractData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        routes = <Loading />;
    } else {
        routes = (
            <div>
                <CardDeck>
                    {/* <Card className="hidden-card"></Card> */}

                    <Card className="mx-auto view-pool-card">
                        <Card.Body style={{ textAlign: "left", fontWeight: "bold" }}>
                            <p className="view-pool-header">
                                <u>Lending Pool</u>
                            </p>

                            <Row>
                                <Col>
                                    <span>Total Reserves : </span>
                                    <span >
                                        {state.reserves.length}
                                    </span>
                                </Col>

                                <Col>
                                    <span>Status : </span>
                                    <span className="info-message">
                                        {state.status === "UNPAUSED" ?
                                            "ACTIVE" : "INACTIVE"
                                        }
                                    </span>
                                </Col>

                                <Col>
                                    <span>Created On : </span>
                                    <span >
                                        {time.getTimeInString(
                                            state.createdAt
                                        )}
                                    </span>
                                </Col>

                                <Col>
                                    <span>Created By : </span>
                                    <a
                                        className="links"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`${etherscanLink}/address/${state.creator}`}
                                    >
                                        {state.creator.substr(0, 15)}
                                            .....
                                        {state.creator.substr(27, 42)}
                                    </a>
                                </Col>
                            </Row>

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
                                        <th>Asset</th>
                                        <th>Market Size</th>
                                        <th>Total Borrowed</th>
                                        <th>Deposit APY</th>
                                        <th>Borrow APR</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.reserves.map((reserve, index) => (
                                        <tr key={`reserve-row-${index}`}>
                                            <td>{reserve.assetName} (
                                                    <a
                                                    className="links"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={`${etherscanLink}/address/${reserve.asset}`}
                                                >
                                                    {state.creator.substr(0, 5)}
                                                            .....
                                                        {state.creator.substr(37, 42)}
                                                </a>
                                                )</td>
                                            <td>{reserve.availableLiquidity}</td>
                                            <td>{reserve.totalBorrow}</td>
                                            <td>{Number(reserve.liquidityRate).toFixed(4)}</td>
                                            <td>{Number(reserve.borrowRate).toFixed(4)}</td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => handleDeposit(
                                                        reserve.asset
                                                    )}
                                                    disabled={
                                                        !window.userAddress ? true : false
                                                    }
                                                    title={
                                                        !window.userAddress ?
                                                            "connect to metamask first" :
                                                            "click here to deposit"
                                                    }
                                                >
                                                    Deposit
                                                    </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="info"
                                                    onClick={() => handleBorrow(
                                                        reserve.asset
                                                    )}
                                                    disabled={
                                                        !window.userAddress ? true : false
                                                    }
                                                    title={
                                                        !window.userAddress ?
                                                            "connect to metamask first" :
                                                            "click here to borrow"
                                                    }
                                                >
                                                    Borrow
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
                        asset={selectedAsset}
                        poolAddress={poolAddress}
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
                        asset={selectedAsset}
                        poolAddress={poolAddress}
                        onCancel={() => setBorrowModalOpen(false)}
                        onConfirm={() => {
                            setBorrowModalOpen(false);
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
