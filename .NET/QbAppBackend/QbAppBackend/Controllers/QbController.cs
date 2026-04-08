using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QbAppBackend.DTOs.Qb;
using QbAppBackend.Services.Interfaces;
using System.Text;

namespace QbAppBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/qb")]
    public class QbController : ControllerBase
    {
        private readonly IQbService _qbService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IConfiguration _configuration;

        public QbController(IQbService qbService, ICurrentUserService currentUserService, IConfiguration configuration)
        {
            _qbService = qbService;
            _currentUserService = currentUserService;
            _configuration = configuration;
        }

        [HttpGet("connect-url")]
        public IActionResult GetConnectUrl()
        {
            return Ok(new { url = _qbService.GetConnectUrl(_currentUserService.GetUserId()) });
        }

        [AllowAnonymous]
        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string realmId, [FromQuery] string state)
        {
            var decodedState = Encoding.UTF8.GetString(Convert.FromBase64String(state));
            var parts = decodedState.Split(':', 2);
            if (parts.Length != 2 || parts[0] != "connect")
            {
                return BadRequest("Invalid QuickBooks connection state.");
            }

            await _qbService.ExchangeCodeAsync(code, realmId, parts[1]);
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
            return Redirect($"{frontendUrl}/connections?connected=1");
        }

        [HttpGet("connections")]
        public async Task<IActionResult> GetConnections()
        {
            return Ok(await _qbService.GetConnectionsAsync());
        }

        [HttpDelete("connections/{realmId}")]
        public async Task<IActionResult> Disconnect(string realmId)
        {
            await _qbService.DisconnectAsync(realmId);
            return NoContent();
        }

        [HttpGet("accounts")]
        public async Task<IActionResult> GetAccounts() => Ok(await _qbService.GetAccountsAsync());

        [HttpPost("accounts")]
        public async Task<IActionResult> CreateAccount([FromBody] AccountDto dto) => Ok(await _qbService.CreateAccountAsync(dto));

        [HttpPut("accounts/{id}")]
        public async Task<IActionResult> UpdateAccount(string id, [FromBody] AccountDto dto) => Ok(await _qbService.UpdateAccountAsync(id, dto));

        [HttpDelete("accounts/{id}")]
        public async Task<IActionResult> DeleteAccount(string id, [FromQuery] string syncToken)
        {
            await _qbService.DeleteAccountAsync(id, syncToken);
            return NoContent();
        }

        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers() => Ok(await _qbService.GetCustomersAsync());

        [HttpPost("customers")]
        public async Task<IActionResult> CreateCustomer([FromBody] CustomerDto dto) => Ok(await _qbService.CreateCustomerAsync(dto));

        [HttpPut("customers/{id}")]
        public async Task<IActionResult> UpdateCustomer(string id, [FromBody] CustomerDto dto) => Ok(await _qbService.UpdateCustomerAsync(id, dto));

        [HttpDelete("customers/{id}")]
        public async Task<IActionResult> DeleteCustomer(string id, [FromQuery] string syncToken)
        {
            await _qbService.DeleteCustomerAsync(id, syncToken);
            return NoContent();
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetItems() => Ok(await _qbService.GetItemsAsync());

        [HttpPost("items")]
        public async Task<IActionResult> CreateItem([FromBody] ItemDto dto) => Ok(await _qbService.CreateItemAsync(dto));

        [HttpPut("items/{id}")]
        public async Task<IActionResult> UpdateItem(string id, [FromBody] ItemDto dto) => Ok(await _qbService.UpdateItemAsync(id, dto));

        [HttpDelete("items/{id}")]
        public async Task<IActionResult> DeleteItem(string id, [FromQuery] string syncToken)
        {
            await _qbService.DeleteItemAsync(id, syncToken);
            return NoContent();
        }
    }
}
