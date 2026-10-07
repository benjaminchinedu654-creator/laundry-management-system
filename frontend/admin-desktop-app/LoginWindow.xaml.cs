using System;
using System.Windows;
using LaundryAdminApp.ViewModels;
using LaundryAdminApp.Services;

namespace LaundryAdminApp
{
    public partial class LoginWindow : Window
    {
        private readonly LoginViewModel _vm;

        public LoginWindow()
        {
            InitializeComponent();
            _vm = new LoginViewModel();
            ServerUrlBox.Text = "https://laundry-backend-k2ez.onrender.com";
            EmailBox.Text     = _vm.Email;
            PasswordBox.Password = _vm.Password;

            _vm.OnLoginSuccess += () =>
            {
                var main = new MainWindow();
                main.Show();
                Close();
            };
        }

        private async void LoginBtn_Click(object sender, RoutedEventArgs e)
        {
            var serverUrl = ServerUrlBox.Text.Trim();
            var email     = EmailBox.Text.Trim();
            var password  = PasswordBox.Password;

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                ErrorText.Text = "Please enter both admin email and password.";
                ErrorPanel.Visibility = Visibility.Visible;
                return;
            }

            LoginBtn.IsEnabled = false;
            StatusText.Text    = "Authenticating...";
            ErrorPanel.Visibility = Visibility.Collapsed;

            try
            {
                ApiService.Instance.SetBaseUrl(serverUrl);
                var res = await ApiService.Instance.LoginAsync(email, password);
                if (res.Success)
                {
                    var main = new MainWindow();
                    main.Show();
                    Close();
                }
                else
                {
                    ErrorText.Text = !string.IsNullOrEmpty(res.Message) ? res.Message : "Invalid admin credentials.";
                    ErrorPanel.Visibility = Visibility.Visible;
                    StatusText.Text = "";
                    LoginBtn.IsEnabled = true;
                }
            }
            catch (Exception ex)
            {
                ErrorText.Text = $"Connection error: {ex.Message}";
                ErrorPanel.Visibility = Visibility.Visible;
                StatusText.Text = "";
                LoginBtn.IsEnabled = true;
            }
        }

        private void CloseBtn_Click(object sender, RoutedEventArgs e) => Close();

        protected override void OnMouseLeftButtonDown(System.Windows.Input.MouseButtonEventArgs e)
        {
            base.OnMouseLeftButtonDown(e);
            DragMove();
        }
    }
}
