create database selesManagementDB
use selesManagementDB

create table customers (
    customerId int identity primary key,
    customerName varchar(50),
    email varchar(100),
    city varchar(50)
)
select * from  customers

insert into customers (customerName)
values('arma')

select * from customers c
where c.customerName like 'a%a'

create table products (
    productId int identity primary key,
    productName varchar(50),
    price decimal(10,2)
)

create table orders (
    orderId int identity primary key,
    customerId int,
    orderDate date,
    totalAmount decimal(10,2),
    constraint fk_orders_customers
        foreign key (customerId) references customers(customerId)
)

create table payments (
    paymentId int identity primary key,
    orderId int,
    paidAmount decimal(10,2),
    paymentDate date,
    constraint fk_payments_orders
        foreign key (orderId) references orders(orderId)
)

insert into customers (customerName, email, city)
values
('Jeshal', 'jeshal@gmail.com', 'Amreli'),
('Jigna', 'jigna@gmail.com', 'Ahmedabad'),
('Rajesh', 'rajesh@gmail.com', 'Baroda')


insert into products (productName, price)
values
('Nokia', 12000),
('iPhone', 70000),
('Samsung', 30000)

insert into orders (customerId, orderDate, totalAmount)
values
(1, '2025-01-10', 12000),
(2, '2025-01-15', 70000),
(3, '2025-02-01', 30000)


insert into payments (orderId, paidAmount, paymentDate)
values
(1, 6000, '2025-01-11'),
(1, 6000, '2025-01-12'),
(2, 70000, '2025-01-16')


create type customerType as table (
customerName varchar(50),
email varchar(100),
city varchar(50)
)

---1
create type customerBulkType as table (
    customerName varchar(50),
    email varchar(100),
    city varchar(50)
)

create type productBulkType as table (
    productName varchar(50),
    price decimal(10,2)
)

create procedure bulkInsertCustomers
  @customers customerBulkType readonly
as 
begin
insert into customers (customerName,email,city)
select customerName,email,city
from @customers
end

create procedure bulkInsertProducts
@products productBulkType readonly
as
begin
insert into products(productName,price)
select productName,price
from @products
end

declare @productData productBulkType
insert into @productData values
('Laptop', 55000),
('Mouse', 500),
('Keyboard', 1200)
exec bulkInsertProducts  @productData
select * from products


 select name 
from sys.types 
where is_table_type = 1
declare @customerData customerBulkType
insert into @customerData values
('Amit', 'amit@gmail.com', 'Surat'),
('Neha', 'neha@gmail.com', 'Pune'),
('Rahul', 'rahul@gmail.com', 'Mumbai')
exec bulkInsertCustomers @customerData
select * from customers


--2
select top 10
    customerId,
    customerName,
    email,
    city
from customers
order by city


--3 
select
customerId,
customerName,
email,
city
from customers
where customerName like 'J%'

--4
select 
customerId,
customerName,
email,
city
from customers
where city in ('surat','pune')


select * from products;


merge products as target
using(
select 'Nokia' as productName, 15000 as price
union all
select 'Samsung', 28000
union all
select 'OnePluse',40000
)as source
on target.productName = source.productName

when matched then
    update set
        target.price=source.price
when not matched then
 insert (productName, price)
 values (source.productName, source.price);

 select * from products;

 --6

select * from customers;

merge customers as target
using (
    select 'Jeshal' as customerName, 'jeshal@gmail.com' as email, 'Surat' as city
    union all
    select 'Rajesh', 'rajesh_new@gmail.com', 'Baroda'
    union all
    select 'Amit', 'amit@gmail.com', 'Pune'
) as source
on target.email = source.email

when matched then
    update set
        target.customerName = source.customerName,
        target.city = source.city

when not matched then
    insert (customerName, email, city)
    values (source.customerName, source.email, source.city);

  --7
  create procedure creteOrderWithPayment
  (
  @custemerId int,
  @orderAmount decimal(10,2),
  @paidAmount decimal(10,2),
  @newOrderId int output
  )
  as
  begin

  set nocount on;

  begin transaction;
  begin try
  insert into orders (customerId,orderDate,totalAmount)
  values(@custemerId,getdate(),@orderAmount);
  set @newOrderId = SCOPE_IDENTITY();
  insert into payments (orderId,paidAmount,paymentDate)
  values (@newOrderId,@paidAmount,getdate());

  commit transaction;
  end try
  begin catch
  rollback transaction;
  throw
  end catch
  end

  declare @orderId int;

  exec creteOrderWithPayment
    @custemerId = 1,
    @orderAmount = 20000,
    @paidAmount = 5000,
    @newOrderId = @orderId output;

    select @orderId as newOrderId;
    select * from orders 
select *
from orders o
join payments p on o.orderId = p.orderId
where o.orderId = (select max(orderId) from orders);



go
create procedure deleteCustomerWithOrders
(
    @customerId int
)
as
begin
    set nocount on;

    begin transaction;

    begin try
    
        delete p
        from payments p
        join orders o on p.orderId = o.orderId
        where o.customerId = @customerId;
        delete from orders
        where customerId = @customerId;

        delete from customers
        where customerId = @customerId;

        commit transaction;
    end try
    begin catch
        rollback transaction;
        throw;
    end catch
end;
go
    

select * from customers;
select * from orders;
select * from payments;
exec deleteCustomerWithOrders @customerId = 2              
select * from customers where customerId = 2


-- Advance 
-- t1

select
    p.productName,
    sum(pay.paidAmount) as totalRevenue
from products p
join orders o
    on o.orderId = p.productId
join payments pay
    on pay.orderId = o.orderId
group by p.productName;


select * from customers;
select * from orders;
select * from payments;
select * from products

--2
with customerOrderFrequency as (
    select
        o.customerId,
        count(o.orderId) as orderCount
    from orders o
    where o.orderDate >= dateadd(month, -6, getdate())
    group by o.customerId
    having count(o.orderId) > 5
)
select
    c.customerName,
    c.email,
    cof.orderCount as orderFrequency
from customerOrderFrequency cof
join customers c
    on c.customerId = cof.customerId;

    
    insert into orders (customerId, orderDate, totalAmount)
values
(3, getdate(), 1000),
(3, getdate(), 2000),
(3, getdate(), 1500),
(3, getdate(), 3000),
(3, getdate(), 2500),
(3, getdate(), 1800);




---3

with customerOrderStats as (
    select
        o.customerId,
        sum(o.totalAmount) as totalSpent,
        count(o.orderId) as orderCount
    from orders o
    group by o.customerId
)
select
    c.customerName,
    c.email,
    cos.totalSpent,
    cos.orderCount,
    cast(cos.totalSpent * 1.0 / cos.orderCount as decimal(10,2)) as averageOrderValue
from customerOrderStats cos
join customers c
    on c.customerId = cos.customerId;



    ---4 

    with productSales as (
    select
        p.productId,
        p.productName,
        count(o.orderId) as totalQuantitySold
    from products p
    join orders o
        on o.totalAmount = p.price
    group by p.productId, p.productName
)
select 
    productName,
    totalQuantitySold
from productSales
order by totalQuantitySold desc;


--5  new tabls in this and its its names 

create table customerTask5 (
    customerId int,
    customerName varchar(50),
    address varchar(50)
);

create table customerProductsTask5 (
    productId int,
    productName varchar(50),
    customerIds varchar(50)   -- comma separated
);

insert into customerTask5 values
(1, 'Jeshal', 'Amreli'),
(2, 'Jigna', 'Ahmedabad'),
(3, 'Rajesh', 'Baroda');

insert into customerProductsTask5 values
(1, 'Nokia', '1,2,3'),
(2, 'Iphone', '2,3'),
(3, 'Samsung', '1');


select
    c.customerId,
    c.customerName,
    c.address,
    string_agg(cp.productName, ',') as products
from customerTask5 c
join customerProductsTask5 cp
    on c.customerId in (
        select cast(value as int)
        from string_split(cp.customerIds, ',')
    )
group by
    c.customerId,
    c.customerName,
    c.address
order by c.customerId;


