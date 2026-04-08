using Day_4_Task2.Exceptions;
using Day_4_Task2.Models;
using System;

namespace Day_4_Task2.Transactions
{
    public class WithdrawTransaction : ITransaction
    {
        public void Process(Account account, decimal amount)
        {
            if (amount <= 0)
                throw new InvalidOperationException("Withdrawal amount must be greater than zero");

            if (account.Balance < amount)
                throw new InsufficientBalanceException("Insufficient balance");

            account.Balance -= amount;

            account.Transactions.Add(new Transaction
            {
                Date = DateTime.Now,
                Type = "Withdraw",
                Amount = amount
            });
        }
    }
}