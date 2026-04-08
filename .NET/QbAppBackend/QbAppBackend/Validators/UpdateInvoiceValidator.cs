using FluentValidation;
using QbAppBackend.DTOs.Qb;

namespace QbAppBackend.Validators
{
    public class UpdateInvoiceValidator : AbstractValidator<UpdateInvoiceDto>
    {
        public UpdateInvoiceValidator()
        {
            RuleFor(x => x.CustomerId).NotEmpty();
            RuleFor(x => x.CustomerName).NotEmpty();
            RuleFor(x => x.DueDate).GreaterThanOrEqualTo(x => x.TxnDate);
            RuleFor(x => x.Lines).NotEmpty();
            RuleForEach(x => x.Lines).ChildRules(line =>
            {
                line.RuleFor(l => l.ItemId).NotEmpty();
                line.RuleFor(l => l.Description).NotEmpty().MaximumLength(200);
                line.RuleFor(l => l.Quantity).GreaterThan(0);
                line.RuleFor(l => l.UnitPrice).GreaterThan(0);
            });
        }
    }
}
