using MyWebAPI.Models;
using System.Text;
using System.Text.Json;

namespace MyWebAPI.Services
{
    public class PostService : IPostService
    {
        private readonly HttpClient _http;
        private const string BaseUrl = "https://jsonplaceholder.typicode.com/posts";
        private static readonly JsonSerializerOptions _jsonOptions =
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        public PostService()
        {
            _http = new HttpClient();
        }

        public async Task<List<Post>> GetAllAsync()
        {
            var response = await _http.GetAsync(BaseUrl);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<Post>>(json, _jsonOptions)
                   ?? new List<Post>();
        }

        public async Task<Post?> GetByIdAsync(int id)
        {
            var response = await _http.GetAsync($"{BaseUrl}/{id}");
            if (!response.IsSuccessStatusCode) return null;
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<Post>(json, _jsonOptions);
        }

        public async Task<Post?> CreateAsync(Post post)
        {
            var body = new StringContent(
                JsonSerializer.Serialize(post),
                Encoding.UTF8,
                "application/json");
            var response = await _http.PostAsync(BaseUrl, body);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<Post>(json, _jsonOptions);
        }

        public async Task<Post?> UpdateAsync(int id, Post post)
        {
            var body = new StringContent(
                JsonSerializer.Serialize(post),
                Encoding.UTF8,
                "application/json");
            var response = await _http.PutAsync($"{BaseUrl}/{id}", body);
            if (!response.IsSuccessStatusCode) return null;
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<Post>(json, _jsonOptions);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var response = await _http.DeleteAsync($"{BaseUrl}/{id}");
            return response.IsSuccessStatusCode;
        }
    }
}