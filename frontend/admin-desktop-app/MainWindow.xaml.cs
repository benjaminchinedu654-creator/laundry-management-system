using System.Windows;
using LaundryAdminApp.ViewModels;

namespace LaundryAdminApp
{
    public partial class MainWindow : Window
    {
        private readonly MainViewModel _vm;

        public MainWindow()
        {
            InitializeComponent();
            _vm = new MainViewModel();
            DataContext = _vm;

            _vm.OnLogoutRequested += () =>
            {
                var login = new LoginWindow();
                login.Show();
                Close();
            };
        }
    }
}
