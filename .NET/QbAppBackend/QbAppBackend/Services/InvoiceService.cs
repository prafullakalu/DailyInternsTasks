using QbAppBackend.DTOs.Qb;
using QbAppBackend.Models.Sql;
using QbAppBackend.Repositories;
using QbAppBackend.Services.Interfaces;

namespace QbAppBackend.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IQbService _qbService;
        private readonly ICurrentUserService _currentUserService;

        public InvoiceService(IInvoiceRepository invoiceRepository, IQbService qbService, ICurrentUserService currentUserService)
        {
            _invoiceRepository = invoiceRepository;
            _qbService = qbService;
            _currentUserService = currentUserService;
        }

        public async Task<InvoiceSummaryDto> CreateAsync(CreateInvoiceDto dto)
        {
            var userId = _currentUserService.GetUserId();
            var qbInvoice = await _qbService.CreateInvoiceAsync(dto);

            var invoice = new Invoice
            {
                UserId = userId,
                QuickbooksInvoiceId = qbInvoice.QuickbooksInvoiceId,
                QuickbooksSyncToken = qbInvoice.SyncToken,
                CustomerId = dto.CustomerId,
                CustomerName = dto.CustomerName,
                TxnDate = dto.TxnDate,
                DueDate = dto.DueDate,
                TotalAmount = qbInvoice.TotalAmount,
                Balance = qbInvoice.Balance,
                Status = qbInvoice.Status,
                TaxAmount = qbInvoice.TaxAmount,
                LineItems = dto.Lines.Select(line => new InvoiceLineItem
                {
                    ItemId = line.ItemId,
                    Description = line.Description,
                    Quantity = line.Quantity,
                    UnitPrice = line.UnitPrice
                }).ToList()
            };

            await _invoiceRepository.AddAsync(invoice);
            return Map(invoice);
        }

        public async Task<IReadOnlyList<InvoiceSummaryDto>> GetAllAsync()
        {
            if (!await _qbService.HasActiveConnectionAsync())
            {
                return Array.Empty<InvoiceSummaryDto>();
            }

            var userId = _currentUserService.GetUserId();
            var invoices = await _invoiceRepository.GetAllByUserAsync(userId);
            return invoices.Select(Map).ToList();
        }

        public async Task<InvoiceSummaryDto> GetByIdAsync(Guid id)
        {
            var userId = _currentUserService.GetUserId();
            var invoice = await _invoiceRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Invoice not found.");

            if (invoice.UserId != userId)
            {
                throw new UnauthorizedAccessException("You do not have access to this invoice.");
            }

            return Map(invoice);
        }

        public async Task<InvoiceSummaryDto> UpdateAsync(Guid id, UpdateInvoiceDto dto)
        {
            var userId = _currentUserService.GetUserId();
            var invoice = await _invoiceRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Invoice not found.");

            if (invoice.UserId != userId)
            {
                throw new UnauthorizedAccessException("You do not have access to this invoice.");
            }

            var qbResult = await _qbService.UpdateInvoiceAsync(invoice.QuickbooksInvoiceId, invoice.QuickbooksSyncToken, dto);
            invoice.CustomerId = dto.CustomerId;
            invoice.CustomerName = dto.CustomerName;
            invoice.TxnDate = dto.TxnDate;
            invoice.DueDate = dto.DueDate;
            invoice.TotalAmount = qbResult.TotalAmount;
            invoice.Balance = qbResult.Balance;
            invoice.Status = qbResult.Status;
            invoice.TaxAmount = qbResult.TaxAmount;
            invoice.QuickbooksSyncToken = qbResult.SyncToken;
            invoice.LineItems.Clear();
            foreach (var line in dto.Lines)
            {
                invoice.LineItems.Add(new InvoiceLineItem
                {
                    InvoiceId = invoice.Id,
                    ItemId = line.ItemId,
                    Description = line.Description,
                    Quantity = line.Quantity,
                    UnitPrice = line.UnitPrice
                });
            }

            await _invoiceRepository.UpdateAsync(invoice);
            return Map(invoice);
        }

        public async Task DeleteAsync(Guid id)
        {
            var userId = _currentUserService.GetUserId();
            var invoice = await _invoiceRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Invoice not found.");

            if (invoice.UserId != userId)
            {
                throw new UnauthorizedAccessException("You do not have access to this invoice.");
            }

            await _qbService.DeleteInvoiceAsync(invoice.QuickbooksInvoiceId, invoice.QuickbooksSyncToken);
            await _invoiceRepository.DeleteAsync(id);
        }

        private static InvoiceSummaryDto Map(Invoice invoice)
        {
            return new InvoiceSummaryDto
            {
                Id = invoice.Id,
                QuickbooksInvoiceId = invoice.QuickbooksInvoiceId,
                CustomerId = invoice.CustomerId,
                CustomerName = invoice.CustomerName,
                TxnDate = invoice.TxnDate,
                DueDate = invoice.DueDate,
                TotalAmount = invoice.TotalAmount,
                Balance = invoice.Balance,
                Status = invoice.Status,
                TaxAmount = invoice.TaxAmount,
                Lines = invoice.LineItems.Select(line => new InvoiceLineDto
                {
                    ItemId = line.ItemId,
                    Description = line.Description,
                    Quantity = line.Quantity,
                    UnitPrice = line.UnitPrice
                }).ToList()
            };
        }
    }
}
