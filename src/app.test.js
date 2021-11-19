const request = require('supertest')
let app = require('./app')


// Test are written on assumptions that we have executed dbSeed.js
describe(`API test suite`, () => {
    it(`GET, contract by Id, without 'profile_id' header should return 401 Unauthorized`, () => {
        return request(app)
        .get('/contracts/1')
        .expect(401)
    })

    it(`GET, contract by Id, with valid 'profile_id' header and 'id' param should return contract object`, () => {
        return request(app)
        .get('/contracts/1')
        .set('profile_id', '1')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
            expect(res.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    terms: expect.any(String),
                    status: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    ContractorId: expect.any(Number),
                    ClientId: expect.any(Number)
                })
            )
        })
    })

    it(`GET, list of contracts, with valid 'profile_id' header should return array of valid contracts`, () => {
        return request(app)
        .get('/contracts')
        .set('profile_id', '1')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
            expect(res.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        terms: expect.any(String),
                        status: expect.any(String),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        ContractorId: expect.any(Number),
                        ClientId: expect.any(Number)
                    })
                ])
            )
        })
    })

    it(`POST, Pay for a job, should return message when no unpaid active job for given job_id,
     otherwise return updated job object `, () => {
        return request(app)
        .post('/jobs/2/pay')
        .set('profile_id', '1')
        .then((res) => {
            if(res.statusCode == 404) {
                expect(res.text).toBe('could not find any unpaid active job for given job_id')
            }
            if(res.statusCode == 200) {
                expect(res.body).toEqual(
                    expect.objectContaining({
                        description: expect.any(String),
                        price: expect.any(Number),
                        paid: expect.any(Boolean)
                    })
                )
            }
        })
    })

    it(`POST, Deposits money into client balance should return profile with updated balance`, () => {
        return request(app)
        .post('/balances/deposit/4')
        .send({
            depositAmount: 10
        })
        .set('profile_id', '1')
        .then((res) => {
            if(res.statusCode == 200) {
                expect(res.body).toEqual(
                    expect.objectContaining({
                        "id": expect.any(Number),
                        "firstName": expect.any(String),
                        "lastName": expect.any(String),
                        "profession": expect.any(String),
                        "balance": expect.any(Number),
                        "type": expect.any(String)
                      })
                )
            }
        })
    })

})