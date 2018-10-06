let express = require('express');
let router = express.Router();
let pool = require('../db');
let _ = require('lodash');

// 登录与注册
router.post('/user/register', function (req, res) {
    console.log('register', req.body)
    pool.query(`INSERT INTO "users" ("name", "password") VALUES ($1, $2)`, [req.body.username, req.body.password], (err, r) => {
        if (err) {
            res.json({
                detail: '账号名重复'
            })
        } else {
            pool.query(`SELECT * FROM "users" WHERE "name" = $1 AND "password" = $2;`, [req.body.username, req.body.password], (err, r) => {
                res.json(err ? err : r.rows[0])
            })
        }
    })
});

router.post('/user/login', function (req, res) {
    console.log('login', req.body)
    pool.query(`SELECT * FROM "users" WHERE "name" = $1 AND "password" = $2;`, [req.body.username, req.body.password], (err, r) => {
        res.json(err ? err : r.rows[0])
    })
});




router.get('/generators/get', function (req, res) {
    console.log('getgenerator', req.params)
    pool.query(`SELECT * FROM "generators" WHERE "userid" = $1`, [getUserId(req)], (err, r) => {
        res.json(err ? err : r.rows)
    })
});

router.post('/generator/add', function (req, res) {
    console.log('addgenerator', req.body)
    pool.query(`INSERT INTO "generators" ("name", "userid") VALUES ($1, $2)`, [req.body.name, getUserId(req)], (err, r) => {
        res.json(err ? err : r)
    })
});

router.delete('/generator/:id', function (req, res) {
    console.log('deletegenerator', req.params)
    pool.query(`DELETE FROM plates WHERE generatorid = $1;`, [req.params.id])
    pool.query(`DELETE FROM generators WHERE id = $1;`, [req.params.id], (err, r) => {
        res.json(err ? err : r)
    })
});


router.get('/plates/get', function (req, res) {
    console.log('getplates', req.query)
    pool.query(`SELECT * FROM "plates" WHERE "generatorid" = $1 ORDER BY id`, [req.query.generatorid], (err, r) => {
        _.forEach(r.rows, row => row.options = JSON.parse(row.options))
        // console.log(r.rows)
        res.json(err ? err : r.rows)
    })
});


router.delete('/plate/:id', function (req, res) {
    console.log('deleteplate', req.params)
    pool.query(`DELETE FROM plates WHERE id = $1;`, [req.params.id], (err, r) => {
        res.json(err ? err : r)
    })
});

function poolPromise(sql, params) {
    return new Promise(function (resolve) {
        pool.query(sql, params, (err, r) => {
            resolve({
                err: err,
                res: r
            })
        })
    });
}

router.post('/plates/import', function (req, res) {
    console.log('importplates', req.body)
    let promise = [];
    req.body.adds.forEach(params => {
        promise.push(poolPromise(`INSERT INTO "plates" ("name", "options", "generatorid", "category") VALUES ($1, $2, $3, $4)`, [params.name, JSON.stringify(params.options), params.generatorid, params.category]))

    })
    req.body.changes.forEach(plate => {
        promise.push(poolPromise(`UPDATE plates SET (name, options) = ($1, $2)  WHERE id = $3`, [plate.name, JSON.stringify(plate.options), plate.id]));
    })
    Promise.all(promise).then(msg => {
        res.json(msg)
    })
});

router.post('/plate/add', function (req, res) {
    console.log("addPlat", req.body)
    addPlat(req.body, (err, r) => {
        res.json(err ? err : r)
    })
});

router.delete('/plate/:id', function (req, res) {
    console.log('deleteplate', req.params)
    pool.query(`DELETE FROM plates WHERE id = $1;`, [req.params.id], (err, r) => {
        res.json(err ? err : r)
    })
});

router.delete('/plate-by-category/:category', function (req, res) {
    console.log('deleteplate', req.params)
    pool.query(`DELETE FROM plates WHERE category = $1;`, [req.params.category], (err, r) => {
        res.json(err ? err : r)
    })
});

router.put('/plate/change', function (req, res) {
    console.log('plateChange', req.body)
    pool.query(`UPDATE plates SET (name, options) = ($1, $2)  WHERE id = $3`, [req.body.name, JSON.stringify(req.body.options), req.body.id], (err, r) => {
        res.json(err ? err : r)
    })
});

function getUserId(req) {
    let user = JSON.parse(req.query.user)
    return user.id;

}

function addPlat(params, callback) {
    console.log("addPlatSQL", params)
    pool.query(`INSERT INTO "plates" ("name", "options", "generatorid", "category") VALUES ($1, $2, $3, $4)`, [params.name, JSON.stringify(params.options), params.generatorid, params.category], callback)
}

// 返回数据
module.exports = router;