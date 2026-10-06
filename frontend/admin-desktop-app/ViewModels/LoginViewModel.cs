using System;
using System.Threading.Tasks;
using LaundryAdminApp.Services;

namespace LaundryAdminApp.ViewModels
{
    public class LoginViewModel : BaseViewModel
    {
        public string ServerUrl { get; set; } = "http://localhost:8000";
        public string Email { get; set; }     = "admin@laundryapp.com";
        public string Password { get; set; }  = "admin123";

        public event Action? OnLoginSuccess;

        public void TriggerLoginSuccess() => OnLoginSuccess?.Invoke();
    }
}
