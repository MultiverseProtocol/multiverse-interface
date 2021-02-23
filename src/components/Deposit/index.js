import React, { useEffect, useState } from 'react';
import { precision } from "../../utils/precision";
import { Modal, Form, Button } from 'react-bootstrap';
import AlertModal from "../Utils/AlertModal";
import SuccessModal from "../Utils/SuccessModal";
import * as Erc20Abi from "../../abis/Erc20Abi.json";
import * as LendingPool from "../../abis/LendingPool.json";
import { MAX_APPROVE_AMOUNT } from '../../utils/constants';

export default function Deposit({
    asset,
    poolAddress,
    onCancel,
    onConfirm,
}) {
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState("");
    const [decimals, setDecimals] = useState("");
    const [approving, setApproving] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [erc20Instance, setErc20Instance] = useState(null);
    const [contractInstance, setContractInstance] = useState(null);
    const [errorModal, setErrorModal] = useState({ msg: "", open: false });
    const [successModal, setSuccessModal] = useState({ msg: "", open: false });

    const handleSubmit = () => {
        if (validateInputs()) {
            approveAndDeposit();
        }
    }

    const validateInputs = () => {
        let error = "";

        if (!amount.match(/^(\d+\.?\d*|\.\d+)$/)) {
            error = `Not a valid amount.`;
        }

        if (parseInt(amount) > balance) {
            error = 'Insufficient funds, did you account for fees?';
        }

        if (!error) {
            return true;
        } else {
            setErrorModal({ open: true, msg: error });
        }
    };

    const approveAndDeposit = async () => {
        try {
            const allowance = await precision.remove(
                await erc20Instance.methods.allowance(
                    window.userAddress,
                    poolAddress,
                ).call(),
                decimals
            );

            if (Number(allowance) >= Number(amount)) {
                deposit();
            } else {
                const success = await approveToken();

                if (success) {
                    deposit();
                }
            }
        } catch (error) {
            setErrorModal({
                open: true,
                msg: error.message,
            });
        }
    }

    const deposit = () => {
        return new Promise(async (resolve, reject) => {
            contractInstance.methods.deposit
                (
                    asset,
                    await precision.add(amount, decimals),
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
                            "You have successfully deposited your asset !!",
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

    const getContractDetails = async () => {
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

        const balance = await erc20Instance.methods
            .balanceOf(window.userAddress).call();

        const decimal = await erc20Instance.methods
            .decimals().call();

        setBalance(balance);
        setDecimals(decimal);
        setErc20Instance(erc20Instance);
        setContractInstance(contractInstance);
    }

    useEffect(() => {
        getContractDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Modal show={true} onHide={onCancel} size="sm" centered>
            <Modal.Header>
                <Modal.Title className="mx-auto">Deposit Asset</Modal.Title>
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

