using MongoDB.Bson;
using MongoDB.Driver;
using QbAppBackend.DTOs.Qb;
using QbAppBackend.Models.Mongo;
using QbAppBackend.Services.Interfaces;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace QbAppBackend.Services
{
    public class QbService : IQbService
    {
        private readonly IMongoCollection<QbConnection> _connections;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ICurrentUserService _currentUserService;

        public QbService(
            IMongoDatabase database,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ICurrentUserService currentUserService)
        {
            _connections = database.GetCollection<QbConnection>("QbConnections");
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _currentUserService = currentUserService;
        }

        private string QuickBooksApiBaseUrl =>
            string.Equals(_configuration["Intuit:Environment"], "Production", StringComparison.OrdinalIgnoreCase)
                ? "https://quickbooks.api.intuit.com"
                : "https://sandbox-quickbooks.api.intuit.com";

        public string GetConnectUrl(string userId)
        {
            var state = Convert.ToBase64String(Encoding.UTF8.GetBytes($"connect:{userId}"));
            var scopes = Uri.EscapeDataString(_configuration["Intuit:Scopes"] ?? "com.intuit.quickbooks.accounting");
            return $"{_configuration["Intuit:AuthUrl"]}?client_id={_configuration["Intuit:ClientId"]}&response_type=code&scope={scopes}&redirect_uri={Uri.EscapeDataString(_configuration["Intuit:RedirectUri"]!)}&state={Uri.EscapeDataString(state)}";
        }

        public async Task<QbConnectionDto> ExchangeCodeAsync(string code, string realmId, string userId)
        {
            var tokenData = await ExchangeAuthorizationCodeAsync(code, _configuration["Intuit:RedirectUri"]!);
            var companyName = await GetCompanyNameAsync(realmId, tokenData.GetProperty("access_token").GetString()!);
            var expiresIn = tokenData.GetProperty("expires_in").GetInt32();
            var refreshExpiresIn = tokenData.TryGetProperty("x_refresh_token_expires_in", out var refreshExpiryElement)
                ? refreshExpiryElement.GetInt32()
                : 8640000;

            var connection = new QbConnection
            {
                Id = ObjectId.GenerateNewId(),
                UserId = ObjectId.Parse(userId),
                RealmId = realmId,
                CompanyName = companyName,
                AccessToken = tokenData.GetProperty("access_token").GetString()!,
                RefreshToken = tokenData.GetProperty("refresh_token").GetString()!,
                ExpiresAt = DateTime.UtcNow.AddSeconds(expiresIn),
                RefreshTokenExpiresAt = DateTime.UtcNow.AddSeconds(refreshExpiresIn),
                ConnectedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _connections.ReplaceOneAsync(
                x => x.UserId == connection.UserId && x.RealmId == connection.RealmId,
                connection,
                new ReplaceOptions { IsUpsert = true });

            return Map(connection);
        }

        public async Task<IReadOnlyList<QbConnectionDto>> GetConnectionsAsync()
        {
            var userId = ObjectId.Parse(_currentUserService.GetUserId());
            var connections = await _connections.Find(x => x.UserId == userId).SortByDescending(x => x.ConnectedAt).ToListAsync();
            return connections.Select(Map).ToList();
        }

        public async Task<bool> HasActiveConnectionAsync()
        {
            var userId = ObjectId.Parse(_currentUserService.GetUserId());
            return await _connections.Find(x => x.UserId == userId).AnyAsync();
        }

        public async Task DisconnectAsync(string realmId)
        {
            var userId = ObjectId.Parse(_currentUserService.GetUserId());
            var connection = await _connections.Find(x => x.UserId == userId && x.RealmId == realmId).FirstOrDefaultAsync();
            if (connection is null)
            {
                return;
            }

            await RevokeTokenAsync(connection);
            await _connections.DeleteOneAsync(x => x.Id == connection.Id);
        }

        public async Task<IReadOnlyList<QbEntitySummaryDto>> GetAccountsAsync()
        {
            var json = await ExecuteQueryAsync("SELECT Id, Name, AccountType, SyncToken FROM Account MAXRESULTS 1000");
            return ParseEntities(json, "Account", element => new QbEntitySummaryDto
            {
                Id = GetString(element, "Id"),
                Name = GetString(element, "Name"),
                SyncToken = GetString(element, "SyncToken"),
                Type = GetString(element, "AccountType")
            });
        }

        public async Task<IReadOnlyList<QbEntitySummaryDto>> GetCustomersAsync()
        {
            var json = await ExecuteQueryAsync("SELECT Id, DisplayName, SyncToken, PrimaryEmailAddr, PrimaryPhone, CompanyName, Mobile, Fax FROM Customer MAXRESULTS 1000");
            return ParseEntities(json, "Customer", element => new QbEntitySummaryDto
            {
                Id = GetString(element, "Id"),
                Name = GetString(element, "DisplayName"),
                SyncToken = GetString(element, "SyncToken"),
                Email = TryGetNestedString(element, "PrimaryEmailAddr", "Address"),
                Phone = TryGetNestedString(element, "PrimaryPhone", "FreeFormNumber"),
                CompanyName = GetString(element, "CompanyName"),
                Mobile = TryGetNestedString(element, "Mobile", "FreeFormNumber"),
                Fax = TryGetNestedString(element, "Fax", "FreeFormNumber")
            });
        }

        public async Task<IReadOnlyList<QbEntitySummaryDto>> GetItemsAsync()
        {
            var json = await ExecuteQueryAsync("SELECT Id, Name, Type, SyncToken, UnitPrice FROM Item MAXRESULTS 1000");
            return ParseEntities(json, "Item", element => new QbEntitySummaryDto
            {
                Id = GetString(element, "Id"),
                Name = GetString(element, "Name"),
                SyncToken = GetString(element, "SyncToken"),
                Type = GetString(element, "Type"),
                UnitPrice = TryGetDecimal(element, "UnitPrice")
            });
        }

        public async Task<QbEntitySummaryDto> CreateAccountAsync(AccountDto dto)
        {
            var json = await SendMutationAsync("account", new
            {
                Name = dto.Name,
                AccountType = dto.AccountType,
                AccountSubType = dto.AccountSubType
            });
            return ParseSingleEntity(json, "Account", element => new QbEntitySummaryDto
            {
                Id = GetString(element, "Id"),
                Name = GetString(element, "Name"),
                SyncToken = GetString(element, "SyncToken"),
                Type = GetString(element, "AccountType")
            });
        }

        public async Task<QbEntitySummaryDto> UpdateAccountAsync(string id, AccountDto dto)
        {
            var json = await SendMutationAsync("account?operation=update", new
            {
                Id = id,
                SyncToken = dto.SyncToken,
                sparse = true,
                Name = dto.Name,
                AccountType = dto.AccountType,
                AccountSubType = dto.AccountSubType
            });
            return ParseSingleEntity(json, "Account", element => new QbEntitySummaryDto
            {
                Id = GetString(element, "Id"),
                Name = GetString(element, "Name"),
                SyncToken = GetString(element, "SyncToken"),
                Type = GetString(element, "AccountType")
            });
        }

        public async Task DeleteAccountAsync(string id, string syncToken)
        {
            await SendMutationAsync("account?operation=delete", new { Id = id, SyncToken = syncToken });
        }

        public async Task<QbEntitySummaryDto> CreateCustomerAsync(CustomerDto dto)
        {
            var json = await SendMutationAsync("customer", new
            {
                CompanyName = dto.CompanyName,
                DisplayName = dto.DisplayName,
                PrimaryEmailAddr = string.IsNullOrWhiteSpace(dto.Email) ? null : new { Address = dto.Email },
                PrimaryPhone = string.IsNullOrWhiteSpace(dto.Phone) ? null : new { FreeFormNumber = dto.Phone },
                Mobile = string.IsNullOrWhiteSpace(dto.Mobile) ? null : new { FreeFormNumber = dto.Mobile },
                Fax = string.IsNullOrWhiteSpace(dto.Fax) ? null : new { FreeFormNumber = dto.Fax },
                Notes = $"CC: {dto.Cc}\nBCC: {dto.Bcc}"
            });
            return ParseSingleEntity(json, "Customer", element => new QbEntitySummaryDto
            {
                Id = GetString(element, "Id"),
                Name = GetString(element, "DisplayName"),
                SyncToken = GetString(element, "SyncToken"),
                Email = TryGetNestedString(element, "PrimaryEmailAddr", "Address"),
                Phone = TryGetNestedString(element, "PrimaryPhone", "FreeFormNumber"),
                CompanyName = GetString(element, "CompanyName"),
                Mobile = TryGetNestedString(element, "Mobile", "FreeFormNumber"),
                Fax = TryGetNestedString(element, "Fax", "FreeFormNumber")
            });
        }

        public async Task<QbEntitySummaryDto> UpdateCustomerAsync(string id, CustomerDto dto)
        {
            var json = await SendMutationAsync("customer?operation=update", new
            {
                Id = id,
                SyncToken = dto.SyncToken,
                sparse = true,
                CompanyName = dto.CompanyName,
                DisplayName = dto.DisplayName,
                PrimaryEmailAddr = string.IsNullOrWhiteSpace(dto.Email) ? null : new { Address = dto.Email },
                PrimaryPhone = string.IsNullOrWhiteSpace(dto.Phone) ? null : new { FreeFormNumber = dto.Phone },
                Mobile = string.IsNullOrWhiteSpace(dto.Mobile) ? null : new { FreeFormNumber = dto.Mobile },
                Fax = string.IsNullOrWhiteSpace(dto.Fax) ? null : new { FreeFormNumber = dto.Fax },
                Notes = $"CC: {dto.Cc}\nBCC: {dto.Bcc}"
            });
            return ParseSingleEntity(json, "Customer", element => new QbEntitySummaryDto
            {
                Id = GetString(element, "Id"),
                Name = GetString(element, "DisplayName"),
                SyncToken = GetString(element, "SyncToken"),
                Email = TryGetNestedString(element, "PrimaryEmailAddr", "Address"),
                Phone = TryGetNestedString(element, "PrimaryPhone", "FreeFormNumber"),
                CompanyName = GetString(element, "CompanyName"),
                Mobile = TryGetNestedString(element, "Mobile", "FreeFormNumber"),
                Fax = TryGetNestedString(element, "Fax", "FreeFormNumber")
            });
        }

        public async Task DeleteCustomerAsync(string id, string syncToken)
        {
            await SendMutationAsync("customer?operation=delete", new { Id = id, SyncToken = syncToken });
        }

        public async Task<QbEntitySummaryDto> CreateItemAsync(ItemDto dto)
        {
            var json = await SendMutationAsync("item", BuildItemPayload(dto, null));
            return ParseSingleEntity(json, "Item", element => new QbEntitySummaryDto
            {
                Id = GetString(element, "Id"),
                Name = GetString(element, "Name"),
                SyncToken = GetString(element, "SyncToken"),
                Type = GetString(element, "Type"),
                UnitPrice = TryGetDecimal(element, "UnitPrice")
            });
        }

        public async Task<QbEntitySummaryDto> UpdateItemAsync(string id, ItemDto dto)
        {
            var json = await SendMutationAsync("item?operation=update", BuildItemPayload(dto, id));
            return ParseSingleEntity(json, "Item", element => new QbEntitySummaryDto
            {
                Id = GetString(element, "Id"),
                Name = GetString(element, "Name"),
                SyncToken = GetString(element, "SyncToken"),
                Type = GetString(element, "Type"),
                UnitPrice = TryGetDecimal(element, "UnitPrice")
            });
        }

        public async Task DeleteItemAsync(string id, string syncToken)
        {
            await SendMutationAsync("item?operation=delete", new { Id = id, SyncToken = syncToken });
        }

        public async Task<InvoiceSyncResultDto> CreateInvoiceAsync(CreateInvoiceDto dto)
        {
            var json = await SendMutationAsync("invoice", BuildInvoicePayload(dto, null, null));
            return ParseInvoice(json);
        }

        public async Task<InvoiceSyncResultDto> UpdateInvoiceAsync(string quickbooksInvoiceId, string syncToken, UpdateInvoiceDto dto)
        {
            var currentInvoice = await GetInvoiceUpdateContextAsync(quickbooksInvoiceId);
            var json = await SendMutationAsync("invoice?operation=update", BuildInvoicePayload(dto, quickbooksInvoiceId, currentInvoice.SyncToken, currentInvoice.LineIds, isUpdate: true));
            return ParseInvoice(json);
        }

        public async Task DeleteInvoiceAsync(string quickbooksInvoiceId, string syncToken)
        {
            await SendMutationAsync("invoice?operation=delete", new { Id = quickbooksInvoiceId, SyncToken = syncToken });
        }

        private object BuildItemPayload(ItemDto dto, string? id)
        {
            return new
            {
                Id = id,
                SyncToken = dto.SyncToken,
                sparse = id is not null,
                Name = dto.Name,
                Type = dto.Type,
                UnitPrice = dto.UnitPrice,
                IncomeAccountRef = string.IsNullOrWhiteSpace(dto.IncomeAccountId) ? null : new { value = dto.IncomeAccountId },
                Description = dto.Description,
                TrackQtyOnHand = false
            };
        }

        private static object BuildInvoicePayload(dynamic dto, string? quickbooksInvoiceId, string? syncToken, IReadOnlyList<string>? existingLineIds = null, bool isUpdate = false)
        {
            var lines = ((IEnumerable<InvoiceLineDto>)dto.Lines)
                .Select((line, index) => BuildInvoiceLinePayload(line, existingLineIds?.ElementAtOrDefault(index)))
                .ToArray();

            return new
            {
                Id = quickbooksInvoiceId,
                SyncToken = syncToken,
                sparse = !isUpdate && quickbooksInvoiceId is not null,
                CustomerRef = new { value = dto.CustomerId },
                TxnDate = ((DateTime)dto.TxnDate).ToString("yyyy-MM-dd"),
                DueDate = ((DateTime)dto.DueDate).ToString("yyyy-MM-dd"),
                Line = lines,
                TxnTaxDetail = new { TotalTax = dto.TaxAmount }
            };
        }

        private static object BuildInvoiceLinePayload(InvoiceLineDto line, string? existingLineId)
        {
            var payload = new InvoiceLinePayload
            {
                Id = existingLineId,
                Amount = line.Quantity * line.UnitPrice,
                Description = line.Description,
                DetailType = "SalesItemLineDetail",
                SalesItemLineDetail = new InvoiceSalesItemLineDetailPayload
                {
                    ItemRef = new InvoiceReferencePayload { value = line.ItemId },
                    Qty = line.Quantity,
                    UnitPrice = line.UnitPrice
                }
            };

            return payload;
        }

        private async Task<string> ExecuteQueryAsync(string query)
        {
            var client = await CreateAuthorizedClientAsync();
            var connection = await GetCurrentConnectionAsync();
            var url = $"{QuickBooksApiBaseUrl}/v3/company/{connection.RealmId}/query?query={Uri.EscapeDataString(query)}";
            var response = await client.GetAsync(url);
            var payload = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(payload);
            }

            return payload;
        }

        private async Task<string> SendMutationAsync(string endpoint, object payload)
        {
            var client = await CreateAuthorizedClientAsync();
            var connection = await GetCurrentConnectionAsync();
            using var request = new HttpRequestMessage(HttpMethod.Post, $"{QuickBooksApiBaseUrl}/v3/company/{connection.RealmId}/{endpoint}")
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await client.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(body);
            }

            return body;
        }

        private async Task<InvoiceUpdateContext> GetInvoiceUpdateContextAsync(string quickbooksInvoiceId)
        {
            var client = await CreateAuthorizedClientAsync();
            var connection = await GetCurrentConnectionAsync();
            var response = await client.GetAsync($"{QuickBooksApiBaseUrl}/v3/company/{connection.RealmId}/invoice/{quickbooksInvoiceId}");
            var payload = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(payload);
            }

            var document = JsonSerializer.Deserialize<JsonElement>(payload);
            var invoice = document.GetProperty("Invoice");
            var syncToken = GetString(invoice, "SyncToken");
            var lineIds = new List<string>();

            if (invoice.TryGetProperty("Line", out var lines) && lines.ValueKind == JsonValueKind.Array)
            {
                foreach (var line in lines.EnumerateArray())
                {
                    if (GetString(line, "DetailType") == "SalesItemLineDetail")
                    {
                        var lineId = GetString(line, "Id");
                        if (!string.IsNullOrWhiteSpace(lineId))
                        {
                            lineIds.Add(lineId);
                        }
                    }
                }
            }

            return new InvoiceUpdateContext
            {
                SyncToken = syncToken,
                LineIds = lineIds
            };
        }

        private async Task<HttpClient> CreateAuthorizedClientAsync()
        {
            var connection = await GetCurrentConnectionAsync();
            if (connection.ExpiresAt <= DateTime.UtcNow.AddMinutes(-1))
            {
                connection = await RefreshAccessTokenAsync(connection);
            }

            var client = _httpClientFactory.CreateClient("quickbooks");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", connection.AccessToken);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            return client;
        }

        private async Task<QbConnection> RefreshAccessTokenAsync(QbConnection connection)
        {
            if (connection.RefreshTokenExpiresAt <= DateTime.UtcNow)
            {
                throw new InvalidOperationException("QuickBooks refresh token expired. Please reconnect your company.");
            }

            var client = _httpClientFactory.CreateClient("quickbooks");
            var basicAuth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_configuration["Intuit:ClientId"]}:{_configuration["Intuit:ClientSecret"]}"));
            using var request = new HttpRequestMessage(HttpMethod.Post, _configuration["Intuit:TokenUrl"])
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["grant_type"] = "refresh_token",
                    ["refresh_token"] = connection.RefreshToken
                })
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicAuth);

            var response = await client.SendAsync(request);
            var payload = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException($"QuickBooks token refresh failed: {payload}");
            }

            var tokenData = JsonSerializer.Deserialize<JsonElement>(payload);
            connection.AccessToken = tokenData.GetProperty("access_token").GetString()!;
            connection.RefreshToken = tokenData.GetProperty("refresh_token").GetString()!;
            connection.ExpiresAt = DateTime.UtcNow.AddSeconds(tokenData.GetProperty("expires_in").GetInt32());
            connection.UpdatedAt = DateTime.UtcNow;
            await _connections.ReplaceOneAsync(x => x.Id == connection.Id, connection);
            return connection;
        }

        private async Task<QbConnection> GetCurrentConnectionAsync()
        {
            var userId = ObjectId.Parse(_currentUserService.GetUserId());
            var connection = await _connections.Find(x => x.UserId == userId)
                .SortByDescending(x => x.ConnectedAt)
                .FirstOrDefaultAsync();

            return connection ?? throw new InvalidOperationException("No QuickBooks connection found. Please connect a company first.");
        }

        private async Task RevokeTokenAsync(QbConnection connection)
        {
            var client = _httpClientFactory.CreateClient("quickbooks");
            var basicAuth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_configuration["Intuit:ClientId"]}:{_configuration["Intuit:ClientSecret"]}"));
            var revocationUrl = _configuration["Intuit:RevocationUrl"] ?? "https://developer.api.intuit.com/v2/oauth2/tokens/revoke";

            using var request = new HttpRequestMessage(HttpMethod.Post, revocationUrl)
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(new { token = string.IsNullOrWhiteSpace(connection.RefreshToken) ? connection.AccessToken : connection.RefreshToken }),
                    Encoding.UTF8,
                    "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicAuth);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await client.SendAsync(request);
            var payload = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException($"QuickBooks disconnect failed: {payload}");
            }
        }

        private async Task<JsonElement> ExchangeAuthorizationCodeAsync(string code, string redirectUri)
        {
            var client = _httpClientFactory.CreateClient("quickbooks");
            var basicAuth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_configuration["Intuit:ClientId"]}:{_configuration["Intuit:ClientSecret"]}"));
            using var request = new HttpRequestMessage(HttpMethod.Post, _configuration["Intuit:TokenUrl"])
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["grant_type"] = "authorization_code",
                    ["code"] = code,
                    ["redirect_uri"] = redirectUri
                })
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicAuth);

            var response = await client.SendAsync(request);
            var payload = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException($"QuickBooks authorization failed: {payload}");
            }

            return DeserializeJson(payload, "QuickBooks authorization");
        }

        private async Task<string> GetCompanyNameAsync(string realmId, string accessToken)
        {
            var client = _httpClientFactory.CreateClient("quickbooks");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            var response = await client.GetAsync($"{QuickBooksApiBaseUrl}/v3/company/{realmId}/companyinfo/{realmId}");
            var payload = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return realmId;
            }

            var document = DeserializeJson(payload, "QuickBooks company info");
            return document.GetProperty("CompanyInfo").TryGetProperty("CompanyName", out var companyName)
                ? companyName.GetString() ?? realmId
                : realmId;
        }

        private static JsonElement DeserializeJson(string payload, string operationName)
        {
            try
            {
                return JsonSerializer.Deserialize<JsonElement>(payload);
            }
            catch (JsonException)
            {
                var preview = payload.Length > 200 ? payload[..200] : payload;
                throw new InvalidOperationException($"{operationName} returned non-JSON content: {preview}");
            }
        }

        private static IReadOnlyList<QbEntitySummaryDto> ParseEntities(string json, string entityName, Func<JsonElement, QbEntitySummaryDto> map)
        {
            var document = JsonSerializer.Deserialize<JsonElement>(json);
            if (!document.TryGetProperty("QueryResponse", out var queryResponse) || !queryResponse.TryGetProperty(entityName, out var elements))
            {
                return Array.Empty<QbEntitySummaryDto>();
            }

            if (elements.ValueKind == JsonValueKind.Array)
            {
                return elements.EnumerateArray().Select(map).ToList();
            }

            return new[] { map(elements) };
        }

        private static QbEntitySummaryDto ParseSingleEntity(string json, string entityName, Func<JsonElement, QbEntitySummaryDto> map)
        {
            var document = JsonSerializer.Deserialize<JsonElement>(json);
            return map(document.GetProperty(entityName));
        }

        private static InvoiceSyncResultDto ParseInvoice(string json)
        {
            var document = JsonSerializer.Deserialize<JsonElement>(json);
            var invoice = document.GetProperty("Invoice");
            return new InvoiceSyncResultDto
            {
                QuickbooksInvoiceId = GetString(invoice, "Id"),
                SyncToken = GetString(invoice, "SyncToken"),
                TotalAmount = TryGetDecimal(invoice, "TotalAmt") ?? 0,
                Balance = TryGetDecimal(invoice, "Balance") ?? 0,
                Status = GetString(invoice, "EmailStatus", "Open"),
                TaxAmount = invoice.TryGetProperty("TxnTaxDetail", out var t) && t.TryGetProperty("TotalTax", out var tt) 
                    ? tt.ValueKind == JsonValueKind.Number ? tt.GetDecimal() 
                    : tt.ValueKind == JsonValueKind.String && decimal.TryParse(tt.GetString(), out var tv) ? tv : 0 
                    : 0
            };
        }

        private static string GetString(JsonElement element, string propertyName, string fallback = "")
        {
            return element.TryGetProperty(propertyName, out var property) ? property.GetString() ?? fallback : fallback;
        }

        private static string? TryGetNestedString(JsonElement element, string propertyName, string nestedPropertyName)
        {
            return element.TryGetProperty(propertyName, out var property) && property.TryGetProperty(nestedPropertyName, out var nested)
                ? nested.GetString()
                : null;
        }

        private static decimal? TryGetDecimal(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out var property))
            {
                return null;
            }

            return property.ValueKind switch
            {
                JsonValueKind.Number => property.GetDecimal(),
                JsonValueKind.String when decimal.TryParse(property.GetString(), out var value) => value,
                _ => null
            };
        }

        private static QbConnectionDto Map(QbConnection connection)
        {
            return new QbConnectionDto
            {
                RealmId = connection.RealmId,
                CompanyName = connection.CompanyName,
                ExpiresAt = connection.ExpiresAt,
                ConnectedAt = connection.ConnectedAt,
                IsExpired = connection.ExpiresAt <= DateTime.UtcNow
            };
        }

        private sealed class InvoiceUpdateContext
        {
            public string SyncToken { get; init; } = string.Empty;
            public IReadOnlyList<string> LineIds { get; init; } = Array.Empty<string>();
        }

        private sealed class InvoiceLinePayload
        {
            [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
            public string? Id { get; init; }
            public decimal Amount { get; init; }
            public string Description { get; init; } = string.Empty;
            public string DetailType { get; init; } = "SalesItemLineDetail";
            public InvoiceSalesItemLineDetailPayload SalesItemLineDetail { get; init; } = new();
        }

        private sealed class InvoiceSalesItemLineDetailPayload
        {
            public InvoiceReferencePayload ItemRef { get; init; } = new();
            public decimal Qty { get; init; }
            public decimal UnitPrice { get; init; }
        }

        private sealed class InvoiceReferencePayload
        {
            public string value { get; init; } = string.Empty;
        }
    }
}
