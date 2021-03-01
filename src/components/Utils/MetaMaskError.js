import React from "react";
import { Image } from "react-bootstrap";
import metamask from "../../assets/metamask.png";
import { getNetworkName } from "../../utils/network";
import { config, IS_ETH } from "../../utils/constants";

export default function MetaMaskError() {
    return (
        <div>
            {!IS_ETH ?
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
                : (window.ethereum.selectedAddress &&
                    Number(window.chainId) !== config.networkId ?
                    <div>
                        You have chosen incorrect network
                        <strong> {getNetworkName(window.chainId)} </strong>
                        in Metamask.
                        <br />
                        Please choose network as
                        <strong> {getNetworkName(config.networkId)}</strong> in
                        <img alt="Metamask Logo" width="50px" src={metamask} />
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
                )
            }
        </div>
    )
}
