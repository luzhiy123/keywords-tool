let pool = require('./db');
let _ = require('lodash');

function poolPromise(sql, params) {
    return new Promise(function (resolve) {
        pool.query(sql, params, (err, r) => {
            resolve({
                err: err,
                data: r
            })
        })
    });
}

poolPromise(`SELECT * FROM "plates" ORDER BY index, id`).then((res) => {
    _.forEach(res.data.rows, row => {
        let options = JSON.parse(row.options)
        options = options.map(value => {
            if (_.isString(value)) {
                return {
                    c: [],
                    v: value
                }
            } else {
                return value
            }
        })
        poolPromise(`UPDATE plates SET options = $1  WHERE id = $2`, [JSON.stringify(options), row.id]).then((res) => {
            if (res.err) {
                console.log(res.err);
            }
        })

    })
    console.log('get', res)
})