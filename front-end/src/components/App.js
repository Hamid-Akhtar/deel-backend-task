import '../css/App.css';
import React, { useState, useEffect } from 'react'
import Contracts from './Contracts';
import Contract from './Contract';
import JobsUnpaid from './JobsUnpaid';

import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";

function App() {

  return (
    
    <Router>

      <nav className="navbar navbar-expand-lg navbar-dark bg-primary navbar-static-top" id="sideNav">
          <a className="navbar-brand js-scroll-trigger" href="#page-top">
            <span className="d-block d-lg-none">Deel</span>
          </a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link js-scroll-trigger" to="/jobs/unpaid">Unpaid Jobs</Link>
              </li>

              <li className="nav-item dropdown">
              <Link className="nav-link dropdown-toggle" to="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Contract
              </Link>
              <div className="dropdown-menu text-center" aria-labelledby="navbarDropdown">
                <Link className="dropdown-item" to="/contracts">All</Link>
                <Link className="dropdown-item" to="/contract">By Id</Link>
              </div>
              </li>

            </ul>
          </div>
      </nav>

      {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <Switch>
        <Route path="/contracts">
          <Contracts/>
        </Route>
        <Route path="/contract">
         <Contract/>
        </Route>
        <Route path="/jobs/unpaid">
         <JobsUnpaid/>
        </Route>
        
        <Redirect form="*"to="/jobs/unpaid" />
       
      </Switch>

    </Router>
  );
}

export default App;
