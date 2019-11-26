const startTransaction = (connection) => {
	return new Promise(
		(resolve, reject) => {
			connection.beginTransaction(
				error => {
					if (error)
						return reject({ connection, error })
					resolve({ connection })
				}
			)
		}
	)
}

// conn ends w query - same as before
const mkQueryFromPool = (qObj, pool) => {
	return params => {
		return new Promise(
			(resolve, reject) => {
				pool.getConnection(
					(err, conn) => {
						if (err)
							return reject(err)
						qObj({ connection: conn, params: params || [] })
							.then(status => { resolve(status.result) })
							.catch(status => { reject(status.error) })
							.finally(() => conn.release() )
					}
				)
			}
		)
	}
}

// transaction: conn remains
const mkQuery = function(sql) {
	return status => {	// status defined here
		const conn = status.connection;
		const params = status.params || [];
		return new Promise(
			(resolve, reject) => {
				conn.query(sql, params,
					(err, result) => {
						if (err)
							return reject({ connection: status.connection, error: err });
						resolve({ connection: status.connection, result });
					}
				)
			}
		)
	}
}

const commit = (status) => {
	return new Promise(
		(resolve, reject) => {
			const conn = status.connection;
			conn.commit(err => {
				if (err)
					return reject({ connection: conn, error: err });
				resolve({ connection: conn });
			})
		}
	)
}

const rollback = (status) => {
	return new Promise(
		(resolve, reject) => {
			const conn = status.connection;
			conn.rollback(err => {
				if (err)
					return reject({ connection: conn, error: err });
				reject({ connection: conn, error: status.error });
			})
		}
	)
}

module.exports = { startTransaction, mkQuery, commit, rollback, mkQueryFromPool };

// Ori
// Get connection, execute query, release conn

// Transaction: Sub in middle
// Connection: conn, params[]. Execute query.
// Get back connection: conn, result: result

// Functional programming: Hose of water direct behavior
// OO: Lego blocks