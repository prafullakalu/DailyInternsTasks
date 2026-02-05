create database companyManagement;


use companyManagement;


create table company (
    companyId int identity primary key,
    companyName varchar(100) not null
);

SELECT * FROM company

INSERT INTO users  (companyId, userName)
VALUES
(2, 'Rahul');

create table users (
    userId int identity primary key,
    companyId int not null,
    userName varchar(100) not null,
    foreign key (companyId) references company(companyId)
);


create table marketing (
    marketingId int identity primary key,
    userId int not null,
    foreign key (userId) references users(userId)
);


create table personal (
    personalId int identity primary key,
    userId int not null,
    foreign key (userId) references users(userId)
);

create table devices (
    deviceId int identity primary key,
    companyId int not null,
    deviceName varchar(100) not null,
    foreign key (companyId) references company(companyId)
);


create table applications (
    applicationId int identity primary key,
    companyId int not null,
    applicationName varchar(100) not null,
    foreign key (companyId) references company(companyId)
);

insert into company (companyName)
values ('MyCompany');


insert into users (companyId, userName)
values
(1, 'Rahul'),
(1, 'Neha'),
(1, 'Amit');


insert into marketing (userId)
values (1), (2);

insert into personal (userId)
values (3);

insert into devices (companyId, deviceName)
values
(1, 'Laptop'),
(1, 'Mobile'),
(1, 'Tablet');

insert into applications (companyId, applicationName)
values
(1, 'CRM'),
(1, 'EmailSystem'),
(1, 'HRPortal');

select * from users

select * from company
select * from applications
select * from devices
select * from users
select * from marketing
select * from personal



