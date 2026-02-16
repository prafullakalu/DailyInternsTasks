create type employeeRoleEnum as enum (
    'hr',
    'aiMlDeveloper',
    'mernStackDeveloper',
    'qaEngineer',
    'projectManager'
);


create type projectStatusEnum as enum (
    'planning',
    'inProgress',
    'completed',
    'onHold'
);

create type paymentStatusEnum as enum (
    'pending',
    'paid',
    'partial'
);

create table departments (
    departmentId serial primary key,
    departmentName varchar(100) unique not null,
    createdAt timestamp default current_timestamp
);


create table employees (
    employeeId serial primary key,
    firstName varchar(100) not null,
    lastName varchar(100) not null,
    email varchar(150) unique not null,
    role employeeRoleEnum not null,
    salary numeric(10,2) check (salary > 20000),
    departmentId int not null,
    joiningDate date not null,
    isActive boolean default true,

    constraint fkEmployeesDepartment
        foreign key (departmentId)
        references departments(departmentId)
);

create table employeeDocuments (
    documentId serial primary key,
    employeeId int not null,
    documentName varchar(200),
    filePath varchar(300),
    uploadedAt timestamp default current_timestamp,

    constraint fkEmployeeDocumentsEmployee
        foreign key (employeeId)
        references employees(employeeId)
        on delete cascade
);

create table clients (
    clientId serial primary key,
    clientName varchar(150) not null,
    country varchar(100),
    contactEmail varchar(150) unique,
    createdAt timestamp default current_timestamp
);

create table projects (
    projectId serial primary key,
    projectName varchar(150) not null,
    clientId int not null,
    budget numeric(12,2) check (budget > 0),
    startDate date not null,
    endDate date,
    status projectStatusEnum default 'planning',

    constraint fkProjectsClient
        foreign key (clientId)
        references clients(clientId)
);

create table projectDocuments (
    projectDocumentId serial primary key,
    projectId int not null,
    documentName varchar(200),
    filePath varchar(300),
    uploadedAt timestamp default current_timestamp,

    constraint fkProjectDocumentsProject
        foreign key (projectId)
        references projects(projectId)
        on delete cascade
);


create table employeeProjects (
    employeeProjectId serial primary key,
    employeeId int not null,
    projectId int not null,
    allocationPercentage int check (allocationPercentage between 1 and 100),
    assignedDate timestamp default current_timestamp,

    constraint fkEmployeeProjectsEmployee
        foreign key (employeeId)
        references employees(employeeId)
        on delete cascade,

    constraint fkEmployeeProjectsProject
        foreign key (projectId)
        references projects(projectId)
        on delete cascade
);

create table projectPayments (
    paymentId serial primary key,
    projectId int not null,
    clientId int not null,
    amount numeric(12,2) not null check (amount > 0),
    paymentDate date default current_date,
    paymentStatus paymentStatusEnum default 'pending',

    constraint fkProjectPaymentsProject
        foreign key (projectId)
        references projects(projectId)
        on delete cascade,

    constraint fkProjectPaymentsClient
        foreign key (clientId)
        references clients(clientId)
        on delete cascade
);

insert into departments (departmentName) values
('Human Resources'),
('Engineering'),
('Quality Assurance'),
('Project Management');

insert into employees 
(firstName, lastName, email, role, salary, departmentId, joiningDate)
values
('Jesal', 'Patel', 'jesal@satva.com', 'aiMlDeveloper', 180000, 2, '2022-01-15'),
('Praful', 'Purohit', 'praful@satva.com', 'mernStackDeveloper', 95000, 2, '2023-03-20'),
('Hash', 'Shah', 'hash@satva.com', 'qaEngineer', 60000, 3, '2023-06-01'),
('Hansa', 'Mehta', 'hansa@satva.com', 'hr', 70000, 1, '2021-09-10'),
('Shailesh', 'Rao', 'shailesh@satva.com', 'projectManager', 150000, 4, '2020-02-05'),
('Sneha', 'Desai', 'sneha@satva.com', 'mernStackDeveloper', 105000, 2, '2022-11-11');

insert into employeeDocuments (employeeId, documentName, filePath) values
(1, 'Resume', '/docs/jesal_resume.pdf'),
(1, 'ID Proof', '/docs/jesal_id.pdf'),
(2, 'Resume', '/docs/praful_resume.pdf'),
(3, 'Offer Letter', '/docs/hash_offer.pdf'),
(4, 'HR Certification', '/docs/hansa_cert.pdf'),
(5, 'PMP Certificate', '/docs/shailesh_pmp.pdf'),
(6, 'Resume', '/docs/sneha_resume.pdf');

insert into clients (clientName, country, contactEmail) values
('FinTech Global', 'USA', 'contact@fintechglobal.com'),
('RetailMart Ltd', 'UK', 'info@retailmart.co.uk'),
('HealthCarePro', 'Canada', 'support@healthcarepro.ca');


insert into projects 
(projectName, clientId, budget, startDate, endDate, status)
values
('AI Fraud Detection System', 1, 8000000, '2024-01-01', null, 'inProgress'),
('Ecommerce Web Platform', 2, 5000000, '2024-02-15', null, 'planning'),
('Hospital Management App', 3, 3000000, '2023-08-01', '2024-03-01', 'completed'),
('Retail Analytics Dashboard', 2, 4500000, '2024-04-01', null, 'inProgress');



insert into projectDocuments (projectId, documentName, filePath) values
(1, 'SRS Document', '/projects/ai_srs.pdf'),
(1, 'Architecture Design', '/projects/ai_architecture.pdf'),
(2, 'Requirement Doc', '/projects/ecommerce_req.pdf'),
(3, 'Final Report', '/projects/hospital_final.pdf'),
(4, 'Analytics Plan', '/projects/retail_plan.pdf');


insert into employeeProjects (employeeId, projectId, allocationPercentage) values
(1, 1, 80),
(2, 2, 100),
(3, 2, 60),
(5, 1, 50),
(6, 4, 70),
(1, 4, 40);

insert into projectPayments 
(projectId, clientId, amount, paymentStatus)
values
(1, 1, 4000000, 'partial'),
(1, 1, 4000000, 'paid'),
(2, 2, 2000000, 'partial'),
(3, 3, 3000000, 'paid'),
(4, 2, 1000000, 'pending');

select * from departments;
select * from employees;
select * from employeeDocuments;
select * from clients;
select * from projects;
select * from projectDocuments;
select * from employeeProjects;
select * from projectPayments;


--1 Show employee name, role and department name

select e.firstName,e.role,d.departmentName
from employees e
join departments d
on e.departmentId = d.departmentId;

--2 Show all employees even if not assigned to project
select e.firstName,p.ProjectName
from employees e
left join employeeProjects ep
on e.employeeId = ep.employeeId
left join projects p
on ep.projectId = p.projectId;

-- 3   
-- Show all employees and projects including unmatched rows
select e.firstName, p.projectName
from employees e
full  join employeeProjects ep 
on e.employeeId = ep.employeeId
full  join projects p 
on ep.projectId = p.projectId;


--4 Employees earning more than 100000 sorted descending
select firstName,Salary
from employees
where salary >100000
order by salary desc

--5 Count employees in each department
select d.departmentName ,
count(e.employeeId) as TotalEmployees
from departments d
left join employees e
on d.departmentId = e.departmentId
group by d.departmentName

-- 6 Show departments having more than 1 employee
select d.departmentName ,
count(e.employeeId) as NoOfemp
from departments d
left join employees e on d.departmentId = e.departmentId 
group by d.departmentName
having (count(e.employeeId)) > 1 

-- Retrieve employees earning above company average
select firstName, salary
from employees
where salary > (select avg(salary) from employees);


-- 7 Project with highest total payment received
select p.projectName, sum(pp.amount) as totalRevenue
from projects p
join projectPayments pp
on p.projectId = pp.projectId
group by p.projectName
order by totalRevenue desc
limit 1;


-- 8 Create view for in-progress projects
create view activeProjectsView as
select projectName, budget
from projects
where status = 'inProgress';

select * from activeProjectsView;


-- 9 Create index on employee email
create index idxEmployeesEmail on employees(email);

-- Test index usage
explain analyze
select * from employees
where email = 'jesal@satva.com';



-- 10 Function to calculate total salary of department
create or replace function getDepartmentSalaryTotal(pDepartmentId int)
returns numeric as
$$
declare totalSalary numeric;
begin
    select sum(salary)
    into totalSalary
    from employees
    where departmentId = pDepartmentId;

    return coalesce(totalSalary,0);
end;
$$ language plpgsql;


select getDepartmentSalaryTotal(2);

-- get revenue from project id 
create or replace function getProjectRevenue(pProjectId int)
returns numeric as
$$
declare totalRevenue numeric;
begin
    select sum(amount)
    into totalRevenue
    from projectPayments
    where projectId = pProjectId;

    return coalesce(totalRevenue,0);
end;
$$ language plpgsql;

select getProjectRevenue(1)


-- 12 Rank Employees By Salary Within Department

select 
e.firstName,
d.departmentName,
e.salary,
rank() over(partition by d.departmentName order by e.salary desc) as salaryRank
from employees e
join departments d
on e.departmentId = d.departmentId;


-- 13 View: Employee Utilization Dashboard

create or replace view employeeUtilizationView as
select 
    e.employeeId,
    e.firstName || ' ' || e.lastName as employeeName,
    d.departmentName,
    coalesce(sum(ep.allocationPercentage),0) as totalAllocation,
    count(distinct ep.projectId) as projectCount,
    case 
        when coalesce(sum(ep.allocationPercentage),0) > 100 then 'Overloaded'
        when coalesce(sum(ep.allocationPercentage),0) between 80 and 100 then 'Optimal'
        when coalesce(sum(ep.allocationPercentage),0) = 0 then 'Unassigned'
        else 'Underutilized'
    end as utilizationStatus
from employees e
join departments d on e.departmentId = d.departmentId
left join employeeProjects ep on e.employeeId = ep.employeeId
group by e.employeeId, e.firstName, e.lastName, d.departmentName;


select * from employeeUtilizationView





