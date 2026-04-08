using Day_4_Task2.Models;
using Day_4_Task2.Services;
using Day_4_Task2.Transactions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Day_4_Task2.Repository
{
    public class AccountRepository : IAccountRepository
    {
        private readonly string filePath = "accounts.xml";

        public void AddAccount(Account account)
        {
            var accounts = GetAllAccounts();

            accounts.Add(account);

            Save(accounts);
        }

        public Account GetAccount(string accountNumber)
        {
            return GetAllAccounts().FirstOrDefault(a => a.AccountNumber == accountNumber);
        }

        public List<Account> GetAllAccounts()
        {
            try
            {
                return XmlHelper.DeserializeFromXml<List<Account>>(filePath);
            }
            catch
            {
                return new List<Account>();
            }
        }

        public void PerformTransaction<T>(string accountNumber, decimal amount) where T : new()
        {
            var accounts = GetAllAccounts();

            var account = accounts.FirstOrDefault(a => a.AccountNumber == accountNumber);

            if (account == null)
                throw new Exception("Account not found");

            var transaction = new T() as ITransaction;

            transaction.Process(account, amount);

            Save(accounts);
        }

        public void Save(List<Account> accounts)
        {
            XmlHelper.SerializeToXml(filePath, accounts);
        }
    }
}