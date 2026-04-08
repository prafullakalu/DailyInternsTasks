using Day_4_Task2.Models;

namespace Day_4_Task2.Transactions
{
    public interface ITransaction
    {
        void Process(Account account, decimal amount);
    }
}