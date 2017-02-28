var express = require('express');
var mysql = require('mysql');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('area');
});

/* GET users listing. */
router.post('/add', function(req, res, next) {
    var connection = mysql.createConnection({
        host    :'localhost',
        port : 3306,
        user : 'wp.mysql',
        password : 'wp.mysql',
        database:'wp'
    });

    connection.connect(function(err) {
        if (err) {
            console.error('mysql connection error');
            console.error(err);
            throw err;
        }
    });
// `name` varchar(120) NOT NULL COMMENT '행정구역명',
// `type` char(10) DEFAULT NULL COMMENT '행정구역구분',
// `address` varchar(240) DEFAULT NULL COMMENT '주소',
// `manager` varchar(24) DEFAULT NULL COMMENT '담당자',
// `tel` char(11) DEFAULT NULL COMMENT '전화번호',
// `parent_id` int(11) DEFAULT NULL COMMENT '상위행정구역id',
// `remark` varchar(120) DEFAULT NULL COMMENT '비고',

    let sql = 'insert into AREA ' +
                '(name, type, address, manager, tel, remark)' +
                ' values ' +
                '("용인1", "manager", "주소", "관리자", "01000000000", "비고")';

    connection.query(sql, function(error, result) {
        // And done with the connection.
        //connection.release();
        if (error) throw error;
        console.log(result.insertId);
        // Don't use the connection here, it has been returned to the pool.
    });
    res.send('respond with a resource');

});



module.exports = router;
