import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {
    Switch,
    HashRouter,
    Route,
    Redirect,
} from "react-router-dom";
import history from './components/Utils/history';
import Header from './components/Header';
import ViewPool from './components/ViewPool';
import CreatePool from './components/CreatePool';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import Transaction from './components/Transaction';

export default function App() {
    const routes = (
        <Switch>
            <Route path="/" exact>
                <HomePage />
            </Route>
            <Route path="/home" exact>
                <ViewPool />
            </Route>
            <Route path="/create-pool" exact>
                <CreatePool />
            </Route>
            <Route path="/pool/:poolAddress" exact>
                <ViewPool />
            </Route>
            <Route path="/dashboard" exact>
                <Dashboard />
            </Route>
            <Route path="/tx/:userAddress" exact>
                <Transaction />
            </Route>
            <Redirect to="/" />
        </Switch>
    );

    return (
        <div className="App">
            <HashRouter history={history}>
                <Header/>
                {routes}
            </HashRouter>
        </div>
    );
}
