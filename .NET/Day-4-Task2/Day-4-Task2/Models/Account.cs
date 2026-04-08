using System.Collections.Generic;

namespace Day_4_Task2.Models
{
    public class Account
    {
        public string AccountNumber { get; set; }
        public string HolderName { get; set; }
        public decimal Balance { get; set; }
        public List<Transaction> Transactions { get; set; }
    }
}