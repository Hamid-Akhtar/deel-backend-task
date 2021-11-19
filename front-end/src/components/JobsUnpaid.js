import React, { useState, useEffect } from 'react'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

function JobsUnpaid() {
  const [data, setData] = useState([]);
  const [profileId, setProfileId] = useState(0);
  
  const url = 'http://localhost:3001'

  useEffect(() => {
    return () => console.log('d')
  }, [])

  const getData = (id) => {
    fetch(url + '/jobs/unpaid', 
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

  const payForJob = (jobId) => {
    fetch(url + `/jobs/${jobId}/pay`, 
      {
        method: 'POST',
        headers: 
        { 
          'profile_id': profileId
        }
      }
    ).then(res => res.json())
    .then(res => {
      console.log('res', res)
      toastr.success(`Successfully Paid for Job with Id ${jobId}`)
      setData([])
    })
    .catch((err) => {
      toastr.error('Failed to Pay for Job. Please make sure you have enough balance!')
      console.log("Error:", err)
    })
  } 

  const handleChange = (profileId) => {
    setProfileId(profileId)
    getData(profileId)
  }

  return (
    <div className="container-fluid p-lg-5 mt-3">
      <h2>Unpaid Jobs</h2>
      <h6>Get all unpaid jobs for a user (either a client or contractor), for active contracts only.</h6>

      <div className="container-fluid my-3">
        <div className="row align-items-start">
          <div class="col-md-6">
            <input type="text" className="form-control" placeholder="Enter the your Profile Id for Authentication Here"
            onChange={e => handleChange(e.target.value)}></input>
            {/* <div className="invalid-feedback">
              Please provide a taskdssd
            </div> */}
            {/* <button type="button" className="btn btn-success mt-3">Get Results</button> */}
          </div>
          <div class="col-md-4"></div>
        </div>
      </div>

      <div className="table-responsive-sm">
        <table className="table table-bordered mt-4">
        <thead className="thead">
          <tr>
            <th scope="col">
              Description
            </th>
            <th scope="col">
              Paid
            </th>
            <th scope="col">
              Created At
            </th>
            <th scope="col">
              Price
            </th>
            <th scope="col">
              Contract Status
            </th>
            <th scope="col">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {
            data.length ? data.map((item, index) => 
            <tr key={index}>
              <td>{item.description}</td>
              <td>{ item.paid.toString() }</td>
              <td>{item.createdAt}</td>
              <td>{item.price}</td>
              <td>{item.Contract.status}</td>
              <td><button type="button" className="btn btn-success mt-3" 
              onClick={e => payForJob(item.id)}>Pay</button></td>
            </tr>
            ) : <tr><td colSpan='6'><p style={{ textAlign: 'center'}}>No Unpaid Jobs Found for the profile</p></td></tr>
          }
        </tbody>
        </table>
      </div>

    </div>
  );
}

export default JobsUnpaid;
