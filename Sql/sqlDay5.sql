/* =========================
   DATABASE
========================= */
create database salesManagementSystem
go
use salesManagementSystem
go

/* =========================
   TABLES
========================= */
create table departments (
    departmentId int identity primary key,
    departmentName varchar(100) not null
)

create table employees (
    employeeId int identity primary key,
    firstName varchar(50),
    lastName varchar(50),
    departmentId int,
    salary decimal(12,2),
    foreign key (departmentId) references departments(departmentId)
)

create table salaryHistory (
    syncHistoryId int identity primary key,
    employeeId int,
    salary decimal(12,2),
    effectiveDate date,
    foreign key (employeeId) references employees(employeeId)
)

create table customers (
    customerId int identity primary key,
    firstName varchar(50),
    lastName varchar(50),
    email varchar(100),
    phone varchar(20),
    address varchar(200),
    city varchar(50),
    stateProvince varchar(50),
    country varchar(50),
    postalCode varchar(20),
    dateOfBirth date,
    gender varchar(10)
)

create table products (
    productId int identity primary key,
    productName varchar(100),
    categoryName varchar(50),
    unitPrice decimal(10,2),
    isFeatured bit default 0
)

create table promotions (
    promotionId int identity primary key,
    productId int,
    promotionName varchar(100),
    startDate date,
    endDate date,
    discountAmount decimal(10,2),
    foreign key (productId) references products(productId)
)

create table orders (
    orderId int identity primary key,
    promotionId int null,
    productId int,
    quantity int,
    customerId int,
    orderDate date,
    price decimal(10,2),
    foreign key (promotionId) references promotions(promotionId),
    foreign key (productId) references products(productId),
    foreign key (customerId) references customers(customerId)
)

create table categorySummary (
    categorySummaryId int identity primary key,
    categoryName varchar(50),
    revenue decimal(14,2)
)

/* =========================
   SAMPLE DATA
========================= */
insert into departments values ('IT'),('HR'),('Sales')

insert into employees values
('Amit','Sharma',1,60000),
('Neha','Verma',1,75000),
('Rohit','Mehta',2,45000),
('Priya','Singh',3,80000)

insert into customers values
('Rahul','Patel','r@gmail.com','9999','Addr1','Pune','MH','India','411001','1995-02-10','M'),
('Anita','Desai','a@gmail.com','8888','Addr2','Mumbai','MH','India','400001','1992-05-12','F'),
('Karan','Joshi','k@gmail.com','7777','Addr3','Delhi','DL','India','110001','1990-08-20','M')

insert into products values
('Laptop','Electronics',70000,0),
('Mouse','Electronics',500,0),
('Keyboard','Electronics',1200,0),
('Chair','Furniture',4500,0),
('Table','Furniture',8500,0)

insert into promotions
select top 5 productId,'Festival Offer',getdate(),dateadd(day,10,getdate()),500
from products

insert into orders values
(1,1,2,1,getdate(),70000),
(1,1,1,1,getdate(),70000),
(null,2,5,2,getdate(),500),
(null,3,3,2,getdate(),1200),
(null,4,4,3,getdate(),4500),
(null,5,1,3,getdate(),8500),
(null,1,1,1,getdate(),70000),
(null,1,1,1,getdate(),70000)

/* =========================
   WINDOW FUNCTIONS
========================= */
-- RANK employees by salary per department
select *,
rank() over (partition by departmentId order by salary desc) as salaryRank
from employees

-- DENSE RANK top customers current month
select customerId,
dense_rank() over (order by count(orderId) desc) as customerRank
from orders
where month(orderDate)=month(getdate())
group by customerId

-- ROW NUMBER orders per customer
select *,
row_number() over (partition by customerId order by orderDate) as rowNum
from orders

/* =========================
   SUBQUERY INSERT / UPDATE / DELETE
========================= */
-- insert promotions for products not promoted
insert into promotions
select productId,'Special Deal',getdate(),dateadd(day,5,getdate()),300
from products
where productId not in (select productId from promotions)

-- update product as featured if ordered >3 times this month
update products
set isFeatured=1
where productId in (
    select productId
    from orders
    where month(orderDate)=month(getdate())
    group by productId
    having count(*)>3
)

-- delete old promotions
delete from promotions
where startDate < dateadd(month,-6,getdate())

/* =========================
   TRIGGER
========================= */
create trigger trgMarkFeatured
on orders
after insert
as
begin
    update products
    set isFeatured=1
    where productId in (
        select productId
        from orders
        where month(orderDate)=month(getdate())
        group by productId
        having count(*)>3
    )
end

/* =========================
   VIEWS
========================= */
create view vwOrderCustomer
as
select o.orderId,o.orderDate,o.quantity,o.price,
c.firstName,c.lastName,c.city
from orders o
join customers c on o.customerId=c.customerId

create view vwOrderProductLast3Months
as
select o.orderId,o.orderDate,o.quantity,
p.productName,p.categoryName,p.unitPrice
from orders o
join products p on o.productId=p.productId
where o.orderDate >= dateadd(month,-3,getdate())

-- WITH CHECK OPTION
create view vwEmployeeSalary
as
select employeeId,firstName,lastName,salary
from employees
where salary>10000
with check option

/* =========================
   USER DEFINED FUNCTION
========================= */
create function fnTotalOrderCost (
    @quantity int,
    @unitPrice decimal(10,2)
)
returns decimal(12,2)
as
begin
    return @quantity * @unitPrice
end

/* =========================
   WHILE LOOP
========================= */
create table #numbers (value int)
insert into #numbers values (1),(2),(3),(4),(5),(6),(7),(8),(9),(10)

declare @i int=1
while @i<=10
begin
    if @i=5 break
    if @i%2=0
    begin
        set @i=@i+1
        continue
    end
    print @i
    set @i=@i+1
end

/* =========================
   CURSOR + SUMMARY
========================= */
declare categoryCursor cursor for
select distinct categoryName from products

declare @category varchar(50)
declare @revenue decimal(14,2)

open categoryCursor
fetch next from categoryCursor into @category

while @@fetch_status=0
begin
    select @revenue=sum(o.quantity*o.price)
    from orders o
    join products p on o.productId=p.productId
    where p.categoryName=@category

    insert into categorySummary(categoryName,revenue)
    values(@category,isnull(@revenue,0))

    fetch next from categoryCursor into @category
end

close categoryCursor
deallocate categoryCursor

/* =========================
   FINAL OUTPUT
========================= */
select * from categorySummary


create table students (
    studentId int primary key,
    studentName varchar(100) not null,
    age int,
    gender varchar(10),
    address varchar(200),
    email varchar(100) unique,
    phoneNumber varchar(20)
)

create table instructors (
    instructorId int identity primary key,
    instructorName varchar(100) not null
)

create table courses (
    courseId int primary key,
    courseName varchar(100) not null,
    creditHours int not null,
    instructorId int,
    foreign key (instructorId) references instructors(instructorId)
)

create table enrollments (
    enrollmentId int identity primary key,
    studentId int,
    courseId int,
    grade varchar(5),
    foreign key (studentId) references students(studentId),
    foreign key (courseId) references courses(courseId),
    constraint uqStudentCourse unique (studentId, courseId)
)

