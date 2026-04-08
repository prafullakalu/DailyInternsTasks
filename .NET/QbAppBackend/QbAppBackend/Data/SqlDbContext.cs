using Microsoft.EntityFrameworkCore;
using QbAppBackend.Models.Sql;

namespace QbAppBackend.Data
{
    public class SqlDbContext : DbContext
    {
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceLineItem> InvoiceLineItems { get; set; }

        public SqlDbContext(DbContextOptions<SqlDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Invoice>().HasKey(i => i.Id);
            modelBuilder.Entity<InvoiceLineItem>().HasKey(li => li.Id);

            modelBuilder.Entity<Invoice>()
                .HasMany(i => i.LineItems)
                .WithOne()
                .HasForeignKey(li => li.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invoice>().Property(i => i.TotalAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Invoice>().Property(i => i.Balance).HasPrecision(18, 2);
            modelBuilder.Entity<Invoice>().Property(i => i.TaxAmount).HasPrecision(18, 2);
            modelBuilder.Entity<InvoiceLineItem>().Property(li => li.UnitPrice).HasPrecision(18, 2);
            modelBuilder.Entity<InvoiceLineItem>().Property(li => li.Quantity).HasPrecision(18, 4);
        }
    }
}
