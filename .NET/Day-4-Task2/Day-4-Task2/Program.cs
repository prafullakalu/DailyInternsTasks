using Day_4_Task2.Models;
using Day_4_Task2.Repository;
using Day_4_Task2.Transactions;
using AutoMapper;
using System;
using System.Configuration;
using System.Collections.Generic;

namespace Day_4_Task2
{
    class Program
    {
        static IAccountRepository repository = new AccountRepository();
        static IMapper mapper;

        static void Main()
        {
            var config = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<AccountDto, Account>();
            });

            mapper = config.CreateMapper();

            while (true)
            {
                Console.WriteLine("\n1 Open Account");
                Console.WriteLine("2 Deposit");
                Console.WriteLine("3 Withdraw");
                Console.WriteLine("4 Show Account");
                Console.WriteLine("5 Apply Interest");
                Console.WriteLine("6 Exit");

                var choice = Console.ReadLine();

                try
                {
                    switch (choice)
                    {
                        case "1": openAccount(); break;
                        case "2": deposit(); break;
                        case "3": withdraw(); break;
                        case "4": showAccount(); break;
                        case "5": applyInterest(); break;
                        case "6": return;
                        default: Console.WriteLine("Invalid choice"); break;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error: " + ex.Message);
                }
            }
        }

        static void openAccount()
        {
            Console.Write("Holder Name: ");
            var name = Console.ReadLine();

            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentNullException("Holder name required");

            Console.Write("Initial Deposit: ");
            decimal amount = Convert.ToDecimal(Console.ReadLine());

            if (amount < 1000)
                throw new InvalidOperationException("Minimum opening balance is 1000");

            var dto = new AccountDto
            {
                HolderName = name,
                Balance = amount
            };

            var account = mapper.Map<Account>(dto);

            account.AccountNumber = Guid.NewGuid().ToString();
            account.Transactions = new List<Transaction>();

            account.Transactions.Add(new Transaction
            {
                Date = DateTime.Now,
                Type = "Open",
                Amount = amount
            });

            repository.AddAccount(account);

            Console.WriteLine("Account Created Successfully");
            Console.WriteLine("Account Number: " + account.AccountNumber);
        }

        static void deposit()
        {
            Console.Write("Account Number: ");
            var acc = Console.ReadLine();

            Console.Write("Amount: ");
            decimal amount = Convert.ToDecimal(Console.ReadLine());

            if (amount <= 0)
                throw new InvalidOperationException("Deposit amount must be greater than zero");

            repository.PerformTransaction<DepositTransaction>(acc, amount);

            Console.WriteLine("Deposit successful");
        }

        static void withdraw()
        {
            Console.Write("Account Number: ");
            var acc = Console.ReadLine();

            Console.Write("Amount: ");
            decimal amount = Convert.ToDecimal(Console.ReadLine());

            repository.PerformTransaction<WithdrawTransaction>(acc, amount);

            Console.WriteLine("Withdrawal successful");
        }

        static void showAccount()
        {
            Console.Write("Account Number: ");
            var acc = Console.ReadLine();

            var account = repository.GetAccount(acc);

            if (account == null)
                throw new Exception("Account not found");

            Console.WriteLine("\nAccount Number: " + account.AccountNumber);
            Console.WriteLine("Holder Name: " + account.HolderName);
            Console.WriteLine("Balance: " + account.Balance);

            Console.WriteLine("\nTransactions");
            Console.WriteLine("Date\t\t\tType\tAmount");

            foreach (var t in account.Transactions)
                Console.WriteLine($"{t.Date}\t{t.Type}\t{t.Amount}");
        }

        static void applyInterest()
        {
            var rate = Convert.ToDecimal(ConfigurationManager.AppSettings["interestRate"]);

            var accounts = repository.GetAllAccounts();

            foreach (var acc in accounts)
            {
                var interest = acc.Balance * rate / 100;

                acc.Balance += interest;

                acc.Transactions.Add(new Transaction
                {
                    Date = DateTime.Now,
                    Type = "Interest",
                    Amount = interest
                });
            }

            repository.Save(accounts);

            Console.WriteLine("Interest Applied Successfully");
        }
    }
}