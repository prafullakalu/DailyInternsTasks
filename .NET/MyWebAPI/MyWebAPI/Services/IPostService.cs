using MyWebAPI.Models;

namespace MyWebAPI.Services
{
    public interface IPostService
    {
        Task<List<Post>> GetAllAsync();
        Task<Post?> GetByIdAsync(int id);
        Task<Post?> CreateAsync(Post post);
        Task<Post?> UpdateAsync(int id, Post post);
        Task<bool> DeleteAsync(int id);
    }
}