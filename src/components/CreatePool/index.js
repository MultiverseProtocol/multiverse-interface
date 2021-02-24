import React, { useEffect, useState } from "react";
import AlertModal from "../Utils/AlertModal";
import SuccessModal from "../Utils/SuccessModal";
import metamask from "../../assets/metamask.png";
import history from "../Utils/history";
import {
    Row,
    Col,
    Form,
    Card,
    Image,
    Button,
    CardDeck,
    // Dropdown,
    // DropdownButton,
} from "react-bootstrap";
import {
    defaultPriceOracle,
    defaultInterestRateStrategyAddress,
} from "../../utils/constants";
import * as Erc20Abi from "../../abis/Erc20Abi.json";

export default function CreatePool() {
    // asset1: "0x4548Bee51e07746317E90fb2C89050164F078186",
    // asset2: "0x5E72A6994B2F8b10501cd1d599859f626dAdE5d0",

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
        console.log(
            defaultPriceOracle,
            assetArray,
            await getTokenDecimals(assetArray),
            interestRateStrategyArray,
            ltvArray,
            liquidationThresholdArray,
            liquidationBonusArray,
        );

        window.poolFactory.methods
            .deployPool(
                defaultPriceOracle,
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
                        "Within 2 minutes you will be able to " +
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

    const addClick = () => {
        setPoolState({
            ...poolState,
            reserves:
                [
                    ...poolState.reserves,
                    {
                        address: "",
                        ltv: "",
                        liquidationThreshold: "",
                        liquidationBonus: ""
                    }
                ]
        });
    }

    useEffect(() => {
        if (typeof window.ethereum === 'undefined' ||
            !window.ethereum.selectedAddress
        ) {
            setShowMetamaskError(true);
        }
    }, []);

    return (
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
                                <Image
                                    width="50px"
                                    src={metamask}
                                ></Image>
                                first !!
                            </div>
                            :
                            <div>
                                Please connect to
                                <Image
                                    width="50px"
                                    src={metamask}
                                ></Image>
                                to use this feature !!
                            </div>
                        }
                    </div>
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
                                            <Row style={{ marginTop: "10px" }}>
                                                <Col className="text-header">
                                                    Token Address:
                                                </Col>

                                                <Col style={{ paddingLeft: "0px" }}>
                                                    <Form.Control
                                                        className="mb-4"
                                                        style={{ width: "80%" }}
                                                        type="text"
                                                        placeholder="Address of the Token"
                                                        name="asset"
                                                        maxLength="46"
                                                        onChange={(e) => handleChange(i, e)}
                                                        value={el.key}
                                                    />
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
                                                        placeholder="Loan To Value %"
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
                                                        placeholder="Liquidation Threshold %"
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
                                                        placeholder="Liquidation Bonus %"
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

                            {/* <Row style={{ marginBottom: "20px" }}>
                                <Col className="text-header">
                                    Lending Pool:
                            </Col>
                                <Col style={{ paddingLeft: "0px" }}>
                                    <DropdownButton
                                        style={{
                                            position: "absolute",
                                        }}
                                        title={lendingPool.map((element) => (
                                            addPoolState.token === element.token ?
                                                element.pool
                                                : null
                                        ))}
                                        variant="outline-info"
                                        onSelect={(e) => setAddPoolState({
                                            ...addPoolState,
                                            token: e
                                        })}
                                    >
                                        {lendingPool.map((element, key) => (
                                            <Dropdown.Item
                                                key={key}
                                                eventKey={element.token}
                                            >
                                                {element.pool}
                                            </Dropdown.Item>
                                        ))}
                                    </DropdownButton>
                                </Col>
                            </Row> */}
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
