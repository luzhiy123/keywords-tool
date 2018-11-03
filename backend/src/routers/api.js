let express = require('express');
let router = express.Router();
let pool = require('../db');
let _ = require('lodash');

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
    pool.query(`SELECT * FROM "generators" WHERE "userid" = $1 ORDER BY id`, [getUserId(req)], (err, r) => {
        res.json(err ? err : r.rows)
    })
});

router.post('/generator/add', function (req, res) {
    console.log('addgenerator', req.body)
    pool.query(`INSERT INTO "generators" ("name", "userid") VALUES ($1, $2)`, [req.body.name, getUserId(req)], (err, r) => {
        res.json(err ? err : r)
    })
});


router.post('/generator/change', function (req, res) {
    console.log('changeGenerator', req.body)
    pool.query(`UPDATE generators SET name = $1  WHERE id = $2`, [req.body.name, req.body.id], (err, r) => {
        res.json(err ? err : r)
    })
});

router.post('/category/add', function (req, res) {
    console.log('addgenerator', req.body)
    pool.query(`INSERT INTO "categories" ("name", "generatorid") VALUES ($1, $2)`, [req.body.name, req.body.generatorid], (err, r) => {
        res.json(err ? err : r)
    })
});

router.post('/category/change', function (req, res) {
    console.log('changeCategory', req.body)
    pool.query(`UPDATE categories SET name = $1  WHERE id = $2`, [req.body.name, req.body.id], (err, r) => {
        res.json(err ? err : r)
    })
});

router.get('/categories/get', function (req, res) {
    console.log('getCategory', req.query)
    pool.query(`SELECT * FROM "categories" WHERE "generatorid" = $1`, [req.query.id], (err, r) => {
        res.json(err ? err : r.rows);
    })
});


router.delete('/category/:id', function (req, res) {
    console.log('addgenerator', req.body)
    pool.query(`DELETE FROM categories WHERE id = $1;`, [req.params.id])
    pool.query(`DELETE FROM plates WHERE categoryid = $1;`, [req.params.id], (err, r) => {
        res.json(err ? err : r)
    })
});

router.delete('/generator/:id', function (req, res) {
    console.log('deletegenerator', req.params)
    poolPromise(`SELECT * FROM "categories" WHERE "generatorid" = $1`, [req.params.id]).then((r) => {
        if (r.err) {
            res.json({
                detail: '服务器错误！'
            })
        } else {
            if (r.res.rows && r.res.rows.length) {
                res.json({
                    detail: '该模版不为空，禁止删除！'
                })
            } else {
                pool.query(`DELETE FROM categories WHERE generatorid = $1;`, [req.params.id])
                pool.query(`DELETE FROM plates WHERE generatorid = $1;`, [req.params.id])
                pool.query(`DELETE FROM generators WHERE id = $1;`, [req.params.id], (err, r) => {
                    res.json(err ? {
                        detail: '服务器错误！'
                    } : r)
                })
            }
        }
    })
});


router.get('/plates/get', function (req, res) {
    console.log('getplates', req.query)
    pool.query(`SELECT * FROM "plates" WHERE "generatorid" = $1 ORDER BY index, id`, [req.query.generatorid], (err, r) => {
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

router.post('/plates/import', function (req, res) {
    console.log('importplates', req.body)
    let promise = [];

    // 改
    req.body.changes.forEach(plate => {
        promise.push(poolPromise(`UPDATE plates SET (name, options) = ($2, $3)  WHERE id = $1`, [plate.id, plate.name, JSON.stringify(plate.options)]));
    })

    // 增加
    poolPromise(`SELECT * FROM "categories" WHERE "generatorid" = $1`, [req.body.generatorid]).then(data => {
        let categories = data.res.rows;
        let categoryNames = _.chain(req.body.adds)
            .map('categoryName')
            .uniq()
            .compact()
            .value();
        _.forEach(categoryNames, name => {
            if (!categories.find(category => category.name === name)) {
                promise.push(poolPromise(`INSERT INTO "categories" ("name", "generatorid") VALUES ($1, $2)`, [name, req.body.generatorid]))
            }
        })


        Promise.all(promise).then(() => {
            poolPromise(`SELECT * FROM "categories" WHERE "generatorid" = $1`, [req.body.generatorid]).then(data => {
                if (data.res) {
                    let categories = data.res.rows;
                    req.body.adds.forEach(params => {
                        params.categoryid = getIdByName(params.categoryName);
                        promise.push(poolPromise(`INSERT INTO "plates" ("name", "options", "generatorid", "categoryid") VALUES ($1, $2, $3, $4)`, [params.name, JSON.stringify(params.options), req.body.generatorid, params.categoryid]))

                    })
                    Promise.all(promise).then(msg => {
                        res.json(msg)
                    })

                    function getIdByName(name) {
                        let category = categories.find(category => category.name === name) || {};
                        return category.id;
                    }

                } else {
                    res.json({
                        detail: '服务器错误！'
                    })
                }
            })
        })
    })
});


router.post('/plate/add', function (req, res) {
    console.log("addPlat", req.body)
    addPlat(req.body).then(data => {
        res.json(data.err ? data.err : data.res)
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

router.put('/plate/order/change', function (req, res) {
    console.log('plateorderChange', req.body)
    let promise = [];
    req.body.ids.forEach((id, index) => {
        promise.push(poolPromise(`UPDATE plates SET index = $1  WHERE id = $2`, [index, id]))
    })
    Promise.all(promise).then(msg => {
        res.json(msg)
    })
});

function getUserId(req) {
    let user = JSON.parse(req.query.user)
    return user.id;

}

function addPlat(params) {
    console.log("addPlatSQL", params)
    return poolPromise(`INSERT INTO "plates" ("name", "options", "generatorid", "categoryid") VALUES ($1, $2, $3, $4)`, [params.name, JSON.stringify(params.options), params.generatorid, params.categoryid])
}

// 返回数据
module.exports = router;