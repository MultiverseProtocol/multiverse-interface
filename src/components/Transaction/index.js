import React, { useEffect, useState } from "react";
import {
    Card, Image,
    CardDeck, Table,
} from "react-bootstrap";
import history from "../Utils/history";
import Loading from "../Utils/Loading";
import { time } from "../../utils/time";
import AlertModal from "../Utils/AlertModal";
import metamask from "../../assets/metamask.png";
import { thegraph } from "../../utils/thegraph";
import { Link, useParams } from "react-router-dom";
import { etherscanLink } from "../../utils/constants";

export default function Dashboard() {
    let routes;
    let { userAddress } = useParams();
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState({ reserves: [] });
    const [showMetamaskError, setShowMetamaskError] = useState(false);

    const fetchContractData = async () => {
        try {
            const result = await thegraph
                .fetchUserTransactions(
                    userAddress
                );

            setState({ reserves: result });
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (typeof window.ethereum === 'undefined' ||
            !window.ethereum.isConnected() ||
            !window.ethereum.selectedAddress
        ) {
            setLoading(false);
            setShowMetamaskError(true);
        }

        if (typeof window.ethereum !== 'undefined' &&
            window.ethereum.selectedAddress &&
            window.ethereum.isConnected()
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
                        <div>
                            {typeof window.ethereum === 'undefined' ?
                                <div>
                                    You can't use these features without Metamask.
                                <br />
                                Please install
                                <Image width="50px" src={metamask}></Image>
                                first !!
                            </div>
                                :
                                <div>
                                    Please connect to
                                <Image width="50px" src={metamask}></Image>
                                to use this feature !!
                            </div>
                            }
                        </div>
                    </AlertModal>
                    :
                    <CardDeck>
                        <Card className="mx-auto view-pool-card">
                            <Card.Body style={{ fontWeight: "bold" }}>
                                <p className="view-pool-header">
                                    <u>Transaction List</u>
                                </p>

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
                                            <th>Tx Hash</th>
                                            <th>Pool</th>
                                            <th>Asset</th>
                                            <th>Amount</th>
                                            <th>Action</th>
                                            <th>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {state.reserves.map((tx, index) => (
                                            <tr key={`tx-row-${index}`}>
                                                <td>
                                                    <a
                                                        className="links"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        href={`${etherscanLink}/tx/${tx.id}`}
                                                    >
                                                        {tx.id.substr(0, 6)}
                                                        .........
                                                        {tx.id.substr(60, 66)}
                                                    </a>
                                                </td>
                                                <td><Link to={
                                                    `/pool/${tx.pool.address}`
                                                }>
                                                    {tx.pool.address.substr(0, 6)}
                                                    .........
                                                    {tx.pool.address.substr(36, 42)}                                                </Link></td>
                                                <td>
                                                    {tx.reserve.assetName}
                                                </td>
                                                <td>{tx.amount} {tx.reserve.assetSymbol}</td>
                                                <td>{tx.action}</td>
                                                <td>{time.getTimeInString(
                                                    tx.timestamp
                                                )}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </CardDeck>
                }
            </div >
        );
    }

    return routes;
}
