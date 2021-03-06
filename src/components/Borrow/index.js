import React, { useEffect, useState } from 'react';
import { precision } from "../../utils/precision";
import { Modal, Form, Button } from 'react-bootstrap';
import AlertModal from "../Utils/AlertModal";
import SuccessModal from "../Utils/SuccessModal";
import * as Erc20Abi from "../../abis/Erc20Abi.json";
import * as LendingPool from "../../abis/LendingPool.json";

export default function Withdraw({
    asset,
    poolAddress,
    onCancel,
    onConfirm,
}) {
    const [decimals, setDecimals] = useState("");
    const [processing, setProcessing] = useState(null);
    const [amount, setAmount] = useState(0);
    const [contractInstance, setContractInstance] = useState();
    const [errorModal, setErrorModal] = useState({
        msg: "",
        open: false
    });
    const [successModal, setSuccessModal] = useState({
        msg: "",
        open: false
    });

    const handleSubmit = () => {
        if (validateInputs()) {
            handleBorrow();
        }
    }

    const validateInputs = () => {
        let error = "";

        if (!amount.match(/^(\d+\.?\d*|\.\d+)$/)) {
            error = `Not a valid amount.`;
        }

        if (!error) {
            return true;
        } else {
            setErrorModal({ open: true, msg: error });
        }
    };

    const handleBorrow = async () => {
        contractInstance.methods.borrow
            (
                asset,
                window.web3.utils.toBN(
                    await precision.add(
                        amount, decimals
                    )
                ),
            ).send({ from: window.userAddress })
            .on('transactionHash', () => {
                setProcessing(true);
            })
            .on('receipt', () => {
                setProcessing(false);
                setSuccessModal({
                    open: true,
                    msg: "Congratulations 🎉 !! " +
                        "Borrow Successful !!",
                });
            })
            .catch((error) => {
                setProcessing(false);
                setErrorModal({
                    open: true,
                    msg: error.message,
                });
            });
    }

    const getContractInstance = async () => {
        const contractInstance = new window.web3.eth.Contract(
            LendingPool.default,
            poolAddress,
            { from: window.userAddress }
        );

        const erc20Instance = new window.web3.eth.Contract(
            Erc20Abi.default,
            asset,
            { from: window.userAddress }
        );

        const decimal = await erc20Instance.methods
            .decimals().call();

        setDecimals(decimal);
        setContractInstance(contractInstance);
    }

    useEffect(() => {
        getContractInstance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Modal show={true} onHide={onCancel} size="sm" centered>
            <Modal.Header>
                <Modal.Title
                    className="mx-auto"
                >
                    Borrow Asset
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Control
                                size="lg"
                                type="number"
                                name="amount"
                                className="border-0"
                                value={amount}
                                placeholder="Amount"
                                onChange={(event) => {
                                    setAmount(
                                        event.target.value
                                    )
                                }}
                            />
                        </Form.Group>
                    </Form>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="success"
                    className="font-weight-bold text-uppercase"
                    onClick={handleSubmit}
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
            </Modal.Footer>

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
        </Modal>
    );
}

