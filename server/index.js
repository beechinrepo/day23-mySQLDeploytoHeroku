
// Load libraries
const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const fs = require('fs');
const db = require('./dbutil');

/// Configure app
let config;

if (fs.existsSync(__dirname + '/config.js')) {
	config = require(__dirname + '/config');
	config.ssl = {
		 ca: fs.readFileSync(config.cacert)
	};
} else {
	console.info('using env');
	config = {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: 'sales',
		connectionLimit: 4,
		ssl: {
			ca: process.env.DB_CA
		}
	};
}
const pool = mysql.createPool(config);
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;

// SQL statements
// POST
const CREATE_ORDER = 'insert into orders(order_date, email) values (?, ?)';
const GET_NEW_ORDER_ID = 'select last_insert_id() as order_id from orders';
const CREATE_ORDER_DETAILS = 'insert into line_item(description, quantity, order_id) values ?';

const createOrder = db.mkQuery(CREATE_ORDER);
const getNewOrderId = db.mkQuery(GET_NEW_ORDER_ID)
const createOrderDetails = db.mkQuery(CREATE_ORDER_DETAILS);

// GET ALL
const GET_ALL_ORDERS = 'select * from orders';
const getAllOrders = db.mkQueryFromPool(db.mkQuery(GET_ALL_ORDERS), pool);

// GET BY ID
const FIND_ORDER_BY_ID = 'select * from orders o join line_item od on o.order_id = od.order_id where o.order_id= ?'
const getOrderByOrderId = db.mkQueryFromPool(db.mkQuery(FIND_ORDER_BY_ID), pool);

const DELETE_ORDER_DETAILS = 'delete from line_item where order_id=?';
const deleteOrderDetails = db.mkQuery(DELETE_ORDER_DETAILS);

// // UPDATE BY ID
// const UPDATE_ORDER_DETAILS_BY_ID = 'update line_item set description= ?, quantity= ? where order_id = ?'
// const updateOrderDetailsByOrderId = db.mkQueryFromPool(db.mkQuery(UPDATE_ORDER_DETAILS_BY_ID), pool);

// Transaction: can't close conn; pass conn
// const createOrderStandAlone = db.mkQueryFromPool(createOrder, pool);

// Start app
const app = express();

app.use(morgan('tiny'));

app.use(express.static(__dirname + '/angular')); 

//test

app.get('/api/order/:orderId',
	(req, resp) => {
		const orderId = parseInt(req.params.orderId);
		getOrderByOrderId([ orderId ])
			.then(result => {
				if (result.length <= 0)
					return resp.status(404).type('application/json').json({});
				const order = {
					email: result[0].email,
					orderId: result[0].order_id,
					orderDetails: []
				}
				order.orderDetails = result.map(v => {
					return {
						item_id: v.item_id, // [{all cols}, {}, {}]
						description: v.description,
						quantity: v.quantity
					}
				});
				resp.status(200).type('application/json').json(order);
			})
			.catch(error => {
				resp.status(400).type('application/json').json({ error })
			})
	}
)

app.get('/api/orders',
	(req, resp) => {
		getAllOrders()
			.then(result => {
				resp.status(200).type('application/json').json(result)
			})
			.catch(error => {
				resp.status(400).type('application/json').json({ error })
			})
	}
)

app.post('/api/order/:orderId', express.json(),
    (req, resp) => {
        console.info("request body:", req.body);
        //console.info("request params:", req.params);
        const editOrder = req.params.orderId;
        const newOrder = [ editOrder, req.body.email];
        const newOrderSample = req.body.orderDetails.map(v=> [v.description, v.quantity]);

        console.info("editOrder:", editOrder);
        console.info("newOrder:", newOrder);
        console.info("newOrderSample:", newOrderSample);

        //resp.status(201).json({});

        // Get a conection
        pool.getConnection(
            (err, conn) => {
                if (err)
                    throw err;
                // Start transaction
                // { connection, result, params, error }
                db.startTransaction(conn)
                    .then(status => {
                        //status.connection
                        return (
                            deleteOrderDetails({
                                connection: status.connection,
                                params: editOrder
                            })
                        )
					})
					// .then(db.passthru, db.logError);
                    //.then(getNewOrderId) // (status) => { }
                    .then(status => {
                        console.info('console: before getNewOrderId: ', status.result);
                        //const newOrderId = status.result[0].ord_id;
                        const newOrderId = editOrder;
                        const newOrderDetails = newOrderSample.map(
                            v => {
                                v.push(newOrderId);
                                return (v);
                            }
                        )
                        console.info('newOrderDetails: ', newOrderDetails);
                        return (
                            createOrderDetails({
                                connection: status.connection,
                                params: [ newOrderDetails ] 
                            })
                        )
                    })
                    .then(db.commit, db.rollback)
                    .then(
                        (status) => { resp.status(201).json({}); },
						(status) => { resp.status(400).json({ error: status.error }); }
                    )
                    .finally (() => { conn.release() })
            }   // getConnection
        )
    }
);


app.post ('/api/order', express.json(),
    (req,resp) => {
        console.log('body: ', req.body);
        const newOrder = [new Date(), req.body.email];
        const newOrderSample = req.body.orderDetails.map(v => [v.description, v.quantity]);
        console.log('order: ', newOrder);
        console.log('orderdetails: ', newOrderSample);
        // res.status(201).json({});
		pool.getConnection(
			(err, conn) => {
				if (err)
					throw err;
				// Start transaction
				// { connection, result, params, error }
				db.startTransaction(conn)
					.then(status => {
						//status.connection
						return (
							createOrder({ 
								connection: status.connection, 
								params: newOrder
							})
						)
					})
					// .then(getNewOrderId) // (status) => { }
					.then(status => {
						// const newOrderId = status.result[0].ord_id;
						const newOrderId = status.result.insertId;
						const newOrderDetails = newOrderSample.map(
							v => {
								v.push(newOrderId);
								return (v);
							}
						);
						return (
							createOrderDetails({
								connection: status.connection,
								params: [ newOrderDetails ]
							})
						)
					})
					.then(db.commit, db.rollback)
					.then(
						(status) => { resp.status(201).json({}); },
						(status) => { resp.status(400).json({ error: status.error }); }
					)
					.finally(() => { conn.release() })
			} // getConnection
		)
	}
)



pool.getConnection(
    (err, conn) => {
        if (err) {
            console.error('Cannot get database: ', err);
            return process.exit(0);
        }
        conn.ping((err) => {
            conn.release();
            if (err) {
                console.error('Cannot ping database: ', err);
                return process.exit(0);
            }
            app.listen(PORT,
                () => {
                    console.info(`Application stared on ${PORT} at ${new Date().toString()}`);
                }
            )
        })
    }
)

//catch can be condition: false 
//nodemon: auto user default js. node mainjs need to restart everytime update
// The map() method creates a new array with the results of calling a provided function on every element in the calling array.

// POST /api/order, application/json
// req.body => 201
/*
 * { 
 * 	email: 'fred@gmail.com', 
 * 	orderDetails: [
 * 		{ description: 'apple', quantity: 10 },
 * 		{ description: 'orange', quantity: 10 },
 * 	]
 * 	} 
 * */

 // app.post('/api/order/:orderId',
// 	(req, resp) => {
// 		console.log(req.body);
// 		let description = req.body.description;
// 		let quantity = req.body.quantity;
// 		let orderId = parseInt(req.params.orderId);  
// 		updateOrderDetailsByOrderId([ description, quantity, orderId ])
// 			.then(() => {
// 				resp.status(200).type('application/json').json({message: 'updated'})
// 			})
// 			.catch(error => {
// 				resp.status(400).type('application/json').json({ error })
// 			})
// 	}
// )