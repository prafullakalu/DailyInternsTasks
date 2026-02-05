create database collegeManagenament;
use companyManagement;

create table college (
collegeId int identity primary key,
collegeName varchar(100) not null unique
);

create table department (
    departmentId int identity primary key,
    departmentName varchar(100) not null,
    collegeId int not null,
    foreign key (collegeId) references college(collegeId)
);

create table student (
    studentId int identity primary key,
    studentName varchar(100) not null,
    age int check (age >= 16),
    departmentId int not null,
    foreign key (departmentId) references department(departmentId)
);

insert into college (collegeName)
values ('ABC College');

insert into department (departmentName, collegeId)
values
('Computer Science', 1),
('Mechanical', 1);

insert into student (studentName, age, departmentId)
values
('Rahul', 20, 1),
('Neha', 19, 1),
('Amit', 21, 2);


select * from student;

update student
set age = 22
where studentName = 'Rahul';


delete from student
where studentName = 'Amit';

drop database companyManagement

use collegeManagenament

SELECT * FROM college
select * from department
select * from student
