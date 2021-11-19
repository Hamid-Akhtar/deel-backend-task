import React, { useState, useEffect } from 'react'

function Contract() {
  const [data, setData] = useState(null);
  
  // const [columns, setColumns] = useState([]);

  let [inputs, setInputs] = useState({
    contractId: null, profileId: null
  })
  
  const url = 'http://localhost:3001/contracts'

  useEffect(() => {
  }, [])

  const getData = () => {
    fetch(url + '/' + inputs.contractId, 
      {
        method: 'GET',
        headers: 
        { 
          'profile_id': inputs.profileId
        }
      }
    ).then(res => res.json())
    .then(res => {
      console.log('res', res)
      setData(res)
    })
    .catch((err) => {
      setData(null)
      console.log("Error:", err)
    })
  }

  const handleProfileIdChange = (profileId) => {
    
    setInputs({...inputs, profileId})
  }

  const handleContractIdChange = (contractId) => {
    setInputs({...inputs, contractId})
  }

  const getResults = () => {
    console.log('results get inputs', inputs)
    if(!inputs.contractId || !inputs.profileId) return;
    getData()
  }

  return (
    <div className="container-fluid p-lg-5 mt-3">
      <h2>Contract By Id</h2>
      <h6>Get a contract only if it belongs to the profile calling it based on Contract Id provided</h6>

      <div className="container-fluid my-3">
        <div className="row align-items-start">
          <div class="col-md-6">
            <input type="text" className="form-control" placeholder="Enter the your Profile Id for Authentication Here"
            onChange={e => handleProfileIdChange(e.target.value)} value={inputs.profileId} ></input>
          </div>
          <div className="col-md-6">
            <input type="text" className="form-control" placeholder="Enter the your Contract Id for your Contract"
            onChange={e => handleContractIdChange(e.target.value)} value={inputs.contractId}></input>
          </div>
        </div>
        <button type="button" className="btn btn-secondary mt-3"
        onClick={e => getResults()}>Get Results</button>
      </div>

      <div className="table-responsive-sm">
        <table className="table table-bordered mt-4">
        <thead className="thead">
          <tr>
            <th scope="col">
              Terms
            </th>
            <th scope="col">
              Status
            </th>
            <th scope="col">
              Created At
            </th>
            <th scope="col">
              Contractor Id
            </th>
            <th scope="col">
              Client Id
            </th>
          </tr>
        </thead>
        <tbody>
          {
            data ?
            (<tr>
              <td>{data.terms}</td>
              <td>{data.status}</td>
              <td>{data.createdAt}</td>
              <td>{data.ContractorId}</td>
              <td>{data.ClientId}</td>
            </tr>) : <tr><td colSpan='6'><p style={{ textAlign: 'center'}}>Contract not found.</p></td></tr>
          }

        </tbody>
        </table>
      </div>

    </div>
  );
}

export default Contract;
