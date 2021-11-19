const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();
const { Op } = require("sequelize");

app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use(express.static('public'))

/**
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
    const profileId = req.profile.id
    const {Contract} = req.app.get('models')
    const {id} = req.params
    
    // return the contract only if it belongs to the profile calling it
    const contract = await Contract.findOne({where: {id, [Op.or]: [{ContractorId: profileId}, {ClientId: profileId}]}})
    
    if(!contract) return res.status(404).end()
    
    res.json(contract)
})

/**
 * @returns a list of contracts belonging to a user (client or contractor) and,
 *  should only contain non terminated contract
 */
app.get('/contracts', getProfile, async (req, res) => {
    const profileId = req.profile.id
    const {Contract} = req.app.get('models')
    
    const contracts = await Contract.findAll(
        {
            where: 
            {
                [Op.or]: [{ContractorId: profileId}, {ClientId: profileId}],
                [Op.not]: [{status: 'terminated'}]
            }
        }
    )
    
    if(!contracts) return res.status(404).end()

    res.json(contracts)
})

/**
 * @returns all unpaid jobs for a user (either a client or contractor), for active contracts only.
 */
app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const profileId = req.profile.id
    const {Job, Contract} = req.app.get('models')
    
    const jobs = await Job.findAll(
        {
            include: 
            [{
                model: Contract,
                where: 
                {
                    [Op.or]: [{ContractorId: profileId}, {ClientId: profileId}],
                    [Op.not]: [{status: 'terminated'}]
                }
            }],
            where: 
            {
                paid: false
            }
        }
    )
    
    if(!jobs) return res.status(404).end()

    res.json(jobs)
})

/**
 * Pay for a job, a client can only pay if his balance >= the amount to pay.
 * The amount should be moved from the client's balance to the contractor balance.
 */
app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    const profileId = req.profile.id
    const {Job, Contract, Profile} = req.app.get('models')
    const {job_id} = req.params
    
    // find the unpaid active job for the client by given job_id
    const job = await Job.findOne(
        {
            include: 
            [{
                model: Contract,
                include: [{ model: Profile, as : 'Client' }],
                where: 
                {
                    ClientId: profileId,
                    [Op.not]: [{status: 'terminated'}]
                }
            }],
            where: 
            {
                id: job_id,
                paid: false
            }
        }
    )
    
    if(!job) return res.status(404).send('could not find any unpaid active job for given job_id')

    const amountToBePaid = job.price
    const clientBalance = job.Contract.Client.balance 

    if(clientBalance < amountToBePaid) 
        return res.status(500).send('You dont have enough balance to pay for this job')

    const newBalance = clientBalance - amountToBePaid

    Profile.update(
        {balance: newBalance},
        {where: {id: profileId} }
    )
    .then((clientRowsUpdated) => {
        if (!clientRowsUpdated) return res.status(500).send('Failed to Update Client Balance')
        return Job.update(
            {paid: true, paymentDate: sequelize.literal('CURRENT_TIMESTAMP')},
            {where: {id: job_id} }
        )
    })
    .then((JobRowsUpdated) => {
        if (!JobRowsUpdated) return res.status(500).send('Failed to Update Job Payment Record')
        return Job.findOne({ where: {id: job_id}  })
    })
    .then((job) => {
        return res.status(200).json(job)
    })
    .catch((err) => {
        return res.status(500).send(err)
    })
})

/**
 * Deposits money into the the the balance of a client,
 *  a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
 * @depositAmount should be provided req.body
 * @userId should be provided in req.params
 */
app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
    const {Job, Contract, Profile} = req.app.get('models')
    const {depositAmount} = req.body
    const {userId} = req.params
    
    const jobs = await Job.findAll(
        {
            include: 
            [{
                model: Contract,
                include: [{ model: Profile, as : 'Client' }],
                where: 
                {
                    ClientId: userId,
                    [Op.not]: [{status: 'terminated'}]
                }
            }],
            where: 
            {
                paid: false
            }
        }
    )
    
    if(!jobs) return res.status(404).end()
    
    let totalJobs25Percent = 0

    jobs.forEach(job => {
        totalJobs25Percent += job.price
    });

    totalJobs25Percent = totalJobs25Percent * 0.25

    if(depositAmount > totalJobs25Percent) 
        return res.status(500).send(`Can't deposit because depositAmount is greater than 25% of jobs to pay total.`)

    let newBalance = jobs[0].Contract.Client.balance + depositAmount 
    console.log('newBalacne', newBalance)

    await Profile.update(
        {balance: newBalance},
        {where: {id: userId}}
    )
    .then((clientRowUpdated) => {
        if (!clientRowUpdated) return res.status(500).send('Failed to Update Client Balance')
        return Profile.findOne({where: {id: userId}, as : 'Client' })
    })
    .then((profile) => {
        return res.status(200).json(profile)
    })
    .catch((err) => {
        return res.status(500).send(err)
    })
    
})

/**
 * @returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
 * should have query params `?start=<yyyy-mm-dd>&end=<yyyy-mm-dd>`
 */
 app.get('/admin/best-profession', getProfile, async (req, res) => {
    const {Job, Contract, Profile} = req.app.get('models')
    const {start, end} = req.query

    let jobQueryConditions = { paid: true }
    
    if(start && end) {
        const startedDate = new Date(start)
        const endDate = new Date(end)
        jobQueryConditions = 
        { 
            ...jobQueryConditions,
            [Op.and]: 
            [
                {
                    createdAt: { [Op.gte]: startedDate }
                }, 
                {
                    paymentDate: { [Op.lte]: endDate }
                }
            ] 
        }
    }
    
    const contractors = await Profile.findAll(
        {
            where: 
            {
                type: 'contractor'
            },
            group: ['profession'],
            attributes: ['profession'],
            include: 
            [{
                model: Contract, as: 'Contractor',
                include: [{ 
                    model: Job, where: jobQueryConditions, 
                    attributes: [[sequelize.fn('sum', sequelize.col('paid')), 'total_earned']]
                }]
            }]
        }
    )
    
    if(!contractors) return res.status(404).end()

    let max_earned_amount = 0
    let maxEarnedProfession = ''
    let currentTemp = 0
    contractors.forEach(element => {
        if(!element.Contractor[0]?.Jobs[0]?.dataValues?.total_earned) return
        currentTemp = element.Contractor[0]?.Jobs[0]?.dataValues?.total_earned

        if(currentTemp> max_earned_amount) {
            max_earned_amount = currentTemp
            maxEarnedProfession = element.profession
        }
    })

    return res.json({ maxEarnedProfession, max_earned_amount })
})

/**
 * @returns returns the clients the paid the most for jobs in the query time period.
 *  limit query parameter should be applied, default limit is 2.`
 */
 app.get('/admin/best-clients', getProfile, async (req, res) => {
    const {Job, Contract, Profile} = req.app.get('models')
    const {start, end, limit = 2} = req.query

    let jobQueryConditions = { paid: true }
    
    if(start && end) {
        const startedDate = new Date(start)
        const endDate = new Date(end)
        jobQueryConditions = 
        { 
            paid: true, 
            [Op.and]: 
            [
                {
                    createdAt: { [Op.gte]: startedDate }
                }, 
                {
                    paymentDate: { [Op.lte]: endDate }
                }
            ] 
        }
    }

    const jobs = await Job.findAll(
        {
            where: jobQueryConditions,
            order: [
                ['price', 'DESC']
            ],
            limit,
            include: 
            [{
                model: Contract,
                include: [{ 
                    model: Profile, where: { type: 'client' }, as: 'Client'
                }]
            }]
        }
    )
    
    if(!jobs) return res.status(404).end()

    resJobs = []

    jobs.forEach((job) => {
        if(!job?.Contract?.Client?.id)
          return
        
        resJobs.push({
            id: job?.Contract?.Client?.id,
            fullName: job?.Contract?.Client?.firstName + ' ' + job?.Contract?.Client?.lastName,
            paid: job?.dataValues?.price
        })
    })

    return res.json(resJobs)
})


module.exports = app;
