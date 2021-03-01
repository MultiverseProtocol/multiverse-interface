import React, { useEffect, useState } from "react";
import Loading from "../Utils/Loading";
import history from "../Utils/history";
import AlertModal from "../Utils/AlertModal";
import SuccessModal from "../Utils/SuccessModal";
import { faucetAssets } from "../../utils/assets";
import { config } from "../../utils/constants";
import MetaMaskError from "../Utils/MetaMaskError";
import { Button, Card, CardDeck, } from "react-bootstrap";

export default function TokenFaucet() {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [errorModal, setErrorModal] = useState({
        msg: "",
        open: false
    });
    const [successModal, setSuccessModal] = useState({
        msg: "",
        open: false
    });
    const [showMetamaskError, setShowMetamaskError] = useState(
        false
    );

    const handleGetTestTokens = (tokenAddress) => {
        window.tokenFaucet.methods
            .claimTestTokens(tokenAddress)
            .send()
            .on('transactionHash', () => {
                setProcessing(true);
            })
            .on('receipt', (_) => {
                setProcessing(false);
            })
            .catch((error) => {
                setProcessing(false);
                setErrorModal({
                    open: true,
                    msg: error.message,
                });
            });
    }

    const checkIsAlreadyClaimed = async () => {
        let tokensArray = [];

        for (let i = 0; i < faucetAssets.length; i++) {
            const token = faucetAssets[i];

            const status = await window.tokenFaucet
                .methods.alreadyClaimed(
                    window.userAddress,
                    token.address,
                ).call();

            const tokenDetails = await window.tokenFaucet
                .methods.getTokenDetails(
                    token.address
                ).call();

            tokensArray.push({
                symbol: token.symbol,
                address: token.address,
                status: status,
                balance: tokenDetails[0],
                claimAmount: tokenDetails[1],
            });

            if (i === faucetAssets.length - 1) {
                createSubArray(tokensArray);
            }
        }
    }

    const createSubArray = (temp) => {
        let chunks = [];

        while (temp.length > 4) {
            chunks.push(temp.splice(0, 4));
        }

        if (temp.length > 0) {
            chunks.push(temp);
        }

        setTokens(chunks);
        setLoading(false);
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
            checkIsAlreadyClaimed();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function DisplayCard({ token, count }) {
        return (

            <Card key={count}>
                <Card.Header>
                    <u>{token.symbol} Faucet</u>
                </Card.Header>

                {!token.status ?
                    <Card.Body>
                        <p>
                            Faucet Balance: <strong>{token.balance}</strong>
                            <br />
                        </p>

                        <p>
                            You can get {token.claimAmount} <strong>{token.symbol} </strong>
                                (one time) by clicking below button:
                            <br />
                        </p>

                        <Button
                            style={{ marginTop: '10px' }}
                            variant="success"
                            onClick={() =>
                                handleGetTestTokens(token.address)
                            }
                            disabled={Number(token.balance) === 0 ? true : false}
                        >
                            {processing ?
                                <div className="d-flex align-items-center">
                                    Processing
                                <span className="loading ml-2"></span>
                                </div>
                                :
                                <div>
                                    GET {token.claimAmount} {token.symbol}
                                </div>
                            }
                        </Button>
                    </Card.Body>
                    :
                    <Card.Body>
                        <p>
                            Faucet Balance: {token.balance}
                            <br />
                        </p>
                        <p style={{ color: "gray" }}>
                            You have already claimed your {token.claimAmount} {token.symbol}.
                        </p>
                        <p style={{ marginTop: "30px", fontWeight: "bold" }}>
                            Maybe you need to use a different account?
                        </p>
                    </Card.Body>
                }
            </Card>
        );
    }

    if (loading) {
        return <Loading />
    };

    return (
        <div>
            <div className="info-message" style={{ marginTop: "50px" }}>
                <strong style={{ fontSize: "large" }}>
                    If you don't see any asset or balance in the faucet. Then you can use:
                </strong>
                <br></br>
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://testnet.aave.com/faucet/"
                    style={{ fontWeight: "bold" }}
                >
                    https://testnet.aave.com/faucet/
                </a>
            </div>
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
                    (
                        tokens.map((element, key) => (
                            element.length === 4 ?
                                <CardDeck key={key} style={{
                                    margin: "2%", marginTop: "1%"
                                }}>
                                    {element.map((token, k) => (
                                        <DisplayCard key={k} token={token} count={k} />
                                    ))}
                                </CardDeck>
                                :
                                <CardDeck key={key} style={{
                                    margin: "2%", marginTop: "1%"
                                }}>
                                    {element.map((token, k) => (
                                        <DisplayCard key={k} token={token} count={k} />
                                    ))}

                                    {[...Array(4 - element.length)].map((x, i) =>
                                        <Card
                                            key={element.length + i + 1}
                                            className="hidden-card"
                                        >
                                        </Card>
                                    )}
                                </CardDeck>
                        ))
                    )
                }
            </div>


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
        </div >
    );
}
