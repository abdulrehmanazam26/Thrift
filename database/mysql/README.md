# Local MySQL for Thrift Karo

The local server runs only on `127.0.0.1:3307`. Its data folder is in `work/mysql-data` (ignored by Git).

Import `setup.sql` once to create the complete custom ecommerce structure. Product images are stored as file paths, not database binary data. The one-piece product lock is implemented in the checkout transaction with `SELECT ... FOR UPDATE`.
