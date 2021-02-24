import React, { useEffect, useState } from 'react';
import { precision } from "../../utils/precision";
import { Modal, Form, Button } from 'react-bootstrap';
import AlertModal from "../Utils/AlertModal";
import SuccessModal from "../Utils/SuccessModal";
import * as Erc20Abi from "../../abis/Erc20Abi.json";
import * as LendingPool from "../../abis/LendingPool.json";
import { MAX_APPROVE_AMOUNT } from '../../utils/constants';

export default function Repay({
    asset,
    poolAddress,
    onCancel,
    onConfirm,
}) {
    const [amount, setAmount] = useState(0);
    const [decimals, setDecimals] = useState("");
    const [approving, setApproving] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [erc20Instance, setErc20Instance] = useState(null);
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
            approveAndRepay();
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

    const approveAndRepay = async () => {
        try {
            const allowance = await precision.remove(
                await erc20Instance.methods.allowance(
                    window.userAddress,
                    poolAddress,
                ).call(),
                decimals
            );

            if (Number(allowance) >= Number(amount)) {
                handleRepay();
            } else {
                const success = await approveToken();

                if (success) {
                    handleRepay();
                }
            }
        } catch (error) {
            setErrorModal({
                open: true,
                msg: error.message,
            });
        }
    }

    const handleRepay = async () => {
        return new Promise(async (resolve, reject) => {
            contractInstance.methods.repay
                (
                    asset,
                    window.web3.utils.toBN(
                        await precision.add(
                            amount, decimals
                        )
                    ),
                    window.userAddress
                ).send({ from: window.userAddress })
                .on('transactionHash', () => {
                    setProcessing(true);
                })
                .on('receipt', () => {
                    setProcessing(false);
                    setSuccessModal({
                        open: true,
                        msg: "Congratulations 🎉 !! " +
                            "Withdraw Successful !!",
                    });
                })
                .catch((error) => {
                    setProcessing(false);
                    reject(error);
                });
        });
    }

    const approveToken = () => {
        return new Promise(async (resolve, reject) => {
            erc20Instance.methods.approve
                (
                    poolAddress,
                    await precision.add(
                        MAX_APPROVE_AMOUNT,
                        decimals
                    )
                )
                .send({ from: window.userAddress })
                .on('transactionHash', () => {
                    setApproving(true);
                })
                .on('receipt', () => {
                    setApproving(false);
                    resolve(true);
                })
                .catch((error) => {
                    setApproving(false);
                    reject(error);
                })
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
        setErc20Instance(erc20Instance);
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
                    Repay Asset
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
                                    setAmount(event.target.value)
                                }}
                            />
                        </Form.Group>
                    </Form>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="primary"
                    size="lg"
                    className="font-weight-bold text-uppercase"
                    onClick={handleSubmit}
                >
                    {approving ?
                        <div className="d-flex align-items-center">
                            Approving
                        <span className="loading ml-2"></span>
                        </div>
                        :
                        (processing ?
                            <div className="d-flex align-items-center">
                                Processing
                            <span className="loading ml-2"></span>
                            </div>
                            :
                            <div>Submit</div>
                        )
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

