CREATE SEQUENCE IF NOT EXISTS my_sequence START 100000;

CREATE TABLE IF NOT EXISTS users(
user_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
profile_image VARCHAR(255),
name VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files(
file_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
file_url VARCHAR(255) NOT NULL,
user_id INT NOT NULL REFERENCES users(user_id),
file_type VARCHAR(255) NOT NULL,
file_name VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

-- started 
CREATE TABLE IF NOT EXISTS currency_types(
currency_type_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
full_name VARCHAR(255) NOT NULL UNIQUE,
symbol VARCHAR(255) NOT NULL,
currency_code VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS product_category(
product_category_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
full_name VARCHAR(255) NOT NULL UNIQUE,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS product_units(
product_units_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
full_name VARCHAR(255) NOT NULL UNIQUE,
symbol VARCHAR(255) NOT NULL,
currency_code VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS product_catalog(
product_catalog_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
full_name VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS payment_terms_types(
payment_terms_type_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
full_name VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS vendors(
vendor_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
vendor_types VARCHAR(255) NOT NULL,
service_type VARCHAR(255) NOT NULL,
first_name VARCHAR(50),
last_name VARCHAR(50),
email VARCHAR(100),
phone_number VARCHAR(20),
work_number VARCHAR(20),
-- company 
company_name VARCHAR(100),
vendor_display_name VARCHAR(100),
company_email VARCHAR(100),
company_phone_number VARCHAR(20),
company_work_number VARCHAR(20),
-- address 
address VARCHAR(255),
fax_number VARCHAR(20),
state VARCHAR(50),
zip_code VARCHAR(10),
country VARCHAR(50),
city VARCHAR(50),
shipping_address VARCHAR(255),
-- payment 
currency_id VARCHAR(20),
payment_term_id VARCHAR(20),
cnic_image jsonb[],
agreement_pdf text,
-- contact_person VARCHAR(100)
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item(
item_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
item_types VARCHAR(255) NOT NULL,
name VARCHAR(50),
product_category VARCHAR(50),
product_units VARCHAR(100),
product_usage_units VARCHAR(20),
product_catalog VARCHAR(20),
preferred_vendor VARCHAR(20),
-- track 
track_inventory boolean,
opening_stock VARCHAR(100),
opening_stock_rate_per_unit VARCHAR(100),
reorder_level VARCHAR(20),
description VARCHAR(20),
product_image jsonb[],
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);