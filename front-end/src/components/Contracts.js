import React, { useState, useEffect } from 'react'


function Contracts() {
  const [data, setData] = useState([]);
  
  const url = 'http://localhost:3001/contracts'

  useEffect(() => {
    return () => console.log('d')
  }, [])

  const getData = (id) => {
    if(!id) return;

    fetch(url, 
      {
        method: 'GET',
        headers: 
        { 
          'profile_id': id
        }
      }
    ).then(res => res.json())
    .then(res => {
      console.log('res', res)
      setData(res)
    })
    .catch((err) => {
      setData([])
      console.log("Error:", err)
    })
  }

  const handleChange = (profileId) => {
    getData(profileId)
  }

  return (
    <div className="container-fluid p-lg-5 mt-3">
      <h2>Contracts</h2>
      <h6>Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.</h6>

      <div className="container-fluid my-3">
        <div className="row align-items-start">
          <div class="col-md-6">
            <input type="text" className="form-control" placeholder="Enter the your Profile Id for Authentication Here"
            onChange={e => handleChange(e.target.value)}></input>
          </div>
          <div class="col-md-4"></div>
        </div>
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
            data.length ?
            data.map((item, index) => 
            <tr key={index}>
              <td>{item.terms}</td>
              <td>{item.status}</td>
              <td>{item.createdAt}</td>
              <td>{item.ContractorId}</td>
              <td>{item.ClientId}</td>
            </tr>
            ): <tr><td colSpan='6'><p style={{ textAlign: 'center'}}>No Contracts found for the profile</p></td></tr>
          }
        </tbody>
        </table>
      </div>

    </div>
  );
}

export default Contracts;
