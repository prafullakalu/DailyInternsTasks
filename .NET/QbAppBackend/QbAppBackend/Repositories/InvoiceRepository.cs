using Microsoft.EntityFrameworkCore;
using QbAppBackend.Data;
using QbAppBackend.Models.Sql;

namespace QbAppBackend.Repositories
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly SqlDbContext _context;

        public InvoiceRepository(SqlDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Invoice invoice)
        {
            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Invoice>> GetAllByUserAsync(string userId)
        {
            return await _context.Invoices
                .Include(i => i.LineItems)
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.TxnDate)
                .ToListAsync();
        }

        public async Task<Invoice?> GetByIdAsync(Guid id)
        {
            return await _context.Invoices
                .Include(i => i.LineItems)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task UpdateAsync(Invoice invoice)
        {
            // 1. Clear bounded tracking so EF forgets about old line items loaded by GetByIdAsync
            _context.ChangeTracker.Clear();

            // 2. Eradicate previous line items directly from the database
            await _context.InvoiceLineItems
                .Where(li => li.InvoiceId == invoice.Id)
                .ExecuteDeleteAsync();

            // 3. Attach the invoice. Because its ID isn't empty, EF marks it as Modified.
            // It will also mark the children in invoice.LineItems as Modified by default.
            _context.Invoices.Update(invoice);

            // 4. Force the new line items to be inserted (Added state) instead of updated
            foreach (var line in invoice.LineItems)
            {
                _context.Entry(line).State = EntityState.Added;
            }

            // 5. Save the UPDATE on the invoice and the INSERTs on the line items
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var invoice = await GetByIdAsync(id);
            if (invoice != null)
            {
                _context.Invoices.Remove(invoice);
                await _context.SaveChangesAsync();
            }
        }
    }
}
