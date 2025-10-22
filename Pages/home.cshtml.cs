using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Farm_Alert.Pages
{
    public class homeModel : PageModel
    {
        private readonly ILogger<homeModel> _logger;

        public homeModel(ILogger<homeModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {
            ViewData["Title"] = "Home";
        }

        public IActionResult OnPostNewsletter(string email)
        {
            _logger.LogInformation("Newsletter subscription attempt with email: {Email}", email);
            // Handle newsletter subscription (e.g., save to database)
            return RedirectToPage();
        }
    }
}