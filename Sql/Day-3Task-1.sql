create database copanyManagementDB

use copanyManagementDB

create table dbo.Customer (
    CustomerID int identity(1,1) primary key,
    FirstName varchar(50),
    LastName varchar(50),
    Email varchar(100),
    Phone varchar(20)
);



create table dbo.Product (
    ProductID int identity(1,1) primary key,
    Name varchar(100),
    Price decimal(10,2),
    Description text
);
go



create table dbo.[Order] (
    OrderID int identity(1,1) primary key,
    CustomerID int,
    OrderDate datetime,
    Qty int,
    Rate decimal(10,2),
    TotalAmount decimal(10,2),
    ProductID int,
    constraint fkOrderCustomer
        foreign key (CustomerID) references dbo.Customer(CustomerID),
    constraint fkOrderProduct
        foreign key (ProductID) references dbo.Product(ProductID)
);

create table dbo.Payment (
    PaymentID int identity(1,1) primary key,
    OrderID int,
    Amount decimal(10,2),
    PaymentDate datetime,
    constraint fkPaymentOrder
        foreign key (OrderID) references dbo.[Order](OrderID)
);
go




--1 insert procedure 
create or alter procedure spInsertCustomer
    @FirstName varchar(50),
    @LastName varchar(50),
    @Email varchar(100),
    @Phone varchar(20)
as
begin
    insert into dbo.Customer (FirstName, LastName, Email, Phone)
    values (@FirstName, @LastName, @Email, @Phone);
end

exec spInsertCustomer
    @firstName = 'Rahul',
    @lastName = 'Sharma',
    @email = 'rahul@gmail.com',
    @phone = '9876543210';

    select * from Customer


create or alter procedure spInsertProduct
    @Name varchar(100),
    @Price decimal(10,2),
    @Description text
as
begin
    insert into dbo.Product (Name, Price, Description)
    values (@Name, @Price, @Description);
end
go

exec spInsertProduct
    @name = 'Laptop',
    @price = 55000,
    @description = 'Gaming laptop';


create or alter procedure spInsertOrder
    @CustomerID int,
    @OrderDate datetime,
    @ProductID int,
    @Qty int,
    @Rate decimal(10,2)
as
begin
    insert into dbo.[Order]
    (CustomerID, OrderDate, ProductID, Qty, Rate, TotalAmount)
    values
    (@CustomerID, @OrderDate, @ProductID, @Qty, @Rate, @Qty * @Rate);
end
go

exec spInsertOrder
    1,
    '2026-02-05 14:55:00',
    1,
    2,
    55000;

 

create or alter procedure spInsertPayment
    @OrderID int,
    @Amount decimal(10,2)
as
begin
    insert into dbo.Payment (OrderID, Amount, PaymentDate)
    values (@OrderID, @Amount, getdate());
end

exec spInsertPayment
    @orderId = 1,
    @amount = 110000;


select * from dbo.Customer;
select * from dbo.Product;
select * from dbo.[Order];
select * from dbo.Payment;



-- 2 
--custemer 
create or alter procedure spUpdateCustomer
    @customerId int,
    @firstName varchar(50),
    @lastName varchar(50),
    @email varchar(100),
    @phone varchar(20)
as
begin
    update dbo.Customer
    set
        FirstName = @firstName,
        LastName  = @lastName,
        Email     = @email,
        Phone     = @phone
    where CustomerID = @customerId;
end
go

exec spUpdateCustomer
    1,
    'Rahul',
    'Verma',
    'rahul.verma@gmail.com',
    '9998887776';


--product update

create or alter procedure spUpdateProduct
    @productId int,
    @name varchar(100),
    @price decimal(10,2),
    @description text
as
begin
    update dbo.Product
    set
        Name = @name,
        Price = @price,
        Description = @description
    where ProductID = @productId;
end
go

exec spUpdateProduct
    1,
    'Laptop Pro',
    60000,
    'Upgraded gaming laptop';

    --order update 

create or alter procedure spUpdateOrder
    @orderId int,
    @customerId int,
    @orderDate datetime,
    @productId int,
    @qty int,
    @rate decimal(10,2)
as
begin
    update dbo.[Order]
    set
        CustomerID = @customerId,
        OrderDate = @orderDate,
        ProductID = @productId,
        Qty = @qty,
        Rate = @rate,
        TotalAmount = @qty * @rate
    where OrderID = @orderId;
end
go
exec spUpdateOrder
    1,
    1,
    '2026-02-05 15:10:00',
    1,
    3,
    55000;

    --update payment 
    create or alter procedure spUpdatePayment
    @paymentId int,
    @orderId int,
    @amount decimal(10,2)
as
begin
    update dbo.Payment
    set
        OrderID = @orderId,
        Amount = @amount,
        PaymentDate = getdate()
    where PaymentID = @paymentId;
end
go

exec spUpdatePayment
    1,
    1,
    165000;



--q3 
--Get All Customers

create or alter procedure spGetCustomers
as
begin
    select * from dbo.Customer;
end
go

exec spGetCustomers;


--produscts 
create or alter procedure spGetProducts
as
begin
    select * from dbo.Product;
end
go
create or alter procedure spGetProducts
as
begin
    select * from dbo.Product;
end
go

exec spGetProducts;

-- Get All Orders
create or alter procedure spGetOrders
as
begin
    select * from dbo.[Order];
end
go

exec spGetOrders;

--Get All Payments
create or alter procedure spGetPayments
as
begin
    select * from dbo.Payment;
end
go
exec spGetPayments;



--q4

/* =====================================================
   DELETE PAYMENT
   Child table – must be deleted first
   ===================================================== */
create or alter procedure spDeletePayment
    @paymentId int
as
begin
    -- Deletes a single payment using PaymentID
    delete from dbo.Payment
    where PaymentID = @paymentId;
end
go

-- Execute: delete payment with ID = 1
exec spDeletePayment 2;
exec spGetPayments;
exec spInsertPayment
    @orderId = 1,
    @amount = 110000;
exec spUpdatePayment
    3,
    1,
    165000;


create or alter procedure spDeleteOrder
    @orderId int
as
begin
  
    delete from dbo.[Order]
    where OrderID = @orderId;
end
go

-- Execute: delete order with ID = 1
exec spDeleteOrder 1;
go


/* =====================================================
   DELETE PRODUCT
   Parent table – referenced by Order
   ===================================================== */
create or alter procedure spDeleteProduct
    @productId int
as
begin
    -- Deletes a product using ProductID
    delete from dbo.Product
    where ProductID = @productId;
end
go

-- Execute: delete product with ID = 1
exec spDeleteProduct 1;
go


/* =====================================================
   DELETE CUSTOMER
   Parent table – referenced by Order
   ===================================================== */
create or alter procedure spDeleteCustomer
    @customerId int
as
begin
    delete from dbo.Customer
    where CustomerID = @customerId;
end
go

exec spDeleteCustomer 1;
go



--q5
create or alter procedure spUpdateProductPrice
    @productId int,
    @newPrice decimal(10,2)
as
begin
    update dbo.Product
    set Price = @newPrice
    where ProductID = @productId;
end
go

exec spUpdateProductPrice
    1,
    65000;
 exec spGetProducts;


 --q6
 create or alter procedure spInsertOrderWithTotal
    @customerId int,
    @orderDate datetime,
    @productId int,
    @qty int,
    @rate decimal(10,2)
as
begin
    insert into dbo.[Order]
        (CustomerID, OrderDate, ProductID, Qty, Rate, TotalAmount)
    values
        (@customerId, @orderDate, @productId, @qty, @rate, @qty * @rate);
end
go
exec spInsertOrderWithTotal
    1,
    '2026-02-06 10:30:00',
    1,
    3,
    5000;

select *
from dbo.[Order]
where CustomerID = 1;


-- 7
create or alter procedure spInsertPaymentForOrder
    @orderId int,
    @amount decimal(10,2)
as
begin
    insert into dbo.Payment
        (OrderID, Amount, PaymentDate)
    values
        (@orderId, @amount, getdate());
end
go

exec spInsertPaymentForOrder
    1,
    165000;

    select *
from dbo.Payment
where OrderID = 1;


--8

/* =========================================
   TASK 8
   Total payments made by each customer
   ========================================= */
create or alter procedure spTotalPaymentsByCustomer
as
begin
    select
        c.CustomerID,
        c.FirstName,
        c.LastName,
        sum(p.Amount) as TotalPayment
    from dbo.Customer c
    join dbo.[Order] o
        on c.CustomerID = o.CustomerID
    join dbo.Payment p
        on o.OrderID = p.OrderID
    group by
        c.CustomerID,
        c.FirstName,
        c.LastName;
end
go

exec spTotalPaymentsByCustomer;



/* =====================================================
   TASK 9
   Customers who have NOT made any payments
   ===================================================== */
create or alter procedure spCustomersWithNoPayments
as
begin
    select c.*
    from dbo.Customer c
    where not exists (
        select 1
        from dbo.[Order] o
        join dbo.Payment p on o.OrderID = p.OrderID
        where o.CustomerID = c.CustomerID
    );
end
go

-- Execute
exec spCustomersWithNoPayments;
go


/* =====================================================
   TASK 10
   Total revenue for a given period
   ===================================================== */
create or alter procedure spTotalRevenueForPeriod
    @fromDate datetime,
    @toDate datetime
as
begin
    select sum(TotalAmount) as TotalRevenue
    from dbo.[Order]
    where OrderDate between @fromDate and @toDate;
end
go

-- Execute
exec spTotalRevenueForPeriod
    '2026-01-01',
    '2026-12-31';
go

/* =====================================================
   TASK 11
   Orders with customer and product details
   ===================================================== */
create or alter procedure spOrdersWithCustomerAndProduct
as
begin
    select
        o.OrderID,
        c.FirstName,
        c.LastName,
        p.Name as ProductName,
        o.Qty,
        o.Rate,
        o.TotalAmount,
        o.OrderDate
    from dbo.[Order] o
    join dbo.Customer c on o.CustomerID = c.CustomerID
    join dbo.Product p on o.ProductID = p.ProductID;
end
go
-- Execute
exec spOrdersWithCustomerAndProduct;
go


/* =====================================================
   TASK 12
   Top N customers with highest total payments
   ===================================================== */
create or alter procedure spTopNCustomersByPayments
    @topN int
as
begin
    select top (@topN)
        c.CustomerID,
        c.FirstName,
        sum(p.Amount) as TotalPaid
    from dbo.Customer c
    join dbo.[Order] o on c.CustomerID = o.CustomerID
    join dbo.Payment p on o.OrderID = p.OrderID
    group by c.CustomerID, c.FirstName
    order by TotalPaid desc;
end
go

-- Execute
exec spTopNCustomersByPayments 1;
go

/* =====================================================
   TASK 13
   Orders made by customers who paid in last N months
   ===================================================== */
create or alter procedure spOrdersByRecentPayments
    @months int
as
begin
    select distinct o.*
    from dbo.[Order] o
    join dbo.Payment p on o.OrderID = p.OrderID
    where p.PaymentDate >= dateadd(month, -@months, getdate());
end
go

-- Execute
exec spOrdersByRecentPayments 6;
go



/* =====================================================
   TASK 14
   Total revenue for each product
   ===================================================== */
create or alter procedure spRevenueByProduct
as
begin
    select
        p.ProductID,
        p.Name,
        sum(o.TotalAmount) as TotalRevenue
    from dbo.Product p
    join dbo.[Order] o on p.ProductID = o.ProductID
    group by p.ProductID, p.Name;
end
go

-- Execute
exec spRevenueByProduct;
go

/* =====================================================
   TASK 15
   Most profitable product
   ===================================================== */
create or alter procedure spMostProfitableProduct
as
begin
    select top 1
        p.ProductID,
        p.Name,
        sum(o.TotalAmount) as TotalRevenue
    from dbo.Product p
    join dbo.[Order] o on p.ProductID = o.ProductID
    group by p.ProductID, p.Name
    order by TotalRevenue desc;
end
go

-- Execute
exec spMostProfitableProduct;
go


/* =====================================================
   TASK 16
   Customers who purchased a product in date range
   ===================================================== */
create or alter procedure spCustomersByProductAndDate
    @productId int,
    @fromDate datetime,
    @toDate datetime
as
begin
    select distinct
        c.CustomerID,
        c.FirstName,
        c.LastName
    from dbo.Customer c
    join dbo.[Order] o on c.CustomerID = o.CustomerID
    where o.ProductID = @productId
      and o.OrderDate between @fromDate and @toDate;
end
go

-- Execute
exec spCustomersByProductAndDate
    1,
    '2026-01-01',
    '2026-12-31';
go


/* =====================================================
   TASK 17
   Average order value per customer
   ===================================================== */
create or alter procedure spAverageOrderValuePerCustomer
as
begin
    select
        CustomerID,
        avg(TotalAmount) as AverageOrderValue
    from dbo.[Order]
    group by CustomerID;
end
go

-- Execute
exec spAverageOrderValuePerCustomer;
go


/* =====================================================
   TASK 18
   Highest order amount for each customer
   ===================================================== */
create or alter procedure spHighestOrderPerCustomer
as
begin
    select *
    from (
        select *,
               rank() over (partition by CustomerID order by TotalAmount desc) as rnk
        from dbo.[Order]
    ) x
    where rnk = 1;
end
go

-- Execute
exec spHighestOrderPerCustomer;
go



/* =====================================================
   TASK 19
   Orders & revenue per customer for a specific year
   ===================================================== */
create or alter procedure spYearlyCustomerRevenue
    @year int
as
begin
    select
        CustomerID,
        count(*) as TotalOrders,
        sum(TotalAmount) as TotalRevenue
    from dbo.[Order]
    where year(OrderDate) = @year
    group by CustomerID;
end
go

-- Execute
exec spYearlyCustomerRevenue 2026;
go


/* =====================================================
   TASK 20
   Orders not paid within N days
   ===================================================== */
create or alter procedure spUnpaidOrdersAfterDays
    @days int
as
begin
    select o.*
    from dbo.[Order] o
    left join dbo.Payment p on o.OrderID = p.OrderID
    where p.OrderID is null
      and datediff(day, o.OrderDate, getdate()) > @days;
end
go

-- Execute
exec spUnpaidOrdersAfterDays 30;
go

/* =====================================================
   TASK 21
   Customers with consecutive purchases
   ===================================================== */
create or alter procedure spConsecutivePurchases
    @days int
as
begin
    select distinct CustomerID
    from (
        select
            CustomerID,
            OrderDate,
            lag(OrderDate) over (partition by CustomerID order by OrderDate) as PrevOrderDate
        from dbo.[Order]
    ) x
    where PrevOrderDate is not null
      and datediff(day, PrevOrderDate, OrderDate) <= @days;
end
go

-- Execute
exec spConsecutivePurchases 7;
go

/* =====================================================
   TASK 22
   Revenue per customer in last N months
   ===================================================== */
create or alter procedure spRevenueLastNMonths
    @months int
as
begin
    select
        CustomerID,
        sum(TotalAmount) as TotalRevenue
    from dbo.[Order]
    where OrderDate >= dateadd(month, -@months, getdate())
    group by CustomerID;
end
go

-- Execute
exec spRevenueLastNMonths 6;
go

/* =====================================================
   TASK 23
   Orders where product price > average price
   ===================================================== */
create or alter procedure spOrdersAboveAverageProductPrice
as
begin
    select o.*
    from dbo.[Order] o
    join dbo.Product p on o.ProductID = p.ProductID
    where p.Price > (select avg(Price) from dbo.Product);
end
go

-- Execute
exec spOrdersAboveAverageProductPrice;
go

/* =====================================================
   TASK 24
   Average time between orders per customer
   ===================================================== */
create or alter procedure spAvgTimeBetweenOrders
as
begin
    select
        CustomerID,
        avg(datediff(day, PrevOrderDate, OrderDate)) as AvgDaysBetweenOrders
    from (
        select
            CustomerID,
            OrderDate,
            lag(OrderDate) over (partition by CustomerID order by OrderDate) as PrevOrderDate
        from dbo.[Order]
    ) x
    where PrevOrderDate is not null
    group by CustomerID;
end
go

-- Execute
exec spAvgTimeBetweenOrders;
go


/* =====================================================
   TASK 25
   Pagination + Sorting + Searching
   ===================================================== */
create or alter procedure spOrderPagination
    @pageNumber int,
    @pageSize int,
    @searchCustomerId int = null,
    @sortColumn varchar(50) = 'OrderDate',
    @sortDirection varchar(4) = 'DESC'
as
begin
    declare @sql nvarchar(max);
    declare @offset int;

    set @offset = (@pageNumber - 1) * @pageSize;

    set @sql = N'
        select *
        from dbo.[Order]
        where (@searchCustomerId is null or CustomerID = @searchCustomerId)
        order by ' + quotename(@sortColumn) + N' ' + @sortDirection + N'
        offset @offset rows fetch next @pageSize rows only';

    exec sp_executesql
        @sql,
        N'@searchCustomerId int, @offset int, @pageSize int',
        @searchCustomerId,
        @offset,
        @pageSize;
end
go

-- Execute
exec spOrderPagination
    1,
    5,
    null,
    'OrderDate',
    'DESC';
go 




--1
exec spInsertCustomer
    @firstName = 'Rahul',
    @lastName = 'Sharma',
    @email = 'rahul@gmail.com',
    @phone = '9876543210';

exec spInsertCustomer
    'Anita',
    'Verma',
    'anita@gmail.com',
    '8887776665';

exec spGetCustomers;


exec spInsertProduct
    'Laptop',
    55000,
    'Gaming laptop';

exec spInsertProduct
    'Mobile',
    25000,
    'Android phone';

exec spGetProducts;


exec spInsertOrder
    1,                          -- CustomerID
    '2026-02-05 14:55:00',
    1,                          -- ProductID
    2,
    55000;

exec spInsertOrder
    2,
    '2026-02-06 10:30:00',
    2,
    1,
    25000;

exec spGetOrders;


exec spInsertPayment
    @orderId = 1,
    @amount = 110000;

exec spInsertPayment
    2,
    25000;

exec spGetPayments;

--2
exec spUpdateCustomer
    1,
    'Rahul',
    'Verma',
    'rahul.verma@gmail.com',
    '9998887776';

exec spUpdateProduct
    1,
    'Laptop Pro',
    60000,
    'Upgraded laptop';

exec spUpdateOrder
    1,
    1,
    '2026-02-07 09:00:00',
    1,
    3,
    60000;

exec spUpdatePayment
    1,
    1,
    180000;
--3
 exec spGetCustomers;
exec spGetProducts;
exec spGetOrders;
exec spGetPayments;


--4
-- Delete payment first
exec spDeletePayment 1;

-- Then order
exec spDeleteOrder 1;

-- Then product
exec spDeleteProduct 1;

-- Then customer
exec spDeleteCustomer 1;

--5

exec spUpdateProductPrice
    2,
    27000;

exec spGetProducts;

--6
exec spInsertOrderWithTotal
    2,
    '2026-02-08 11:00:00',
    2,
    2,
    27000;

exec spGetOrders;

--7
exec spInsertPaymentForOrder
    3,
    54000;

exec spGetPayments;




exec spTotalPaymentsByCustomer;--8
exec spCustomersWithNoPayments;--9
exec spTotalRevenueForPeriod '2026-01-01', '2026-12-31';--10
exec spOrdersWithCustomerAndProduct;--11
exec spTopNCustomersByPayments 2;--12
exec spOrdersByRecentPayments 6;--13
exec spRevenueByProduct;--14
exec spMostProfitableProduct;--15
exec spCustomersByProductAndDate 2, '2026-01-01', '2026-12-31';--16
exec spAverageOrderValuePerCustomer; --17
exec spHighestOrderPerCustomer; --18
exec spYearlyCustomerRevenue 2026; --19
exec spUnpaidOrdersAfterDays 30; --20
exec spConsecutivePurchases 7; --21
exec spRevenueLastNMonths 6; --22
exec spOrdersAboveAverageProductPrice; --23
exec spAvgTimeBetweenOrders; -- 24
exec spOrderPagination 1, 5, null, 'OrderDate', 'DESC'; --25
