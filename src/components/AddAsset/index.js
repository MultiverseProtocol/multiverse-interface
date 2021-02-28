import React, { useState } from 'react';
import AlertModal from "../Utils/AlertModal";
import SuccessModal from "../Utils/SuccessModal";
import * as Erc20Abi from "../../abis/Erc20Abi.json";
import * as LendingPool from "../../abis/LendingPool.json";
import {
    Row,
    Col,
    Form,
    Button,
    Modal,
    Dropdown,
    DropdownButton,
} from "react-bootstrap";
import {
    defaultInterestRateStrategyAddress,
} from "../../utils/constants";
import { assets } from "../../utils/assets";

export default function AddAsset({
    poolAddress,
    creator,
    onCancel,
    onConfirm,
}) {
    const [processing, setProcessing] = useState(null);
    const [errorModal, setErrorModal] = useState(
        { msg: "", open: false }
    );
    const [successModal, setSuccessModal] = useState(
        { msg: "", open: false }
    );

    const [poolState, setPoolState] = useState({
        asset: "",
        ltv: "",
        liquidationThreshold: "",
        liquidationBonus: ""
    });
    const [isAlreadyAdded, setIsAlreadyAdded] = useState(false);

    const handleSubmit = async () => {
        if (validateInputs()) {
            await checkAndAddAsset();
        }
    }

    const validateInputs = () => {
        let error = "";

        if (
            !poolState.asset ||
            !poolState.ltv ||
            !poolState.liquidationThreshold ||
            !poolState.liquidationBonus
        ) {
            error = "All fields are necessary !!"
        }

        if (poolState.asset && poolState.asset.length !== 42) {
            error = "Token address is wrong !!"
        }

        if (!error) {
            return true;
        } else {
            setErrorModal({
                open: true, msg: error
            });
            return false;
        }
    };

    const handleAddAsset = (contractInstance) => {
        return new Promise(async (resolve, reject) => {
            const erc20Instance = new window.web3.eth.Contract(
                Erc20Abi.default,
                poolState.asset,
                { from: window.userAddress }
            );

            const decimals = await erc20Instance.methods
                .decimals().call();

            contractInstance.methods.initReserve
                (
                    poolState.asset,
                    defaultInterestRateStrategyAddress,
                    decimals,
                ).send({ from: window.userAddress })
                .on('transactionHash', () => {
                    setProcessing(true);
                })
                .on('receipt', async () => {
                    setProcessing(false);
                    resolve(true);
                })
                .catch((error) => {
                    setProcessing(false);
                    reject(error);
                });
        });
    }

    const handleEnableBorrowing = (contractInstance) => {
        return new Promise(async (resolve, reject) => {
            contractInstance.methods.configureReserveAsCollateral
                (
                    poolState.asset,
                    poolState.ltv * 100,
                    poolState.liquidationThreshold * 100,
                    (100 + Number(poolState.liquidationBonus)) * 100
                ).send({ from: window.userAddress })
                .on('transactionHash', () => {
                    setProcessing(true);
                })
                .on('receipt', () => {
                    setProcessing(false);
                    setSuccessModal({
                        open: true,
                        msg: "Congratulations 🎉 !! " +
                            "Asset successfully added !!",
                    });
                })
                .catch((error) => {
                    setProcessing(false);
                    reject(error);
                });
        });
    }

    const checkAndAddAsset = async () => {
        try {
            const contractInstance = new window.web3.eth.Contract(
                LendingPool.default,
                poolAddress,
                { from: window.userAddress }
            );

            let reserveData = await contractInstance.methods
                .getReserveData(
                    poolState.asset,
                ).call();

            if (Number(reserveData.liquidityIndex) !== 0) {
                setIsAlreadyAdded(true);
                handleEnableBorrowing(contractInstance);
            } else {
                const success = await handleAddAsset(
                    contractInstance
                );

                if (success) {
                    try {
                        await handleEnableBorrowing(
                            contractInstance
                        );
                    } catch (error) {
                        setErrorModal({
                            open: true,
                            msg: error.message,
                        });
                    }
                }
            }
        } catch (error) {
            setErrorModal({
                open: true,
                msg: error.message,
            });
        }
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setPoolState({ ...poolState, [name]: value });
    }

    return (
        <Modal
            show={true}
            onHide={onCancel}
            centered
            animation={false}
        >
            <Modal.Header>
                <Modal.Title
                    className="mx-auto"
                >
                    Add New Asset
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ textAlign: "center" }}>
                <Row style={{
                    marginTop: "10px",
                    marginBottom: "40px",
                }}>
                    <Col className="text-header">
                        Token:
                    </Col>

                    <Col style={{ paddingLeft: "0px" }}>
                        <DropdownButton
                            style={{
                                position: "absolute",
                            }}
                            title={assets.map((element) => (
                                poolState.asset === element.address ?
                                    element.symbol
                                    : null
                            ))}
                            variant="outline-info"
                            name="asset"
                            onSelect={(event) => {
                                setPoolState({
                                    ...poolState,
                                    asset: event
                                })
                            }}
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
                            placeholder="Loan To Value %"
                            name="ltv"
                            onChange={(e) => handleChange(e)}
                            value={poolState.ltv}
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
                            onChange={(e) => handleChange(e)}
                            value={poolState.liquidationThreshold}
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
                            onChange={(e) => handleChange(e)}
                            value={poolState.liquidationBonus}
                        />
                    </Col>
                </Row>

                {isAlreadyAdded ?
                    <Row style={{ marginBottom: "10px" }}>
                        <Col className="warning-message">
                            Asset Already Added.<br></br>
                            Continue to Enable Borrowing.
                        </Col>
                    </Row>
                    : null
                }

                {creator.toLowerCase() !==
                    window.userAddress.toLowerCase() ?
                    <Row style={{ marginBottom: "10px" }}>
                        <Col className="alert-message">
                            You are not owner.<br></br>
                            So, You can't add asset.
                        </Col>
                    </Row>
                    : null
                }

                <Button
                    variant="outline-success"
                    className="font-weight-bold text-uppercase"
                    onClick={handleSubmit}
                    style={{
                        marginTop: "10px",
                        marginBottom: "20px",
                    }}
                    disabled={
                        creator.toLowerCase() !==
                            window.userAddress.toLowerCase() ?
                            true : false
                    }
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
            </Modal.Body>

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
                onConfirm={onConfirm}
            >
                {successModal.msg}
            </SuccessModal>
        </Modal >
    );
}

