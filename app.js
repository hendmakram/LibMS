const mysql = require('mysql');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '7498',

});

connection.connect((err) => {
    if (err) throw new Error(err);
    console.log("Connection Established");
    createDB();
});

function createDB() {
    connection.query('CREATE DATABASE IF NOT EXISTS lib_ms', (err) => {
        if (err) throw new Error(err);
        console.log('Database Created');
        connection.changeUser({ database: 'lib_ms' }, (err) => {
            if (err) throw new Error(err);
            createTables();
        });

    })

}

function createTables() {
    connection.query('CREATE TABLE IF NOT EXISTS books ( ISBN VARCHAR(13) NOT NULL PRIMARY KEY, Title VARCHAR(255), Author VARCHAR(255), Quantity INT, Location VARCHAR(255))',
        (err) => {
            if (err) throw new Error(err);
            //console.log("Table Exists");
        }
    );

    connection.query('CREATE TABLE IF NOT EXISTS borrower ( borrowerID INT NOT NULL PRIMARY KEY AUTO_INCREMENT, FullName VARCHAR(255), Email VARCHAR(255), RegisterDate TIMESTAMP)',
        (err) => {
            if (err) throw new Error(err);
            //console.log("Table2 Exists");
        }
    );

    connection.query('CREATE TABLE IF NOT EXISTS borrowing (BorrowingID INT NOT NULL PRIMARY KEY AUTO_INCREMENT, ISBN VARCHAR(13), FOREIGN KEY(ISBN) REFERENCES books(ISBN), BorrowerID INTEGER, FOREIGN KEY(BorrowerID) REFERENCES borrower(borrowerID), CheckoutDate DATE, DueDate DATE, ReturnDate DATE)',
        (err) => {
            if (err) throw new Error(err);
            //console.log("Table3 Exists");
        }
    );
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const insertBook = (ISBN, Title, Author, Quantity, Location) => {
    const insertQuery = 'INSERT INTO books (ISBN, Title, Author, Quantity, Location) VALUES (?, ?, ?, ?, ?)';
    const values = [ISBN, Title, Author, Quantity, Location];
    app.post('/api', (req, res) => {
        connection.query(insertQuery, values, (err) => {
            if (err) throw new Error(err);
            else console.log("Data Inserted");
            res.end();
        })
    })

}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateBook = (updateColumn, Value, ISBN) => {
    updateColumn = updateColumn.toLowerCase();
    const update = 'UPDATE '
    const updateQuery = update.concat('books SET ', updateColumn, '= ? WHERE ISBN= ?;');
    const values = [Value, ISBN];
    app.put('/api', (req, res) => {
        connection.query(updateQuery, values, (err) => {
            if (err) throw new Error(err);
            else console.log("Data Updated");
            res.end();
        })
    })

}

//updateBook('Quantity', 7, '2');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Deletes from any table
const deleteRow = (table, column, Value) => {
    column = column.toLowerCase();
    const del = 'DELETE '
    const deleteQuery = del.concat('FROM ', table, ' WHERE ', column, '= ?;');
    const values = [Value];
    app.delete('/api', (req, res) => {
        connection.query(deleteQuery, values, (err) => {
            if (err) throw new Error(err);
            else console.log("Data Deleted");
            res.end();
        })
    })

}
//deleteBook('Quantity', 3);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Lists all data in from any table
const listAll = (tableName) => {
    const qry = 'SELECT * FROM ';
    const retrieveQuery = qry.concat(tableName);
    app.get('/api', (req, res) => {
        connection.query(retrieveQuery, (err, result) => {
            if (err) throw new Error(err);
            else console.log(result);
            res.end();
        })
    })

}
//listAll('borrowing');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const searchBooks = (value) => {
    const retrieveQuery = 'SELECT * FROM books WHERE Title LIKE ? OR ISBN LIKE ? OR Author LIKE ?;';
    const v = [value, value, value];
    app.get('/api', (req, res) => {
        connection.query(retrieveQuery, v, (err, result) => {
            if (err) throw new Error(err);
            else console.log(result);
            res.end();
        })
    })

}
//search('Book 4');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const registerBorrower = (Name, Email) => {
    const date = new Date();
    const insertQuery = 'INSERT INTO borrower (FullName, Email, RegisterDate) VALUES (?, ?, ?)';
    const values = [Name, Email, date];
    app.post('/api', (req, res) => {
        connection.query(insertQuery, values, (err) => {
            if (err) throw new Error(err);
            else console.log("Data Inserted");
            res.end();
        })
    })

}
//registerBorrower('Borrower 2', 'email2@email.com');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateBorrower = (updateColumn, Value, id) => {
    updateColumn = updateColumn.toLowerCase();
    const update = 'UPDATE '
    const updateQuery = update.concat('borrower SET ', updateColumn, '= ? WHERE borrowerID= ?;');
    const values = [Value, id];
    app.put('/api', (req, res) => {
        connection.query(updateQuery, values, (err) => {
            if (err) throw new Error(err);
            else console.log("Data Updated");
            res.end();
        })
    })

}

//updateBorrower('FullName', 'Name 1', '1');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const borrowBook = (borrowerID, ISBN) => {
    const checkoutDate = new Date();
    const dueDate = new Date(checkoutDate);
    dueDate.setDate(checkoutDate.getDate() + 30);

    const insertQuery = 'INSERT INTO borrowing (BorrowerID, CheckoutDate, DueDate, ISBN) VALUES (?, ?, ?, ?)';
    const values = [borrowerID, checkoutDate, dueDate, ISBN];
    app.post('/api', (req, res) => {
        connection.query(insertQuery, values, (err) => {
            if (err) throw new Error(err);
            else console.log("Data Inserted");
            res.end();
        })
    })

}

//borrowBook(1, '4');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const returnBook = (borrowerID, ISBN) => {
    const returnDate = new Date();
    const updateQuery = 'UPDATE borrowing SET ReturnDate = ? WHERE borrowerID= ? AND ISBN = ?;';
    const values = [returnDate, borrowerID, ISBN];
    app.put('/api', (req, res) => {
        connection.query(updateQuery, values, (err) => {
            if (err) throw new Error(err);
            else console.log("Data Updated");
            res.end();
        })
    })

}

//returnBook(1, '4');

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const listBorrowed = (borrowerID) => {
    const retrieveQuery = 'SELECT * FROM borrowing WHERE BorrowerID = ?';
    const values = [borrowerID];
    app.get('/api', (req, res) => {
        connection.query(retrieveQuery, values, (err, result) => {
            if (err) throw new Error(err);
            else console.log(result);
            res.end();
        })
    })

}

//listBorrowed(1);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const listOverdue = () => {
    const retrieveQuery = 'SELECT * FROM borrowing WHERE ReturnDate > DueDate';
    app.get('/api', (req, res) => {
        connection.query(retrieveQuery, (err, result) => {
            if (err) throw new Error(err);
            else console.log(result);
            res.end();
        })
    })

}
listOverdue();

app.listen(3000);