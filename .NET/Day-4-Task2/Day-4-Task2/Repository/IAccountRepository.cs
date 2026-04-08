using Day_4_Task2.Models;
using System.Collections.Generic;

namespace Day_4_Task2.Repository
{
    public interface IAccountRepository
    {
        void AddAccount(Account account);

        Account GetAccount(string accountNumber);

        List<Account> GetAllAccounts();

        void PerformTransaction<T>(string accountNumber, decimal amount) where T : new();

        void Save(List<Account> accounts);
    }
}