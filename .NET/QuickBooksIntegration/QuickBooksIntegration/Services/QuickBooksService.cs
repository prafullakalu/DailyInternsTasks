using System.Net.Http.Headers;
using System.Text;
using QuickBooksIntegration.Models;

namespace QuickBooksIntegration.Services;

public class quickBooksService
{
    private readonly IConfiguration config;

    public quickBooksService(IConfiguration config)
    {
        this.config = config;
    }

    private HttpClient getClient(string token)
    {
        var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    // CUSTOMER
    public async Task<string> createCustomer(string token, string realmId, customerModel model)
    {
        var client = getClient(token);

        var json = $"{{\"DisplayName\":\"{model.displayName}\"}}";

        var response = await client.PostAsync(
            $"{config["QuickBooks:BaseUrl"]}/v3/company/{realmId}/customer",
            new StringContent(json, Encoding.UTF8, "application/json"));

        return await response.Content.ReadAsStringAsync();
    }

    // ITEM
    public async Task<string> createItem(string token, string realmId, itemModel model)
    {
        var client = getClient(token);

        var json = $@"
        {{
          ""Name"": ""{model.name}"",
          ""Type"": ""{model.type}"",
          ""UnitPrice"": {model.unitPrice},
          ""IncomeAccountRef"": {{
            ""value"": ""{model.incomeAccountId}""
          }}
        }}";

        var response = await client.PostAsync(
            $"{config["QuickBooks:BaseUrl"]}/v3/company/{realmId}/item",
            new StringContent(json, Encoding.UTF8, "application/json"));

        return await response.Content.ReadAsStringAsync();
    }

    // INVOICE
    public async Task<string> createInvoice(string token, string realmId, invoiceModel model)
    {
        var client = getClient(token);

        var json = $@"
        {{
          ""Line"": [
            {{
              ""DetailType"": ""SalesItemLineDetail"",
              ""Amount"": {model.amount},
              ""SalesItemLineDetail"": {{
                ""ItemRef"": {{
                  ""value"": ""{model.itemId}""
                }}
              }}
            }}
          ],
          ""CustomerRef"": {{
            ""value"": ""{model.customerId}""
          }}
        }}";

        var response = await client.PostAsync(
            $"{config["QuickBooks:BaseUrl"]}/v3/company/{realmId}/invoice",
            new StringContent(json, Encoding.UTF8, "application/json"));

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> getInvoice(string token, string realmId, string invoiceId)
    {
        var client = getClient(token);
        var response = await client.GetAsync($"{config["QuickBooks:BaseUrl"]}/v3/company/{realmId}/invoice/{invoiceId}");
        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> updateInvoice(string token, string realmId, invoiceModel model)
    {
        var client = getClient(token);

        var json = $@"
        {{
          ""Id"": ""{model.id}"",
          ""SyncToken"": ""{model.syncToken}"",
          ""Line"": [
            {{
              ""DetailType"": ""SalesItemLineDetail"",
              ""Amount"": {model.amount},
              ""SalesItemLineDetail"": {{
                ""ItemRef"": {{
                  ""value"": ""{model.itemId}""
                }}
              }}
            }}
          ],
          ""CustomerRef"": {{
            ""value"": ""{model.customerId}""
          }}
        }}";

        var response = await client.PostAsync(
            $"{config["QuickBooks:BaseUrl"]}/v3/company/{realmId}/invoice?operation=update",
            new StringContent(json, Encoding.UTF8, "application/json"));

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> deleteInvoice(string token, string realmId, invoiceModel model)
    {
        var client = getClient(token);

        var json = $@"{{""Id"": ""{model.id}"", ""SyncToken"": ""{model.syncToken}""}}";

        var response = await client.PostAsync(
            $"{config["QuickBooks:BaseUrl"]}/v3/company/{realmId}/invoice?operation=delete",
            new StringContent(json, Encoding.UTF8, "application/json"));

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> queryInvoices(string token, string realmId, string query)
    {
        var client = getClient(token);
        var encoded = Uri.EscapeDataString(query ?? "select * from Invoice");
        var response = await client.GetAsync($"{config["QuickBooks:BaseUrl"]}/v3/company/{realmId}/query?query={encoded}");
        return await response.Content.ReadAsStringAsync();
    }
}