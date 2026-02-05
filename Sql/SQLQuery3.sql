create database companyDB
use companyDB

create table company(
companyId int identity primary key,
companyName varchar(100) not null unique,
createdAt datetime2 default getdate()
);

create table department(
departmentId int identity primary key,
companyId int not null,
departmantName varchar(50) not null,
foreign key (companyId) references company(companyId)
);

create table employee(
employeeId int identity primary key,
departmantId int not null ,
employeeName varchar(100) not null,
salary decimal(10,2),
isActive bit default 1,
foreign key (departmantId) references department(departmentId)
);

create table devices(
deviceName varchar(50),
companyId int not null,
assigned bit default 0,
foreign key (companyId) references company(companyId)
);

create table applications(
aplicationId int identity primary key,
companyId int not null,
applicationName varchar(50),
foreign key (companyId) references company(companyId)
);


insert into company (companyName)
values ('techno');

insert into department(companyId, departmantName)
values 
(1,'IT'),
(1,'HR');

insert into employee (departmantId, employeeName, salary)
values
(1, 'Rahul', 50000),
(1, 'Neha', 60000),
(2, 'Amit', 45000);

insert into devices (companyId, deviceName)
values
(1, 'Laptop'),
(1, 'Mobile');

insert into applications (companyId, applicationName)
values
(1, 'CRM'),
(1, 'Email');

select * from company
select * from department
select * from employee
select * from  devices
select * from applications

select departmantId, count(*) as totalEmployees
from employee
group by departmantId
having count(*) > 1;
