import React, { useEffect, useState } from "react";
import AlertModal from "../Utils/AlertModal";
import SuccessModal from "../Utils/SuccessModal";
import history from "../Utils/history";
import {
    Row,
    Col,
    Form,
    Card,
    Button,
    CardDeck,
    Dropdown,
    DropdownButton,
} from "react-bootstrap";
import {
    config,
    defaultInterestRateStrategyAddress,
} from "../../utils/constants";
import * as Erc20Abi from "../../abis/Erc20Abi.json";
import { assets } from "../../utils/assets";
import MetaMaskError from "../Utils/MetaMaskError";

export default function CreatePool() {
    const [processing, setProcessing] = useState(false);
    const [poolState, setPoolState] = useState({
        reserves: [{
            asset: "",
            ltv: "",
            liquidationThreshold: "",
            liquidationBonus: ""
        }],
    });

    const [showMetamaskError, setShowMetamaskError] = useState(
        false
    );

    const [errorModal, setErrorModal] = useState({
        msg: "",
        open: false
    });

    const [successModal, setSuccessModal] = useState({
        msg: "",
        open: false
    });

    const validateInputsAndCreate = () => {
        let error = "";
        let assetArray = [];
        let ltvArray = [];
        let liquidationBonusArray = [];
        let liquidationThresholdArray = [];
        let interestRateStrategyArray = [];

        for (let i = 0; i < poolState.reserves.length; i++) {
            const reserve = poolState.reserves[i];
            if (
                !reserve.asset ||
                !reserve.ltv ||
                !reserve.liquidationThreshold ||
                !reserve.liquidationBonus
            ) {
                error = "All fields are necessary !!"
            }

            if (reserve.asset && reserve.asset.length !== 42) {
                error = "One of the token address is wrong !!"
            }

            assetArray.push(reserve.asset);
            ltvArray.push(reserve.ltv * 100);
            liquidationThresholdArray.push(
                reserve.liquidationThreshold * 100
            );
            liquidationBonusArray.push(
                (100 + Number(reserve.liquidationBonus)) * 100
            );
            interestRateStrategyArray.push(
                defaultInterestRateStrategyAddress
            );
        }

        if (error) {
            setErrorModal({
                open: true,
                msg: error,
            });
        } else {
            handleCreatePool(
                assetArray,
                ltvArray,
                liquidationBonusArray,
                liquidationThresholdArray,
                interestRateStrategyArray,
            );
        }
    }

    const handleCreatePool = async (
        assetArray,
        ltvArray,
        liquidationBonusArray,
        liquidationThresholdArray,
        interestRateStrategyArray,
    ) => {
        window.poolFactory.methods
            .deployPool(
                assetArray,
                await getTokenDecimals(assetArray),
                interestRateStrategyArray,
                ltvArray,
                liquidationThresholdArray,
                liquidationBonusArray,
            )
            .send()
            .on('transactionHash', () => {
                setProcessing(true);
            })
            .on('receipt', (_) => {
                setProcessing(false);
                setSuccessModal({
                    open: true,
                    msg: "Congratulations 🎉 !! " +
                        "Pool successfully created !! " +
                        "Within few minutes you will be able to " +
                        "see created pool on the dashboard.",
                });
            })
            .catch((error) => {
                setProcessing(false);
                setErrorModal({
                    open: true,
                    msg: error.message,
                });
            });
    };

    const getTokenDecimals = (assets) => {
        return new Promise(async (resolve, reject) => {
            try {
                let decimals = [];

                for (let i = 0; i < assets.length; i++) {
                    const erc20Instance = new window.web3.eth.Contract(
                        Erc20Abi.default,
                        assets[i],
                        { from: window.userAddress }
                    );

                    const tokenDecimal = await erc20Instance.methods
                        .decimals().call();

                    decimals.push(tokenDecimal);

                    if (i === assets.length - 1) {
                        resolve(decimals);
                    }
                }
            } catch (error) {
                reject(error);
            }
        })

    }

    const handleChange = (i, e) => {
        const { name, value } = e.target;
        let array = [...poolState.reserves];
        array[i] = { ...array[i], [name]: value };

        setPoolState({ ...poolState, reserves: array });
    }

    const handleSelect = (i, value) => {
        let array = [...poolState.reserves];
        array[i] = { ...array[i], "asset": value };
        setPoolState({ ...poolState, reserves: array });
    }

    const addClick = () => {
        setPoolState({
            ...poolState,
            reserves:
                [
                    ...poolState.reserves,
                    {
                        asset: "",
                        ltv: "",
                        liquidationThreshold: "",
                        liquidationBonus: ""
                    }
                ]
        });
    }

    useEffect(() => {
        if (typeof window.ethereum === 'undefined' ||
            !window.ethereum.isConnected() ||
            !window.ethereum.selectedAddress ||
            Number(window.chainId) !== config.networkId
        ) {
            setShowMetamaskError(true);
        }
    }, []);

    return (
        <div style={{ paddingBottom: "8%" }}>
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
                    <Card className="hidden-card"></Card>

                    <Card className="mx-auto form-card">
                        <Card.Header>
                            <u>Create Lending Pool</u>
                        </Card.Header>

                        <Card.Body>
                            {poolState.reserves.map((el, i) => (
                                <>
                                    <Row key={"info-row" + i}>
                                        <Col
                                            style={
                                                {
                                                    fontSize: "18px",
                                                    textAlign: "center",
                                                    marginBottom: "15px",
                                                    color: "green"
                                                }
                                            }
                                        >
                                            Asset {i + 1} Configuration
                                        </Col>
                                    </Row>

                                    <Row key={"config-row" + i}>
                                        <Col>
                                            <Row style={{ marginTop: "10px", marginBottom: "40px" }}>
                                                <Col className="text-header">
                                                    Token:
                                                </Col>

                                                <Col style={{ paddingLeft: "0px" }}>
                                                    <DropdownButton
                                                        style={{
                                                            position: "absolute",
                                                        }}
                                                        title={assets.map((element) => (
                                                            poolState.reserves[i].asset === element.address ?
                                                                element.symbol
                                                                : null
                                                        ))}
                                                        variant="outline-info"
                                                        name="asset"
                                                        onSelect={(e) => handleSelect(i, e)}
                                                    >
                                                        {assets.map((element, key) => (
                                                            <Dropdown.Item
                                                                key={key}
                                                                eventKey={element.address}
                                                            >
                                                                {element.symbol}
                                                            </Dropdown.Item>
                                                        ))}
                                                    </DropdownButton>
                                                </Col>
                                            </Row>

                                            <Row style={{ marginTop: "10px" }}>
                                                <Col className="text-header">
                                                    Loan To Value:
                                                </Col>

                                                <Col style={{ paddingLeft: "0px" }}>
                                                    <Form.Control
                                                        className="mb-4"
                                                        style={{ width: "80%" }}
                                                        type="number"
                                                        step="0"
                                                        placeholder="Eg. 70 (For 70%)"
                                                        name="ltv"
                                                        onChange={(e) => handleChange(i, e)}
                                                        value={el.value}
                                                    />
                                                </Col>
                                            </Row>

                                            <Row style={{ marginTop: "10px" }}>
                                                <Col className="text-header">
                                                    Liquidation Threshold:
                                                </Col>

                                                <Col style={{ paddingLeft: "0px" }}>
                                                    <Form.Control
                                                        className="mb-4"
                                                        style={{ width: "80%" }}
                                                        type="number"
                                                        step="0"
                                                        placeholder="Eg. 75 (For 75%)"
                                                        name="liquidationThreshold"
                                                        onChange={(e) => handleChange(i, e)}
                                                        value={el.value}
                                                    />
                                                </Col>
                                            </Row>

                                            <Row style={{ marginTop: "10px" }}>
                                                <Col className="text-header">
                                                    Liquidation Bonus:
                                                </Col>

                                                <Col style={{ paddingLeft: "0px" }}>
                                                    <Form.Control
                                                        className="mb-4"
                                                        style={{ width: "80%" }}
                                                        type="number"
                                                        step="0"
                                                        placeholder="Eg. 5 (For 5%)"
                                                        name="liquidationBonus"
                                                        onChange={(e) => handleChange(i, e)}
                                                        value={el.value}
                                                    />
                                                </Col>
                                            </Row>

                                            <Col
                                                className="col-12"
                                                style={
                                                    {
                                                        fontSize: "24px",
                                                        textAlign: "center",
                                                        paddingBottom: "8px",
                                                    }
                                                }
                                                onClick={addClick}
                                                text="click here to add more asset"
                                            >
                                                &#43;
                                            </Col>
                                        </Col>
                                    </Row>
                                </>
                            ))}
                        </Card.Body>

                        <Card.Footer className="text-center">
                            <Button
                                onClick={validateInputsAndCreate}
                                variant="success"
                            >
                                {processing ?
                                    <div className="d-flex align-items-center">
                                        Processing
                                    <span className="loading ml-2"></span>
                                    </div>
                                    :
                                    <div>Submit</div>
                                }
                            </Button>
                        </Card.Footer>
                    </Card>

                    <Card className="hidden-card"></Card>
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
                onConfirm={() => history.push("/")}
            >
                {successModal.msg}
            </SuccessModal>
        </div>
    );
}
