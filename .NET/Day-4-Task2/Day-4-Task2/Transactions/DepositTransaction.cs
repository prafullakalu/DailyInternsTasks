using Day_4_Task2.Models;
using System;

namespace Day_4_Task2.Transactions
{
    public class DepositTransaction : ITransaction
    {
        public void Process(Account account, decimal amount)
        {
            if (amount <= 0)
                throw new InvalidOperationException("Deposit amount must be greater than zero");

            account.Balance += amount;

            account.Transactions.Add(new Transaction
            {
                Date = DateTime.Now,
                Type = "Deposit",
                Amount = amount
            });
        }
    }
}