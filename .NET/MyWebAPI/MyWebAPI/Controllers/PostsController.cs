using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyWebAPI.Models;
using MyWebAPI.Services;

namespace MyWebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly IPostService _postService;

        public PostsController(IPostService postService)
        {
            _postService = postService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var posts = await _postService.GetAllAsync();
            return Ok(posts);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var post = await _postService.GetByIdAsync(id);
            if (post == null)
                return NotFound(new { message = $"Post {id} not found" });
            return Ok(post);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Post post)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var created = await _postService.CreateAsync(post);
            return CreatedAtAction(nameof(GetById), new { id = created!.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Post post)
        {
            var updated = await _postService.UpdateAsync(id, post);
            if (updated == null)
                return NotFound(new { message = $"Post {id} not found" });
            return Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _postService.DeleteAsync(id);
            if (!ok)
                return NotFound(new { message = $"Post {id} not found" });
            return NoContent();
        }
    }
}