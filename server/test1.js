
// node test.js
const mysql = require('mysql');
const fs = require('fs');

const config = require(__dirname + '/config');
config.ssl = { ca: fs.readFileSync(config.cacert) };
const pool = mysql.createPool(config);

// SQL
const CREATE_ORDER = 'insert into orders(order_date, email) values (?, ?)';
const GET_NEW_ORDER_ID = 'select last_insert_id() as order_id from orders'; 
const CREATE_ORDER_DETAILS = 'insert into line_item(description, quantity, order_id) values ?'; // Array of arrays
// last_insert_id(): returns value generated for an AUTO_INCREMENT col by previous INSERT or UPDATE statement


// Test data
const newOrder = [new Date(), 'belloz1@gmail.com'];
const newOrderSample = [
    ['apple', 20],
    ['grapes', 10],
    ['orange', 30]
]

// Get a connection
pool.getConnection(
    (err,conn) => {
        if (err)
            throw err;
        // start transaction
        conn.beginTransaction(
            err => {
                if (err) {
                    conn.release();
                    throw err;
                }
                conn.query(CREATE_ORDER, newOrder,
                    (err, result) => {
                        if (err) {
                            conn.rollback();
                            conn.release();
                            throw err;
                        }
                        conn.query(GET_NEW_ORDER_ID,
                            (err, result) => {
                                if (err) {
                                    conn.rollback();
                                    conn.release();
                                    throw err;
                                }
                                // insertId in result
						        //console.info('result: ', result);
                                const newOrderId = result[0].order_id;
                                // console.log('order details before: ', newOrderDetails)
                                const newOrderDetails =  newOrderSample.map(
                                    v => {
                                        v.push(newOrderId);
                                        return (v);
                                    }   
                                )
                                conn.query(CREATE_ORDER_DETAILS, [newOrderDetails],
                                    (err, result) => {
                                        if (err) {
                                            conn.rollback();
                                            conn.release();
                                            throw err;
                                        }
                                        // console.log('result: ', result);
                                        console.log('committing result');
                                        conn.commit(
                                            err => {
                                                if (err) {
                                                conn.rollback();
                                                conn.release();
                                                throw err;
                                            }
        
                                            conn.release();
                                            process.exit(1);
                                        } // commit
										);
									} // CREATE_ORDER_DETAILS
								)
							} // GET_NEW_ORDER_ID
						)
					} // CREATE_ORDER
				); 
			} // beginTransaction
		)
	} // getConnection
)
