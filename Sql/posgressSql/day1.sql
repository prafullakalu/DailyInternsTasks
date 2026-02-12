create table students (
studentId serial primary key,
studentName varchar(100) not null,
marks int not null check(marks >=0 and marks <= 100 )

);

insert into students(studentName, marks)
values
('Rahul',75),
('Sneha',35),
('Amit',60);

update students 
set marks = 39
where studentname = 'Sneha'

select * from public.students


delete from students
where marks < 40;

select *
from students;

-- task2 
create table acounts (
accountId serial primary key,
accountHolder varchar(100) not null,
balance numeric(12,2) not null check (balance >= 0)
)

insert into acounts (accountHolder, balance)
values
('AccountA',5000.00),
('AccountB',3000.00)

do
$$
begin
    
    begin
    
        update acounts
        set balance = balance - 1000
        where accountHolder = 'AccountA'
        and balance >= 1000;

      
        if not found then
            raise exception 'Insufficient balance in AccountA';
        end if;

    
        update acounts
        set balance = balance + 1000
        where accountHolder = 'AccountB';

    exception
        when others then
            raise notice 'Transaction failed: %', sqlerrm;
            rollback;
            return;
    end;

    commit;
    raise notice 'Transaction successful';

end;
$$;



select * from acounts order by balance 



--task 3
create table employees(
employeeId serial primary key,
employeeName varchar(100) not null,
department varchar(100),
salary numeric(10,2) not null check (salary > 0)
);

insert into employees (employeeName, department, salary)
values
('Rahul', 'IT', 50000),
('Sneha', 'HR', 40000),
('Amit', 'IT', 60000),
('Priya', 'Finance', 45000),
('Karan', 'HR', 70000);

select * from employees where salary > (
select avg(salary)
from employees
)

select avg(salary) from employees;


-- task 4
select e.department ,
count(e.employeeId) as employee_count
from employees as e
group by e.department
order by count(e.employeeId) desc


-- task 5
select 
  employeeId,
    employeeName,
    department,
    salary,
	rank() over(order by salary desc) as salaryRank
	from employees


