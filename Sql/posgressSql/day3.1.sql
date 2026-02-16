create extension if not exists "pgcrypto";

create table company (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    createdAt timestamp default current_timestamp
);


create table department (
    id uuid primary key default gen_random_uuid(),
    companyId uuid not null references company(id) on delete cascade,
    name varchar(100) not null,
    budget numeric(12,2) not null
);

create table employee (
    id uuid primary key default gen_random_uuid(),
    companyId uuid not null references company(id) on delete cascade,
    departmentId uuid references department(id) on delete set null,
    firstName varchar(50),
    lastName varchar(50),
    salary numeric(10,2),
    joiningDate date,
    isActive boolean default true
);

insert into company (name)
values ('Tech Solutions Pvt Ltd')
returning id;

with newCompany as (
    insert into company (name)
    values ('Tech Solutions Pvt Ltd')
    returning id
)
insert into department (companyId, name, budget)
select id, 'Engineering', 500000 from newCompany
union all
select id, 'HR', 200000 from newCompany
returning id, name;



with companyData as (
    select id as companyId from company limit 1
),
engineeringDept as (
    select id as departmentId 
    from department 
    where name = 'Engineering'
),
hrDept as (
    select id as departmentId 
    from department 
    where name = 'HR'
)
insert into employee (
    companyId,
    departmentId,
    firstName,
    lastName,
    salary,
    joiningDate,
    isActive
)
select c.companyId, e.departmentId, 'Rahul', 'Sharma', 50000, date '2022-01-10', true
from companyData c, engineeringDept e
union all
select c.companyId, e.departmentId, 'Anita', 'Patel', 60000, date '2021-03-15', true
from companyData c, engineeringDept e
union all
select c.companyId, e.departmentId, 'Vikram', 'Singh', 70000, date '2020-05-20', false
from companyData c, engineeringDept e
union all
select c.companyId, h.departmentId, 'Meena', 'Joshi', 40000, date '2023-02-01', true
from companyData c, hrDept h
returning id;



select * from employee
select * from department
select * from company


create or replace function getDepartmentSalarySummary(
    pDepartmentId uuid
)
returns table (
    totalEmployees integer,
    totalSalary numeric,
    averageSalary numeric
)
language plpgsql
as
$$
    select
        coalesce(count(e.id), 0)::integer as totalEmployees,
        coalesce(sum(e.salary), 0) as totalSalary,
        coalesce(avg(e.salary), 0) as averageSalary,
    from employee e
    where e.departmentId = pDepartmentId
      and e.isActive = true;
$$;

-- calling function for the 

select * from getDepartmentSalarySummary('c31b39e4-2255-46a7-8c87-35f0500947e9');





-- to trancefer the employees
create or replace procedure transferEmployee(
    pEmployeeId uuid,
    pNewDepartmentId uuid
)
language plpgsql
as
$$
declare
    vEmployeeCompanyId uuid;
    vDepartmentCompanyId uuid;
begin
 
    select companyId
    into vEmployeeCompanyId
    from employee
    where id = pEmployeeId;

    if not found then
        raise exception 'Employee does not exist';
    end if;

 
    select companyId
    into vDepartmentCompanyId
    from department
    where id = pNewDepartmentId;

    if not found then
        raise exception 'Department do	es not exist';
    end if;

 
    if vEmployeeCompanyId <> vDepartmentCompanyId then
        raise exception 'Employee and Department belong to different companies';
    end if;

    update employee
    set departmentId = pNewDepartmentId
    where id = pEmployeeId;

end;
$$;


call transferEmployee(
    'f8ee2d27-1cc8-4077-b8ac-dfea17ba76a4',
    'c31b39e4-2255-46a7-8c87-35f0500947e9'
);

select * from employee
select * from department
select * from company


select e.firstName, d.id,e.lastName, d.name as department
from employee e
join department d on e.departmentId = d.id
where e.firstName = 'Rahul'
  and e.lastName  = 'Sharma';




-- 3 increse salary by percentage 
create or replace function increaseSalaryByEmployee(
    pEmployeeId uuid,
    pPercentage numeric
)
returns numeric
language plpgsql
as
$$
declare
    vCurrentSalary numeric;
    vIsActive boolean;
    vUpdatedSalary numeric;
begin
  
    if pPercentage <= 0 then
        raise exception 'Percentage must be greater than zero';
    end if;
    select salary, isActive
    into vCurrentSalary, vIsActive
    from employee
    where id = pEmployeeId;
    if not found then
        raise exception 'Employee does not exist';
    end if;
    if vIsActive is false then
        raise exception 'Cannot update salary for inactive employee';
    end if;
    vUpdatedSalary := vCurrentSalary + (vCurrentSalary * pPercentage / 100);
    update employee
    set salary = vUpdatedSalary
    where id = pEmployeeId;
    return vUpdatedSalary;

end;
$$;



select increaseSalaryByEmployee(
    '1774ab30-0184-4e53-a091-e113a07a97e9',
    15
);


select * from employee where id = '1774ab30-0184-4e53-a091-e113a07a97e9'



















