create database sqlExamDB
use sqlExamDB

create table customers (
    customerId int primary key,
    name varchar(100) not null,
    email varchar(100) unique not null,
    address varchar(200)
)

create table products (
    productId int primary key,
    productName varchar(100) not null,
    price decimal(10,2) not null,
    stockQuantity int not null
)

create table orders (
    orderId int primary key,
    customerId int not null,
    orderDate date not null,
    totalAmount decimal(10,2) not null,
    constraint fkOrdersCustomers
        foreign key (customerId) references customers(customerId)
)

create table cart (
    cartId int primary key,
    customerId int not null,
    productId int not null,
    quantity int not null,
    addedDate date not null,
    constraint fkCartCustomers
        foreign key (customerId) references customers(customerId),
    constraint fkCartProducts
        foreign key (productId) references products(productId)
)

insert into customers (customerId, name, email, address)
values
(1, 'John Doe', 'john@example.com', '123 Elm St'),
(2, 'Jane Smith', 'jane@example.com', '456 Oak St'),
(3, 'Alice Brown', 'alice@example.com', '789 Pine St')

insert into products (productId, productName, price, stockQuantity)
values
(101, 'Laptop', 800, 50),
(102, 'Smartphone', 500, 30),
(103, 'Headphones', 150, 100)

insert into orders (orderId, customerId, orderDate, totalAmount)
values
(201, 1, '2024-08-01', 1200),
(202, 2, '2024-08-03', 500),
(203, 1, '2024-08-05', 800)

insert into cart (cartId, customerId, productId, quantity, addedDate)
values
(301, 1, 101, 2, '2024-07-28'),
(302, 2, 102, 1, '2024-07-29'),
(303, 3, 103, 3, '2024-07-30')



exec spCustomersWithoutRecentOrders

select * from customers
select * from products
select * from orders
select * from cart


-- section - 2
--2

select 
c.customerId,
c.Name,
sum(o.totalAmount) as TotalAmountSpent
from customers c
join orders o on c.customerId = o.customerId
group by c.customerId ,c.name

--3

select top 5
p.productId,
p.productName,
 sum(cart.quantity)  orderCount
from products p 
join cart on p.productId=cart.productId
group by p.productId,p.productName
order by orderCount desc



--section 3
--4
create or alter procedure spUpsertProduct
@productId int,
@productName varchar(100),
@price decimal(10,2),
@stockQuantity int
as
begin
  set nocount on

  if exists (
  select 1
  from products
  where productId = @productId
  )
  begin
  update products
  set
  productName = @productName,
  price = @price,
  stockQuantity =@stockQuantity
  where productId = @productId

end
else
begin
insert into products (productId,productName,price,stockQuantity)
values (@productId,@productName,@price,@stockQuantity)
end
end


exec spUpsertProduct
    @productId = 104,
    @productName = 'Tablet',
    @price = 300,
    @stockQuantity = 40


    exec spUpsertProduct
    @productId = 101,
    @productName = 'Laptop Pro',
    @price = 900,
    @stockQuantity = 45

    select * from products

--5
create or alter procedure spInsertOrderAndUpdateStock
    @orderId int,
    @customerId int,
    @productId int,
    @quantity int,
    @orderDate date,
    @totalAmount decimal(10,2)
as
begin
    set nocount on

    -- insert order
    insert into orders (orderId, customerId, orderDate, totalAmount)
    values (@orderId, @customerId, @orderDate, @totalAmount)

    -- update product stock
    update products
    set stockQuantity = stockQuantity - @quantity
    where productId = @productId
end


exec spInsertOrderAndUpdateStock
    @orderId = 204,
    @customerId = 1,
    @productId = 101,
    @quantity = 2,
    @orderDate = '2024-08-15',
    @totalAmount = 1600


    select * from orders where orderId = 204

 select productId, productName, stockQuantity
from products
where productId = 101


-- section 4

--6

create or alter function fnCavulateDiscount
(
@totalAmount decimal(10,2)
)
returns decimal(10,2)
as
begin
declare @descount decimal(10,2)

if @totalAmount>=1000
set @descount = @totalAmount *0.20
else if @totalAmount >= 500
set @descount = @totalAmount *0.10
else 
set @descount = 0

return @descount
end

select dbo.fnCavulateDiscount(1600) as discount


--7

create or alter procedure spApplyDiscountForOrder
    @orderId int
as
begin
    set nocount on

    declare @originalAmount decimal(10,2)
    declare @discountApplied decimal(10,2)
    declare @finalAmount decimal(10,2)

    select
        @originalAmount = totalAmount
    from orders
    where orderId = @orderId
    set @discountApplied = dbo.fnCavulateDiscount(@originalAmount)
    set @finalAmount = @originalAmount - @discountApplied
    select
        @orderId as orderId,
        @originalAmount as originalAmount,
        @discountApplied as discountApplied,
        @finalAmount as finalAmount
end
exec spApplyDiscountForOrder @orderId = 204



-- section 5

--8 

create or alter procedure spGetProductsByProductIds
@productId varchar(200)
as 
begin 
set nocount on
select 
products.productId,
products.productName,
products.price,
products.stockQuantity
from products
join string_split(@productId,',') as splitValues
on products.productId = cast(splitValues.value as int)
end

exec spGetProductsByProductIds '101,103'


-- section 6

--9
create or alter procedure spGetProductSalesStatistics
as
begin
    set nocount on

    select
        products.productId,
        products.productName,
        sum(cart.quantity) as totalSold,
        sum(cart.quantity * products.price) as totalRevenue,
        avg(cast(cart.quantity as decimal(10,2))) as avgOrderQty,
        stdev(cast(cart.quantity as decimal(10,2))) as stdDevOrderQty
    from products
    join cart
        on products.productId = cart.productId
    group by
        products.productId,
        products.productName
end


exec spGetProductSalesStatistics

--10
create or alter procedure spCustomersWithoutRecentOrders
as
begin
    set nocount on

    select
        customers.customerId,
        customers.name as customerName,
        max(orders.orderDate) as lastOrderDate
    from customers
    left join orders
        on customers.customerId = orders.customerId
    group by
        customers.customerId,
        customers.name
    having
        max(orders.orderDate) < dateadd(month, -6,getdate())
        or max(orders.orderDate) is null
end

insert into orders (orderId, customerId, orderDate, totalAmount)
values (205, 3, '2023-12-10', 400)

exec spCustomersWithoutRecentOrders




--11

create or alter procedure spCategorizeCustomers
as
begin
    set nocount on

    select
        customers.customerId,
        customers.name as customerName,
        count(orders.orderId) as numberOfOrders,
        isnull(sum(orders.totalAmount), 0) as orderAmount,
        case
            when count(orders.orderId) >= 3 
                 and isnull(sum(orders.totalAmount), 0) > 1000
                then 'Gold'

            when count(orders.orderId) = 2 
                 and isnull(sum(orders.totalAmount), 0) > 500
                then 'Silver'

            else 'Bronze'
        end as category
    from customers
    left join orders
        on customers.customerId = orders.customerId
    group by
        customers.customerId,
        customers.name
end
exec spCategorizeCustomers



