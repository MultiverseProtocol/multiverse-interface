import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Card, CardDeck, Form, Row, Col } from "react-bootstrap";
import { thegraph } from "../../utils/thegraph";

export default function HomePage() {
    const [allPools, setAllPools] = useState([]);
    const [lendingPools, setLendingPools] = useState([]);

    const createSubArray = (pools) => {
        let chunks = [];

        while (pools.length > 4) {
            chunks.push(pools.splice(0, 4));
        }

        if (pools.length > 0) {
            chunks.push(pools);
        }

        setLendingPools(chunks);
    }

    const getPools = async () => {
        thegraph.fetchLendingPools()
            .then((pools) => {
                setAllPools([...allPools, ...pools]);
                createSubArray(pools);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleSearchBar = (e) => {
        let currentList = [];
        let newList = [];

        if (e.target.value !== "") {
            currentList = [...currentList, ...allPools];

            newList = currentList.filter(reserve => {
                const value = reserve.reserves.filter(element => {
                    const symbol = element.assetSymbol.toLowerCase();
                    const name = element.assetName.toLowerCase();

                    const filter = e.target.value.toLowerCase();

                    if (name.includes(filter) ||
                        symbol.includes(filter)) {
                        return element;
                    } else {
                        return null;
                    }
                });

                if (value.length !== 0) {
                    return value;
                } else {
                    return null
                }
            });
        } else {
            newList = [...newList, ...allPools];
        }

        createSubArray(newList);
    }

    useEffect(() => {
        if (lendingPools.length === 0) {
            getPools();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function DisplayCard({ pool, count }) {
        return (
            <Card key={count} className="display-pool-card" >
                <Link
                    key={count}
                    style={{ textDecoration: "none", color: "black" }}
                    to={`/pool/${pool.address}`}
                >
                    <Card.Header style={{ marginBottom: "5px" }}>
                        <span> Lending Pool</span>
                        <br />
                        <span
                            style={{
                                fontSize: "15px",
                                color: "brown"
                            }}
                        >
                            {pool.address.substr(0, 10)}
                            .....
                            {pool.address.substr(32, 42)}
                        </span>
                    </Card.Header>

                    <Card.Body>
                        <div style={{ marginBottom: "10px" }}>
                            <span style={{ fontWeight: "600" }}>Status: </span>
                            <span className="info-message">
                                {pool.status === "UNPAUSED" ?
                                    "Active" : "Inactive"
                                }
                            </span>
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                            <span style={{ fontWeight: "600" }}>Total Tokens: </span>
                            {pool.reserves.length}
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                            {pool.reserves.map((data, key) => (
                                <span key={key}>
                                    {data.assetName} ({data.assetSymbol}) <br />
                                </span>
                            ))}
                        </div>

                    </Card.Body>
                </Link>

            </Card>
        );
    }

    return (
        <div>
            <Row
                style={{
                    paddingTop: "20px",
                    paddingRight: "20px",
                }}
            >
                <Col className="col-9"></Col>
                <Col className="col-3">
                    <Form.Control
                        type="text"
                        className="mb-1"
                        onChange={handleSearchBar}
                        placeholder="&#128269; Try (Eg. DAI) Search using symbol"
                    />
                </Col>
            </Row>

            {lendingPools.map((element, key) => (
                element.length === 4 ?
                    <CardDeck key={key} style={{
                        margin: "2%", marginTop: "1%"
                    }}>
                        {element.map((pool, k) => (
                            <DisplayCard key={k} pool={pool} count={k} />
                        ))}
                    </CardDeck>
                    :
                    <CardDeck key={key} style={{
                        margin: "2%", marginTop: "1%"
                    }}>
                        {element.map((pool, k) => (
                            <DisplayCard key={k} pool={pool} count={k} />
                        ))}

                        {[...Array(4 - element.length)].map((x, i) =>
                            <Card
                                key={element.length + i + 1}
                                className="hidden-card"
                            >
                            </Card>
                        )}
                    </CardDeck>
            ))}
        </div >
    );
}
