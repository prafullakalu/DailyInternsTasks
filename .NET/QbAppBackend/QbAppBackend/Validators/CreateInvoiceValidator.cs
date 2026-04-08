using FluentValidation;
using QbAppBackend.DTOs.Qb;

namespace QbAppBackend.Validators
{
    public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceDto>
    {
        public CreateInvoiceValidator()
        {
            RuleFor(x => x.CustomerId).NotEmpty().WithMessage("Customer is required");
            RuleFor(x => x.CustomerName).NotEmpty().WithMessage("Customer name is required");
            RuleFor(x => x.DueDate).GreaterThanOrEqualTo(x => x.TxnDate);
            RuleFor(x => x.Lines).NotEmpty().WithMessage("At least one line item is required");
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
