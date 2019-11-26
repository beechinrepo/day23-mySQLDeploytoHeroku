drop database if exists sales;

create database sales;

use sales;

create table user (
    email varchar(128) not null,
    user_name varchar(128) not null,
    
    primary key(email),
    key(user_name)

);

create table orders (
    order_id int auto_increment,
    order_date date,                                 -- yyyy-mm-dd
    last_update timestamp default current_timestamp  -- YYYY-MM-DD HH:MM:SS
        on update current_timestamp,
    email varchar(64),

    primary key(order_id),

    constraint fk_email
        foreign key(email) references user(email)
);
-- DEFAULT CURRENT_TIMESTAMP: any INSERT w/o explicit time stamp setting uses the current time
-- ON UPDATE CURRENT_TIMESTAMP: any update w/o explicit timestamp results in an update to the current timestamp value

create table line_item (
    item_id int auto_increment,
    description varchar(256) not null,
    quantity int default 1,
    order_id int not null,

    primary key(item_id),

    constraint fk_order_id
        foreign key(order_id) references orders(order_id)
);

insert into user (email, user_name) values 
    ('belloz1@gmail.com', 'belloz1'),
    ('belloz2@gmail.com', 'belloz2'),
    ('belloz3@gmail.com', 'belloz3'),
    ('belloz4@gmail.com', 'belloz4');

